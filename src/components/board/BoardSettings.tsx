"use client";

import { useState } from "react";
import { useBoardStore } from "@/store/useBoardStore";
import toast from "react-hot-toast";
import { Settings, X } from "lucide-react";
import type { Board } from "@/types";

interface BoardSettingsProps {
  board: Board;
  open: boolean;
  onClose: () => void;
}

const backgrounds = [
  "#0079bf", "#d29034", "#519839", "#b04632",
  "#89609e", "#cd5a91", "#4bbf6b", "#00aecc",
  "#838c91", "#172b4d",
];

export default function BoardSettings({ board, open, onClose }: BoardSettingsProps) {
  const { updateBoard, deleteBoard } = useBoardStore();
  const [title, setTitle] = useState(board.title);
  const [bg, setBg] = useState(board.background);
  const [visibility, setVisibility] = useState(board.visibility);

  if (!open) return null;

  const handleSave = async () => {
    try {
      await updateBoard(board.id, {
        title: title.trim() || board.title,
        background: bg,
        visibility,
      });
      toast.success("Board updated");
      onClose();
    } catch {
      toast.error("Failed to update board");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background rounded-xl p-6 w-full max-w-md border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings size={20} /> Board Settings
          </h3>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Background</label>
            <div className="flex gap-2 flex-wrap">
              {backgrounds.map((c) => (
                <button
                  key={c}
                  className={`w-10 h-8 rounded ${bg === c ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                  style={{ background: c }}
                  onClick={() => setBg(c)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Board["visibility"])}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="private">Private</option>
              <option value="workspace">Workspace</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-surface-hover transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
