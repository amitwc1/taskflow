import { create } from "zustand";
import type { BoardTemplate } from "@/types";
import { TEMPLATES, TEMPLATE_CATEGORIES, type TemplateCategory } from "@/data/templates";

// ========================
// Template Store
// ========================
// Manages template browsing state: filtering by category,
// search query, and board creation loading state.

interface TemplateState {
  /** All available templates */
  templates: BoardTemplate[];
  /** Available category names */
  categories: readonly string[];
  /** Currently selected category filter (null = show all) */
  selectedCategory: TemplateCategory | null;
  /** Search query for filtering templates by name/description */
  searchQuery: string;
  /** ID of the template currently being created (loading state) */
  creatingTemplateId: string | null;

  // Actions
  setSelectedCategory: (category: TemplateCategory | null) => void;
  setSearchQuery: (query: string) => void;
  setCreatingTemplateId: (id: string | null) => void;
  /** Returns templates filtered by current category + search query */
  getFilteredTemplates: () => BoardTemplate[];
  /** Look up a single template by ID */
  getTemplateById: (id: string) => BoardTemplate | undefined;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: TEMPLATES,
  categories: TEMPLATE_CATEGORIES,
  selectedCategory: null,
  searchQuery: "",
  creatingTemplateId: null,

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setCreatingTemplateId: (id) => set({ creatingTemplateId: id }),

  getFilteredTemplates: () => {
    const { templates, selectedCategory, searchQuery } = get();
    let filtered = templates;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Filter by search query (match name or description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return filtered;
  },

  getTemplateById: (id) => {
    return get().templates.find((t) => t.id === id);
  },
}));
