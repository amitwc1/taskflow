import { create } from "zustand";
import type { Activity } from "@/types";
import { subscribeActivities, subscribeCardActivities } from "@/services/activityService";

interface ActivityState {
  activities: Activity[];
  cardActivities: Activity[];
  subscribe: (boardId: string) => () => void;
  subscribeCard: (cardId: string) => () => void;
  clearCardActivities: () => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [],
  cardActivities: [],

  subscribe: (boardId) => {
    return subscribeActivities(boardId, (activities) => {
      set({ activities });
    });
  },

  subscribeCard: (cardId) => {
    return subscribeCardActivities(cardId, (activities) => {
      set({ cardActivities: activities });
    });
  },

  clearCardActivities: () => set({ cardActivities: [] }),
}));
