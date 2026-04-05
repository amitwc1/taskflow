import { create } from "zustand";
import type { UserProfile } from "@/types";
import { getUserDetails } from "@/services/userService";

interface UserState {
  usersById: Record<string, UserProfile>;
  loadingUserIds: string[];
  ensureUsers: (userIds: string[]) => Promise<void>;
  getUser: (userId: string) => UserProfile | null;
  reset: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  usersById: {},
  loadingUserIds: [],

  ensureUsers: async (userIds) => {
    const { usersById, loadingUserIds } = get();
    const missingUserIds = [...new Set(userIds.filter(Boolean))].filter(
      (userId) => !usersById[userId] && !loadingUserIds.includes(userId)
    );

    if (missingUserIds.length === 0) return;

    set((state) => ({
      loadingUserIds: [...state.loadingUserIds, ...missingUserIds],
    }));

    try {
      const fetchedUsers = await getUserDetails(missingUserIds);
      set((state) => ({
        usersById: { ...state.usersById, ...fetchedUsers },
        loadingUserIds: state.loadingUserIds.filter(
          (userId) => !missingUserIds.includes(userId)
        ),
      }));
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      set((state) => ({
        loadingUserIds: state.loadingUserIds.filter(
          (userId) => !missingUserIds.includes(userId)
        ),
      }));
    }
  },

  getUser: (userId) => get().usersById[userId] || null,

  reset: () => set({ usersById: {}, loadingUserIds: [] }),
}));
