"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useBoardStore } from "@/store/useBoardStore";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  LayoutDashboard, ChevronDown,
  Layers, ChevronsLeft, ChevronsRight,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { workspaces, subscribeWorkspaces } = useWorkspaceStore();
  const { boards, subscribeBoardsByUser } = useBoardStore();
  const params = useParams();
  const pathname = usePathname();
  const activeBoardId = params?.id as string | undefined;

  const [collapsed, setCollapsed] = useState(false);
  const [manualExpandedWs, setManualExpandedWs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      const unsub1 = subscribeWorkspaces(user.uid);
      const unsub2 = subscribeBoardsByUser(user.uid);
      return () => { unsub1(); unsub2(); };
    }
  }, [user, subscribeWorkspaces, subscribeBoardsByUser]);

  const expandedWs = useMemo(() => {
    const next = new Set(manualExpandedWs);
    if (activeBoardId) {
      const activeBoard = boards.find((board) => board.id === activeBoardId);
      if (activeBoard) {
        next.add(activeBoard.workspaceId);
      }
    }
    return next;
  }, [manualExpandedWs, activeBoardId, boards]);

  const toggleWs = (wsId: string) => {
    setManualExpandedWs((prev) => {
      const next = new Set(prev);
      if (next.has(wsId)) next.delete(wsId);
      else next.add(wsId);
      return next;
    });
  };

  // Color palette for workspace initials
  const wsColors = [
    "from-blue-500 to-blue-600",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-pink-500 to-rose-600",
    "from-cyan-500 to-sky-600",
  ];

  const getWsColor = (index: number) => wsColors[index % wsColors.length];

  // Board color dot from background
  const boardDot = (bg: string) => (
    <span
      className="w-2.5 h-2.5 rounded-sm shrink-0"
      style={{ background: bg }}
    />
  );

  /* ─── Collapsed mini sidebar ─── */
  if (collapsed) {
    return (
      <div className="w-12 shrink-0 flex flex-col items-center py-3 gap-1.5 border-r transition-all duration-200 bg-white dark:bg-[#0f172a] border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded-lg transition-colors mb-2 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500"
          title="Expand sidebar"
        >
          <ChevronsRight size={16} />
        </button>
        <Link
          href="/dashboard"
          className={`p-2 rounded-lg transition-colors ${
            pathname === "/dashboard"
              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
              : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-400"
          }`}
          title="Dashboard"
        >
          <LayoutDashboard size={16} />
        </Link>

        <div className="w-6 my-1 border-t border-gray-200 dark:border-gray-700" />

        {workspaces.map((ws, i) => (
          <Link
            key={ws.id}
            href="/dashboard"
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getWsColor(i)} flex items-center justify-center text-[11px] font-bold text-white shadow-sm hover:shadow-md hover:scale-105 transition-all`}
            title={ws.name}
          >
            {ws.name[0].toUpperCase()}
          </Link>
        ))}

        {/* Bottom user avatar */}
        <div className="mt-auto">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[11px] font-bold">
              {(user?.displayName?.[0] || user?.email?.[0] || "?").toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ─── Expanded sidebar ─── */
  return (
    <div className="w-64 shrink-0 flex flex-col border-r transition-all duration-200 overflow-hidden bg-white dark:bg-[#0f172a] border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 font-bold text-sm text-gray-900 dark:text-white"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary to-blue-600">
            <Layers size={15} className="text-white" />
          </div>
          <span className="tracking-tight">TaskFlow</span>
        </Link>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500"
          title="Collapse sidebar"
        >
          <ChevronsLeft size={14} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto list-scroll py-3 px-2">
        {/* Dashboard link */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
            pathname === "/dashboard"
              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold"
              : "text-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-gray-200"
          }`}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        {/* Section label */}
        <div className="flex items-center px-3 mt-5 mb-2 text-gray-500 dark:text-gray-500">
          <span className="text-[10px] font-semibold uppercase tracking-widest">Workspaces</span>
        </div>

        {/* Workspace list */}
        {workspaces.length === 0 ? (
          <div className="mx-2 rounded-xl border border-dashed p-4 text-center border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500">
            <Layers size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs">No workspaces yet</p>
            <p className="text-[10px] mt-0.5 opacity-60">Create one from the dashboard</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {workspaces.map((ws, wsIndex) => {
              const wsBoards = boards.filter((b) => b.workspaceId === ws.id);
              const isExpanded = expandedWs.has(ws.id);

              return (
                <div key={ws.id}>
                  <button
                    onClick={() => toggleWs(ws.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all group text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${getWsColor(wsIndex)} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                      {ws.name[0].toUpperCase()}
                    </div>
                    <span className="truncate font-medium flex-1 text-left">{ws.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-gray-500">
                      {wsBoards.length}
                    </span>
                    <span className={`transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"} text-gray-500 dark:text-gray-600`}>
                      <ChevronDown size={14} />
                    </span>
                  </button>

                  {/* Board list — animated expand */}
                  {isExpanded && (
                    <div className="ml-4 pl-3 border-l-2 border-gray-200 dark:border-gray-700/50 mt-0.5 mb-1 space-y-0.5 fade-in">
                      {wsBoards.map((board) => (
                        <Link
                          key={board.id}
                          href={`/board/${board.id}`}
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-all ${
                            activeBoardId === board.id
                              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold"
                              : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-gray-200"
                          }`}
                        >
                          {boardDot(board.background)}
                          <span className="truncate">{board.title}</span>
                        </Link>
                      ))}
                      {wsBoards.length === 0 && (
                        <p className="text-[11px] px-2.5 py-1.5 italic text-gray-300 dark:text-gray-600">
                          No boards yet
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom user section */}
      <div className="border-t px-3 py-3 border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-8 h-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm">
              {(user?.displayName?.[0] || user?.email?.[0] || "?").toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate text-black dark:text-gray-100">
              {user?.displayName || "User"}
            </p>
            <p className="text-[10px] truncate text-gray-500 dark:text-gray-500">
              {user?.email}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg transition-colors shrink-0 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 hover:text-black dark:hover:text-gray-300"
            title="Log out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
