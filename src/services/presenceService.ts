/**
 * Presence Service
 * Tracks which users are currently viewing a board using Firestore.
 * Updates presence every 30s and marks users offline after 60s of inactivity.
 */

import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserPresence } from "@/types";

const PRESENCE_COLLECTION = "presence";
const HEARTBEAT_INTERVAL = 30_000; // 30 seconds
const OFFLINE_THRESHOLD = 60_000; // 60 seconds

/** Generate a unique presence doc ID */
function getPresenceId(boardId: string, userId: string) {
  return `${boardId}_${userId}`;
}

/** Set user as online on a board */
export function startPresence(params: {
  boardId: string;
  userId: string;
  displayName: string;
  photoURL: string | null;
  email: string | null;
}): () => void {
  const { boardId, userId, displayName, photoURL, email } = params;
  const presenceId = getPresenceId(boardId, userId);
  const presenceRef = doc(db, PRESENCE_COLLECTION, presenceId);

  const data: Omit<UserPresence, "id"> = {
    userId,
    displayName,
    photoURL,
    email,
    boardId,
    lastSeen: Date.now(),
    online: true,
  };

  // Set initial presence
  setDoc(presenceRef, data).catch(console.error);

  // Heartbeat: update lastSeen every 30s
  const interval = setInterval(() => {
    setDoc(presenceRef, { ...data, lastSeen: Date.now() }, { merge: true }).catch(console.error);
  }, HEARTBEAT_INTERVAL);

  // Handle tab close / navigation away
  const handleBeforeUnload = () => {
    deleteDoc(presenceRef).catch(() => {});
  };
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", handleBeforeUnload);
  }

  // Handle visibility change (tab becomes hidden)
  const handleVisibility = () => {
    if (typeof document !== "undefined" && document.hidden) {
      setDoc(presenceRef, { ...data, lastSeen: Date.now(), online: false }, { merge: true }).catch(console.error);
    } else {
      setDoc(presenceRef, { ...data, lastSeen: Date.now(), online: true }, { merge: true }).catch(console.error);
    }
  };
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibility);
  }

  // Return cleanup function
  return () => {
    clearInterval(interval);
    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibility);
    }
    deleteDoc(presenceRef).catch(console.error);
  };
}

/** Subscribe to all online users on a board */
export function subscribePresence(
  boardId: string,
  callback: (users: UserPresence[]) => void
) {
  const q = query(
    collection(db, PRESENCE_COLLECTION),
    where("boardId", "==", boardId)
  );

  return onSnapshot(q, (snap) => {
    const now = Date.now();
    const users = snap.docs
      .map((d) => ({ ...d.data() } as UserPresence))
      .filter((u) => u.online && (now - u.lastSeen) < OFFLINE_THRESHOLD);
    callback(users);
  }, (error) => {
    console.error("Presence subscription error:", error);
    callback([]);
  });
}
