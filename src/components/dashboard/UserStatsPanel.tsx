"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useBoardStore } from "@/store/useBoardStore";
import { getUserActivityCounts } from "@/services/activityService";
import { BarChart3, CheckCircle2, Clock, Activity } from "lucide-react";

interface BoardStats {
  boardId: string;
  boardTitle: string;
  totalCards: number;
  completedCards: number;
  myCards: number;
  myActivityCount: number;
}

export default function UserStatsPanel() {
  const user = useAuthStore((s) => s.user);
  const { boards } = useBoardStore();
  const [stats, setStats] = useState<BoardStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || boards.length === 0) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      const results: BoardStats[] = [];

      // Only fetch stats for boards the user is a member of
      const myBoards = boards.filter((b) => b.members?.includes(user.uid));

      for (const board of myBoards.slice(0, 5)) {
        try {
          const counts = await getUserActivityCounts(board.id);
          results.push({
            boardId: board.id,
            boardTitle: board.title,
            totalCards: 0,
            completedCards: 0,
            myCards: 0,
            myActivityCount: counts[user.uid] || 0,
          });
        } catch {
          // Skip boards that fail
        }
      }

      setStats(results);
      setLoading(false);
    };

    fetchStats();
  }, [user, boards]);

  if (!user) return null;
  if (loading) return null;
  if (stats.length === 0) return null;

  const totalActivity = stats.reduce((sum, s) => sum + s.myActivityCount, 0);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-primary" size={20} />
        <h2 className="font-semibold text-lg">Your Activity</h2>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-primary" />
            <span className="text-xs text-muted">Total Actions</span>
          </div>
          <p className="text-2xl font-bold">{totalActivity}</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={14} className="text-green-500" />
            <span className="text-xs text-muted">Boards Active</span>
          </div>
          <p className="text-2xl font-bold">{stats.length}</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-amber-500" />
            <span className="text-xs text-muted">Avg per Board</span>
          </div>
          <p className="text-2xl font-bold">
            {stats.length > 0 ? Math.round(totalActivity / stats.length) : 0}
          </p>
        </div>
      </div>

      {/* Per-board stats */}
      <div className="space-y-2">
        {stats.map((s) => (
          <div key={s.boardId} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
            <span className="text-sm font-medium truncate">{s.boardTitle}</span>
            <span className="text-xs text-muted shrink-0 ml-2">
              {s.myActivityCount} actions
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
