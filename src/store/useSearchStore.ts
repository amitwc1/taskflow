import { create } from "zustand";
import type { SearchFilters, Card, FilterPreset } from "@/types";
import {
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SearchState {
  filters: SearchFilters;
  presets: FilterPreset[];
  setFilters: (filters: SearchFilters) => void;
  clearFilters: () => void;
  filterCards: (cards: Card[]) => Card[];
  subscribePresets: (boardId: string, userId: string) => () => void;
  savePreset: (boardId: string, userId: string, name: string) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
  loadPreset: (preset: FilterPreset) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  filters: {},
  presets: [],

  setFilters: (filters) => set({ filters }),

  clearFilters: () => set({ filters: {} }),

  filterCards: (cards) => {
    const { filters } = get();
    let result = [...cards];

    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(kw) ||
          c.description?.toLowerCase().includes(kw)
      );
    }

    if (filters.members && filters.members.length > 0) {
      result = result.filter((c) =>
        filters.members!.some((m) => c.assignedMembers?.includes(m))
      );
    }

    if (filters.labels && filters.labels.length > 0) {
      result = result.filter((c) =>
        filters.labels!.some((lColor) =>
          c.labels?.some((l) => l.color === lColor)
        )
      );
    }

    if (filters.dueDateFrom) {
      result = result.filter(
        (c) => c.dueDate && c.dueDate >= filters.dueDateFrom!
      );
    }

    if (filters.dueDateTo) {
      result = result.filter(
        (c) => c.dueDate && c.dueDate <= filters.dueDateTo!
      );
    }

    if (filters.hasChecklist) {
      result = result.filter((c) => c.checklist && c.checklist.length > 0);
    }

    if (filters.isOverdue) {
      result = result.filter(
        (c) => c.dueDate && c.dueDate < Date.now()
      );
    }

    return result;
  },

  subscribePresets: (boardId, userId) => {
    const q = query(
      collection(db, "filterPresets"),
      where("boardId", "==", boardId),
      where("userId", "==", userId)
    );
    return onSnapshot(q, (snap) => {
      const presets = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as FilterPreset))
        .sort((a, b) => b.createdAt - a.createdAt);
      set({ presets });
    }, (error) => {
      console.error("Filter presets subscription error:", error);
      set({ presets: [] });
    });
  },

  savePreset: async (boardId, userId, name) => {
    const { filters } = get();
    await addDoc(collection(db, "filterPresets"), {
      boardId,
      userId,
      name,
      filters,
      createdAt: Date.now(),
    });
  },

  deletePreset: async (id) => {
    await deleteDoc(doc(db, "filterPresets", id));
  },

  loadPreset: (preset) => {
    set({ filters: preset.filters });
  },
}));
