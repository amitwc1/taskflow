/**
 * Presence Store
 * Tracks which users are currently online on a board.
 */

import { create } from "zustand";
import type { UserPresence } from "@/types";
import { startPresence, subscribePresence } from "@/services/presenceService";

interface PresenceState {
  onlineUsers: UserPresence[];
  startTracking: (params: {
    boardId: string;
    userId: string;
    displayName: string;
    photoURL: string | null;
    email: string | null;
  }) => () => void;
  subscribeOnlineUsers: (boardId: string) => () => void;
  reset: () => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  onlineUsers: [],

  startTracking: (params) => {
    return startPresence(params);
  },

  subscribeOnlineUsers: (boardId) => {
    return subscribePresence(boardId, (users) => {
      set({ onlineUsers: users });
    });
  },

  reset: () => set({ onlineUsers: [] }),
}));
