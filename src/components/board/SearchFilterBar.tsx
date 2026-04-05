"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchStore } from "@/store/useSearchStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";
import type { SearchFilters } from "@/types";
import { Search, X, Filter, Save, Trash2, Bookmark } from "lucide-react";
import toast from "react-hot-toast";
import { LABEL_COLOR_OPTIONS } from "@/services/labelService";

interface SearchFilterBarProps {
  boardId: string;
  memberIds: string[];
}

export default function SearchFilterBar({ boardId, memberIds }: SearchFilterBarProps) {
  const user = useAuthStore((s) => s.user);
  const usersById = useUserStore((state) => state.usersById);
  const ensureUsers = useUserStore((state) => state.ensureUsers);
  const {
    filters,
    presets,
    setFilters,
    clearFilters,
    subscribePresets,
    savePreset,
    deletePreset,
    loadPreset,
  } = useSearchStore();

  const [expanded, setExpanded] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    ensureUsers(memberIds);
  }, [memberIds, ensureUsers]);

  const members = useMemo(
    () =>
      memberIds.map((memberId) => ({
        id: memberId,
        name: usersById[memberId]?.name || memberId,
      })),
    [memberIds, usersById]
  );

  const hasFilters =
    filters.keyword ||
    (filters.members && filters.members.length > 0) ||
    (filters.labels && filters.labels.length > 0) ||
    filters.isOverdue ||
    filters.hasChecklist;

  const updateFilter = (patch: Partial<SearchFilters>) => {
    setFilters({ ...filters, ...patch });
  };

  const handleSavePreset = async () => {
    if (!presetName.trim() || !user) return;
    try {
      await savePreset(boardId, user.uid, presetName.trim());
      setPresetName("");
      toast.success("Filter preset saved");
    } catch {
      toast.error("Failed to save preset");
    }
  };

  return (
    <div className="space-y-2">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/10 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 border-0"
            placeholder="Search cards..."
            value={filters.keyword || ""}
            onChange={(e) => updateFilter({ keyword: e.target.value || undefined })}
          />
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
            expanded || hasFilters
              ? "bg-white/30 text-white"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          <Filter size={14} />
          {hasFilters && <span className="w-1.5 h-1.5 bg-accent rounded-full" />}
        </button>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 text-sm"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 space-y-3">
          {/* Labels */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Labels</label>
            <div className="flex flex-wrap gap-1">
              {LABEL_COLOR_OPTIONS.map((l) => (
                <button
                  key={l.color}
                  onClick={() => {
                    const current = filters.labels || [];
                    const newLabels = current.includes(l.color)
                      ? current.filter((c) => c !== l.color)
                      : [...current, l.color];
                    updateFilter({ labels: newLabels.length > 0 ? newLabels : undefined });
                  }}
                  className={`w-7 h-5 rounded ${
                    filters.labels?.includes(l.color)
                      ? "ring-2 ring-white ring-offset-1 ring-offset-transparent"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{ background: l.color }}
                  title={l.name}
                />
              ))}
            </div>
          </div>

          {/* Members */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">Members</label>
            <div className="flex flex-wrap gap-1">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    const current = filters.members || [];
                    const newMembers = current.includes(m.id)
                      ? current.filter((x) => x !== m.id)
                      : [...current, m.id];
                    updateFilter({ members: newMembers.length > 0 ? newMembers : undefined });
                  }}
                  className={`px-2 py-1 rounded text-xs ${
                    filters.members?.includes(m.id)
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                  title={m.name}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick filters */}
          <div className="flex gap-2">
            <button
              onClick={() => updateFilter({ isOverdue: !filters.isOverdue || undefined })}
              className={`px-2.5 py-1 rounded text-xs ${
                filters.isOverdue
                  ? "bg-accent text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => updateFilter({ hasChecklist: !filters.hasChecklist || undefined })}
              className={`px-2.5 py-1 rounded text-xs ${
                filters.hasChecklist
                  ? "bg-primary text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              Has Checklist
            </button>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/10">
            <input
              className="flex-1 px-2 py-1 rounded bg-white/10 text-white placeholder-white/40 text-xs focus:outline-none"
              placeholder="Save as preset..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
            />
            <button
              onClick={handleSavePreset}
              className="p-1 text-white/70 hover:text-white"
            >
              <Save size={14} />
            </button>
            {presets.length > 0 && (
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="p-1 text-white/70 hover:text-white"
              >
                <Bookmark size={14} />
              </button>
            )}
          </div>

          {showPresets && presets.length > 0 && (
            <div className="space-y-1">
              {presets.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <button
                    onClick={() => loadPreset(p)}
                    className="flex-1 text-left px-2 py-1 rounded bg-white/10 text-xs text-white/80 hover:bg-white/20"
                  >
                    {p.name}
                  </button>
                  <button
                    onClick={() => deletePreset(p.id)}
                    className="text-white/40 hover:text-accent p-0.5"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
