"use client";

import type { ViewMode } from "@/types";
import { LayoutGrid, Calendar, GanttChart, Table2 } from "lucide-react";

interface ViewSwitcherProps {
  current: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const views: { mode: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
  { mode: "board", icon: LayoutGrid, label: "Board" },
  { mode: "calendar", icon: Calendar, label: "Calendar" },
  { mode: "timeline", icon: GanttChart, label: "Timeline" },
  { mode: "table", icon: Table2, label: "Table" },
];

export default function ViewSwitcher({ current, onChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center gap-0.5 bg-white/10 rounded-lg p-0.5">
      {views.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            current === mode
              ? "bg-white/20 text-white"
              : "text-white/60 hover:text-white/80"
          }`}
          title={label}
        >
          <Icon size={14} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
