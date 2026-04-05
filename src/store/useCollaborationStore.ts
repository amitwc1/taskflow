/**
 * Collaboration Store
 * Manages board members, roles, and collaboration actions.
 */

import { create } from "zustand";
import type { BoardMember, Role, Board } from "@/types";
import {
  subscribeBoardMembers,
  inviteMember,
  removeMember,
  changeMemberRole,
  getUserRole,
  isAdmin,
  canEdit,
} from "@/services/collaborationService";

interface CollaborationState {
  members: BoardMember[];
  currentUserRole: Role;
  subscribeMemberList: (boardId: string) => () => void;
  setCurrentUserRole: (board: Board, userId: string) => void;
  invite: (params: {
    boardId: string;
    email: string;
    role: Role;
    invitedBy: { uid: string; displayName: string; photoURL: string | null };
  }) => Promise<{ success: boolean; error?: string }>;
  remove: (params: {
    boardId: string;
    userId: string;
    removedBy: { uid: string; displayName: string; photoURL: string | null };
  }) => Promise<void>;
  changeRole: (params: {
    boardId: string;
    userId: string;
    newRole: Role;
    changedBy: { uid: string; displayName: string; photoURL: string | null };
  }) => Promise<void>;
  isAdmin: (board: Board, userId: string) => boolean;
  canEdit: (board: Board, userId: string) => boolean;
  reset: () => void;
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
  members: [],
  currentUserRole: "member",

  subscribeMemberList: (boardId) => {
    return subscribeBoardMembers(boardId, (members) => {
      set({ members });
    });
  },

  setCurrentUserRole: (board, userId) => {
    set({ currentUserRole: getUserRole(board, userId) });
  },

  invite: async (params) => {
    return await inviteMember(params);
  },

  remove: async (params) => {
    await removeMember(params);
  },

  changeRole: async (params) => {
    await changeMemberRole(params);
  },

  isAdmin: (board, userId) => isAdmin(board, userId),
  canEdit: (board, userId) => canEdit(board, userId),

  reset: () => set({ members: [], currentUserRole: "member" }),
}));
