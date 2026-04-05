"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useBoardStore } from "@/store/useBoardStore";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import UserStatsPanel from "@/components/dashboard/UserStatsPanel";
import { Plus, Trash2, LayoutGrid, Loader2, Users } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import type { Workspace, Board } from "@/types";

function CreateWorkspaceModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, desc: string) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background rounded-xl p-6 w-full max-w-md border border-border" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Create Workspace</h3>
        <input
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Workspace name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <textarea
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground mb-4 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Description (optional)"
          rows={3}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-surface-hover transition-colors">
            Cancel
          </button>
          <button
            onClick={() => {
              if (name.trim()) {
                onCreate(name.trim(), desc.trim());
                setName("");
                setDesc("");
              }
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateBoardModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, bg: string, visibility: "private" | "workspace" | "public") => void;
}) {
  const [title, setTitle] = useState("");
  const [bg, setBg] = useState("#0079bf");
  const [visibility, setVisibility] = useState<"private" | "workspace" | "public">("workspace");

  const backgrounds = [
    "#0079bf", "#d29034", "#519839", "#b04632",
    "#89609e", "#cd5a91", "#4bbf6b", "#00aecc",
    "#838c91",
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background rounded-xl p-6 w-full max-w-md border border-border" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Create Board</h3>
        <div className="w-full h-24 rounded-lg mb-4" style={{ background: bg }} />
        <input
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Board title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div className="mb-3">
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
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as "private" | "workspace" | "public")}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="private">Private</option>
            <option value="workspace">Workspace</option>
            <option value="public">Public</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-surface-hover transition-colors">
            Cancel
          </button>
          <button
            onClick={() => {
              if (title.trim()) {
                onCreate(title.trim(), bg, visibility);
                setTitle("");
              }
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkspaceSection({ workspace, boards: allBoards }: { workspace: Workspace; boards: Board[] }) {
  const user = useAuthStore((s) => s.user);
  const { createBoard, deleteBoard } = useBoardStore();
  const { deleteWorkspace } = useWorkspaceStore();
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const workspaceBoards = allBoards.filter((b) => b.workspaceId === workspace.id);

  const handleCreateBoard = async (
    title: string,
    bg: string,
    visibility: "private" | "workspace" | "public"
  ) => {
    if (!user) return;
    try {
      await createBoard({
        title,
        workspaceId: workspace.id,
        ownerId: user.uid,
        background: bg,
        visibility,
        members: [user.uid],
        memberEmails: [user.email || ""],
        memberRoles: { [user.uid]: "admin" },
      });
      setShowCreateBoard(false);
      toast.success("Board created");
    } catch {
      toast.error("Failed to create board");
    }
  };

  const handleDeleteWorkspace = async () => {
    if (confirm("Delete this workspace and all its boards?")) {
      try {
        // Delete all boards in workspace
        for (const b of workspaceBoards) {
          await deleteBoard(b.id);
        }
        await deleteWorkspace(workspace.id);
        toast.success("Workspace deleted");
      } catch {
        toast.error("Failed to delete workspace");
      }
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (confirm("Delete this board?")) {
      try {
        await deleteBoard(boardId);
        toast.success("Board deleted");
      } catch {
        toast.error("Failed to delete board");
      }
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
          {workspace.name[0].toUpperCase()}
        </div>
        <h2 className="font-semibold text-lg">{workspace.name}</h2>
        {workspace.ownerId === user?.uid && (
          <button
            onClick={handleDeleteWorkspace}
            className="ml-auto text-muted hover:text-accent transition-colors p-1"
            title="Delete workspace"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {workspaceBoards.map((board) => (
          <div key={board.id} className="relative group">
            <Link
              href={`/board/${board.id}`}
              className="block h-24 rounded-lg p-3 text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ background: board.background }}
            >
              {board.title}
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDeleteBoard(board.id);
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/40 text-white p-1 rounded transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          onClick={() => setShowCreateBoard(true)}
          className="h-24 rounded-lg bg-surface hover:bg-surface-hover transition-colors flex items-center justify-center gap-2 text-muted border border-dashed border-border"
        >
          <Plus size={18} />
          Create board
        </button>
      </div>
      <CreateBoardModal
        open={showCreateBoard}
        onClose={() => setShowCreateBoard(false)}
        onCreate={handleCreateBoard}
      />
    </div>
  );
}

function DashboardContent() {
  const user = useAuthStore((s) => s.user);
  const { workspaces, loading, subscribeWorkspaces, createWorkspace } = useWorkspaceStore();
  const { boards, subscribeBoardsByUser } = useBoardStore();
  const [showCreateWs, setShowCreateWs] = useState(false);

  useEffect(() => {
    if (user) {
      const unsub1 = subscribeWorkspaces(user.uid);
      const unsub2 = subscribeBoardsByUser(user.uid);
      return () => {
        unsub1();
        unsub2();
      };
    }
  }, [user, subscribeWorkspaces, subscribeBoardsByUser]);

  const handleCreateWorkspace = async (name: string, desc: string) => {
    if (!user) return;
    try {
      await createWorkspace(name, desc, user.uid);
      setShowCreateWs(false);
      toast.success("Workspace created");
    } catch {
      toast.error("Failed to create workspace");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutGrid className="text-primary" size={24} />
            <h1 className="text-2xl font-bold">Your Workspaces</h1>
          </div>
          <button
            onClick={() => setShowCreateWs(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus size={18} />
            New Workspace
          </button>
        </div>

        {workspaces.length === 0 && boards.length === 0 ? (
          <div className="text-center py-16">
            <LayoutGrid className="mx-auto text-muted mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">No workspaces yet</h2>
            <p className="text-muted mb-6">Create your first workspace to get started</p>
            <button
              onClick={() => setShowCreateWs(true)}
              className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Create Workspace
            </button>
          </div>
        ) : (
          <>
            <UserStatsPanel />
            {workspaces.map((ws) => <WorkspaceSection key={ws.id} workspace={ws} boards={boards} />)}
            {/* Shared boards not in any of the user's workspaces */}
            {(() => {
              const wsIds = new Set(workspaces.map((ws) => ws.id));
              const sharedBoards = boards.filter((b) => !wsIds.has(b.workspaceId));
              if (sharedBoards.length === 0) return null;
              return (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded bg-secondary/20 text-secondary flex items-center justify-center">
                      <Users size={16} />
                    </div>
                    <h2 className="font-semibold text-lg">Shared with me</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sharedBoards.map((board) => (
                      <Link
                        key={board.id}
                        href={`/board/${board.id}`}
                        className="block h-24 rounded-lg p-3 text-white font-semibold hover:opacity-90 transition-opacity"
                        style={{ background: board.background }}
                      >
                        {board.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
        )}

        <CreateWorkspaceModal
          open={showCreateWs}
          onClose={() => setShowCreateWs(false)}
          onCreate={handleCreateWorkspace}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <DashboardContent />
        </div>
      </div>
    </AuthGuard>
  );
}
