/**
 * Collaboration Service
 * Handles board membership, role management, and member operations.
 * Only admins can add/remove members and change roles.
 */

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  writeBatch,
  onSnapshot,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Role, BoardMember, Board } from "@/types";
import { createNotification } from "./notificationService";
import { logActivity } from "./activityService";

// ========================
// Role Helpers
// ========================

/** Check if a user has admin role on a board */
export function isAdmin(board: Board, userId: string): boolean {
  return board.memberRoles?.[userId] === "admin" || board.ownerId === userId;
}

/** Check if a user can edit (admin or member) */
export function canEdit(board: Board, userId: string): boolean {
  const role = board.memberRoles?.[userId];
  return role === "admin" || role === "member" || board.ownerId === userId;
}

/** Check if a user is viewer-only */
export function isViewer(board: Board, userId: string): boolean {
  return board.memberRoles?.[userId] === "viewer";
}

/** Get user role on a board */
export function getUserRole(board: Board, userId: string): Role {
  if (board.ownerId === userId) return "admin";
  return board.memberRoles?.[userId] || "member";
}

// ========================
// Member Management
// ========================

/** Invite a user to a board by email */
export async function inviteMember(params: {
  boardId: string;
  email: string;
  role: Role;
  invitedBy: { uid: string; displayName: string; photoURL: string | null };
}): Promise<{ success: boolean; error?: string }> {
  const { boardId, email, role, invitedBy } = params;
  const trimmed = email.trim().toLowerCase();

  // Find user document by email
  const q = query(collection(db, "users"), where("email", "==", trimmed));
  const snap = await getDocs(q);

  if (snap.empty) {
    return { success: false, error: "No user found with that email" };
  }

  const userDoc = snap.docs[0];
  const userId = userDoc.id;
  const userData = userDoc.data();

  // Get current board data
  const boardRef = doc(db, "boards", boardId);
  const boardSnap = await getDoc(boardRef);
  if (!boardSnap.exists()) {
    return { success: false, error: "Board not found" };
  }

  const boardData = boardSnap.data() as Board;

  if (boardData.members?.includes(userId)) {
    return { success: false, error: "User is already a member" };
  }

  // Update board with new member
  const updatedMembers = [...(boardData.members || []), userId];
  const updatedEmails = [...(boardData.memberEmails || []), trimmed];
  const updatedRoles = { ...(boardData.memberRoles || {}), [userId]: role };

  await updateDoc(boardRef, {
    members: updatedMembers,
    memberEmails: updatedEmails,
    memberRoles: updatedRoles,
    updatedAt: Date.now(),
  });

  // Also add user to the workspace so they can see it on their dashboard
  if (boardData.workspaceId) {
    const wsRef = doc(db, "workspaces", boardData.workspaceId);
    try {
      await updateDoc(wsRef, {
        members: arrayUnion(userId),
      });
    } catch (e) {
      // If workspace update fails (e.g., permissions), the board invite still succeeded
      console.warn("Could not add user to workspace:", e);
    }
  }

  // Send notification to invited user
  await createNotification({
    userId,
    type: "board_invited",
    title: "Board Invitation",
    message: `${invitedBy.displayName} invited you to the board "${boardData.title}"`,
    boardId,
  });

  // Log activity
  await logActivity({
    boardId,
    userId: invitedBy.uid,
    userName: invitedBy.displayName,
    userPhoto: invitedBy.photoURL,
    action: "member_invited",
    details: `invited ${userData.name || userData.displayName || trimmed} as ${role}`,
    metadata: { invitedUserId: userId, invitedEmail: trimmed, role },
  });

  return { success: true };
}

/** Remove a member from a board */
export async function removeMember(params: {
  boardId: string;
  userId: string;
  removedBy: { uid: string; displayName: string; photoURL: string | null };
}): Promise<void> {
  const { boardId, userId, removedBy } = params;

  const boardRef = doc(db, "boards", boardId);
  const boardSnap = await getDoc(boardRef);
  if (!boardSnap.exists()) return;

  const boardData = boardSnap.data() as Board;
  if (!boardData.members?.includes(userId)) return;

  // Look up the user's email from users collection for reliable removal
  let userEmail: string | null = null;
  try {
    const userSnap = await getDoc(doc(db, "users", userId));
    if (userSnap.exists()) {
      userEmail = userSnap.data().email || null;
    }
  } catch {
    // fall back to removing by index if user doc can't be read
  }

  const updatedMembers = boardData.members.filter((m) => m !== userId);
  const updatedEmails = userEmail
    ? (boardData.memberEmails || []).filter((e) => e !== userEmail)
    : (boardData.memberEmails || []).filter((_, i) => i !== boardData.members.indexOf(userId));
  const updatedRoles = { ...(boardData.memberRoles || {}) };
  delete updatedRoles[userId];

  await updateDoc(boardRef, {
    members: updatedMembers,
    memberEmails: updatedEmails,
    memberRoles: updatedRoles,
    updatedAt: Date.now(),
  });

  // Notify removed user
  await createNotification({
    userId,
    type: "member_removed",
    title: "Removed from Board",
    message: `${removedBy.displayName} removed you from the board "${boardData.title}"`,
    boardId,
  });

  // Log activity
  await logActivity({
    boardId,
    userId: removedBy.uid,
    userName: removedBy.displayName,
    userPhoto: removedBy.photoURL,
    action: "member_removed",
    details: `removed a member from the board`,
    metadata: { removedUserId: userId },
  });
}

/** Change a member's role on a board */
export async function changeMemberRole(params: {
  boardId: string;
  userId: string;
  newRole: Role;
  changedBy: { uid: string; displayName: string; photoURL: string | null };
}): Promise<void> {
  const { boardId, userId, newRole, changedBy } = params;

  const boardRef = doc(db, "boards", boardId);
  const boardSnap = await getDoc(boardRef);
  if (!boardSnap.exists()) return;

  const boardData = boardSnap.data() as Board;
  const oldRole = boardData.memberRoles?.[userId] || "member";

  const updatedRoles = { ...(boardData.memberRoles || {}), [userId]: newRole };

  await updateDoc(boardRef, {
    memberRoles: updatedRoles,
    updatedAt: Date.now(),
  });

  // Log activity
  await logActivity({
    boardId,
    userId: changedBy.uid,
    userName: changedBy.displayName,
    userPhoto: changedBy.photoURL,
    action: "member_role_changed",
    details: `changed role from ${oldRole} to ${newRole}`,
    metadata: { targetUserId: userId, oldRole, newRole },
  });
}

/** Get enriched member data for a board */
export async function getBoardMembers(board: Board): Promise<BoardMember[]> {
  const members: BoardMember[] = [];

  for (const uid of board.members || []) {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      members.push({
        userId: uid,
        email: data.email || "",
        displayName: data.name || data.displayName || data.email || "Unknown",
        photoURL: data.photoURL || null,
        role: board.memberRoles?.[uid] || (board.ownerId === uid ? "admin" : "member"),
        joinedAt: data.createdAt || 0,
      });
    }
  }

  return members;
}

/** Subscribe to board members (re-fetches whenever board doc changes) */
export function subscribeBoardMembers(
  boardId: string,
  callback: (members: BoardMember[]) => void
) {
  return onSnapshot(doc(db, "boards", boardId), async (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }
    const boardData = { id: snap.id, ...snap.data() } as Board;
    const members = await getBoardMembers(boardData);
    callback(members);
  }, (error) => {
    console.error("Board members subscription error:", error);
    callback([]);
  });
}
