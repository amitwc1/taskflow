"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import type { BoardTemplate } from "@/types";

interface TemplatePreviewProps {
  template: BoardTemplate;
  onClose: () => void;
  onUse: (customTitle?: string) => void;
  creating: boolean;
}

// ========================
// TemplatePreview
// ========================
// Full-screen preview modal showing the template's board structure,
// labels, and a scrollable miniature board with list columns and cards.

export default function TemplatePreview({
  template,
  onClose,
  onUse,
  creating,
}: TemplatePreviewProps) {
  const [boardTitle, setBoardTitle] = useState(template.name);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl w-full max-w-4xl border border-border max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div
          className="relative h-28 flex items-end p-6"
          style={{ background: template.background }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
          <div>
            <span className="text-3xl mr-3">{template.icon}</span>
            <span className="text-white text-xl font-bold align-middle">
              {template.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-sm text-muted">{template.description}</p>

          {/* Board title input */}
          <div>
            <label className="block text-sm font-medium mb-1">Board Title</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              placeholder="Enter a custom board title..."
            />
          </div>

          {/* Labels preview */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Default Labels</h3>
            <div className="flex flex-wrap gap-2">
              {template.labels.map((l, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded text-xs text-white font-medium"
                  style={{ background: l.color }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          </div>

          {/* Board structure preview — horizontal scrollable miniature board */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Board Structure</h3>
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3 min-w-max">
                {template.lists.map((list, li) => (
                  <div
                    key={li}
                    className="w-56 shrink-0 rounded-xl bg-surface border border-border"
                  >
                    {/* List header */}
                    <div className="px-3 py-2 border-b border-border">
                      <h4 className="text-xs font-semibold truncate">
                        {list.title}
                      </h4>
                    </div>

                    {/* Sample cards */}
                    <div className="p-2 space-y-1.5">
                      {list.cards.length === 0 ? (
                        <p className="text-[10px] text-muted italic px-1">
                          No cards
                        </p>
                      ) : (
                        list.cards.map((card, ci) => (
                          <div
                            key={ci}
                            className="px-2.5 py-2 bg-background rounded-lg border border-border text-xs"
                          >
                            {/* Mini label dots */}
                            <div className="flex gap-1 mb-1">
                              {template.labels.slice(0, 3).map((l, idx) => (
                                <div
                                  key={idx}
                                  className="w-6 h-1 rounded-full"
                                  style={{ background: l.color }}
                                />
                              ))}
                            </div>
                            <p className="leading-snug font-medium">{card.title}</p>
                            {card.description && (
                              <p className="text-[10px] text-muted mt-0.5 line-clamp-2">
                                {card.description}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-between items-center">
          <div className="text-xs text-muted">
            {template.lists.length} lists · {template.lists.reduce((s, l) => s + l.cards.length, 0)} cards · {template.labels.length} labels
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg hover:bg-surface-hover transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => onUse(boardTitle.trim() || undefined)}
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
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
      </div>
    </div>
  );
}
