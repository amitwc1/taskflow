"use client";

import { useState } from "react";
import { Eye, Loader2, Plus, Search, X } from "lucide-react";
import type { BoardTemplate } from "@/types";
import { useTemplateStore } from "@/store/useTemplateStore";
import type { TemplateCategory } from "@/data/templates";
import TemplatePreview from "./TemplatePreview";

interface TemplateSelectorProps {
  /** Called when user picks a template — parent handles board creation */
  onSelect: (templateId: string, customTitle?: string) => Promise<void>;
  onClose: () => void;
  open: boolean;
}

export default function TemplateSelector({ onSelect, onClose, open }: TemplateSelectorProps) {
  // Zustand store for template browsing state
  const {
    categories,
    selectedCategory,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    getFilteredTemplates,
  } = useTemplateStore();

  const filteredTemplates = getFilteredTemplates();
  const [previewTemplate, setPreviewTemplate] = useState<BoardTemplate | null>(null);
  const [creatingId, setCreatingId] = useState<string | null>(null);

  if (!open) return null;

  const handleUseTemplate = async (template: BoardTemplate, customTitle?: string) => {
    setCreatingId(template.id);
    try {
      await onSelect(template.id, customTitle);
    } finally {
      setCreatingId(null);
    }
  };

  // Group filtered templates by category for display
  const grouped = filteredTemplates.reduce<Record<string, BoardTemplate[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-background rounded-xl w-full max-w-4xl border border-border max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Template Library</h2>
                <p className="text-sm text-muted mt-1">
                  Choose a premium template to instantly create a structured board with lists, cards, and labels.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors text-muted"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category filter pills */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === null
                    ? "bg-primary text-white"
                    : "bg-surface hover:bg-surface-hover text-muted"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat ? null : (cat as TemplateCategory)
                    )
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-white"
                      : "bg-surface hover:bg-surface-hover text-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Template grid */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {Object.keys(grouped).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted text-sm">No templates match your search.</p>
              </div>
            ) : (
              Object.entries(grouped).map(([cat, templates]) => (
                <div key={cat}>
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                    {cat}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="rounded-xl border border-border overflow-hidden group hover:shadow-lg transition-shadow"
                      >
                        {/* Color banner */}
                        <div
                          className="h-20 flex items-end p-3 relative"
                          style={{ background: template.background }}
                        >
                          <span className="text-3xl absolute top-3 left-3">
                            {template.icon}
                          </span>
                          {/* Preview button */}
                          <button
                            onClick={() => setPreviewTemplate(template)}
                            className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Preview template"
                          >
                            <Eye size={14} />
                          </button>
                        </div>

                        {/* Info */}
                        <div className="p-3">
                          <h4 className="font-semibold text-sm">{template.name}</h4>
                          <p className="text-xs text-muted mt-1 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted">
                            <span>{template.lists.length} lists</span>
                            <span>
                              {template.lists.reduce((sum, l) => sum + l.cards.length, 0)} cards
                            </span>
                            <span>{template.labels.length} labels</span>
                          </div>

                          {/* Use template button */}
                          <button
                            onClick={() => handleUseTemplate(template)}
                            disabled={creatingId !== null}
                            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {creatingId === template.id ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <Plus size={14} />
                                Use Template
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} available
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg hover:bg-surface-hover transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Preview modal (on top) */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={(customTitle) => handleUseTemplate(previewTemplate, customTitle)}
          creating={creatingId === previewTemplate.id}
        />
      )}
    </>
  );
}
