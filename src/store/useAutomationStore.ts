import { create } from "zustand";
import type { AutomationRule } from "@/types";
import {
  subscribeAutomations,
  createAutomation,
  updateAutomation,
  deleteAutomation,
} from "@/services/automationService";

interface AutomationState {
  rules: AutomationRule[];
  subscribe: (boardId: string) => () => void;
  create: (
    rule: Omit<AutomationRule, "id" | "executionCount" | "lastExecuted" | "createdAt">
  ) => Promise<string>;
  update: (id: string, data: Partial<AutomationRule>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useAutomationStore = create<AutomationState>((set) => ({
  rules: [],

  subscribe: (boardId) => {
    return subscribeAutomations(boardId, (rules) => {
      set({ rules });
    });
  },

  create: async (rule) => {
    return await createAutomation(rule);
  },

  update: async (id, data) => {
    await updateAutomation(id, data);
  },

  remove: async (id) => {
    await deleteAutomation(id);
  },
}));
