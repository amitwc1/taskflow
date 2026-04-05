"use client";

import { useActivityStore } from "@/store/useActivityStore";
import { useEffect, useState } from "react";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import { Activity as ActivityIcon, X, Filter, User } from "lucide-react";
import type { Activity } from "@/types";

interface ActivityLogProps {
  boardId: string;
  open: boolean;
  onClose: () => void;
}

// Color-coded action icons with background colors
const actionConfig: Record<string, { icon: string; color: string }> = {
  card_created: { icon: "🆕", color: "bg-green-500/10 text-green-600" },
  card_moved: { icon: "📦", color: "bg-blue-500/10 text-blue-600" },
  card_updated: { icon: "✏️", color: "bg-yellow-500/10 text-yellow-600" },
  card_deleted: { icon: "🗑️", color: "bg-red-500/10 text-red-600" },
  card_assigned: { icon: "👤", color: "bg-purple-500/10 text-purple-600" },
  card_unassigned: { icon: "👤", color: "bg-orange-500/10 text-orange-600" },
  list_created: { icon: "📋", color: "bg-teal-500/10 text-teal-600" },
  list_deleted: { icon: "🗑️", color: "bg-red-500/10 text-red-600" },
  list_renamed: { icon: "✏️", color: "bg-yellow-500/10 text-yellow-600" },
  comment_added: { icon: "💬", color: "bg-indigo-500/10 text-indigo-600" },
  comment_deleted: { icon: "💬", color: "bg-red-500/10 text-red-600" },
  label_added: { icon: "🏷️", color: "bg-pink-500/10 text-pink-600" },
  label_removed: { icon: "🏷️", color: "bg-gray-500/10 text-gray-600" },
  checklist_completed: { icon: "✅", color: "bg-green-500/10 text-green-600" },
  attachment_added: { icon: "📎", color: "bg-cyan-500/10 text-cyan-600" },
  due_date_set: { icon: "📅", color: "bg-amber-500/10 text-amber-600" },
  due_date_removed: { icon: "📅", color: "bg-gray-500/10 text-gray-600" },
  member_invited: { icon: "👥", color: "bg-blue-500/10 text-blue-600" },
  member_removed: { icon: "👥", color: "bg-red-500/10 text-red-600" },
  member_role_changed: { icon: "🛡️", color: "bg-purple-500/10 text-purple-600" },
  board_updated: { icon: "⚙️", color: "bg-gray-500/10 text-gray-600" },
};

/** Group activities by date (Today, Yesterday, or date string) */
function groupByDate(activities: Activity[]): { label: string; items: Activity[] }[] {
  const groups: Map<string, Activity[]> = new Map();

  for (const a of activities) {
    const date = new Date(a.createdAt);
    let label: string;
    if (isToday(date)) label = "Today";
    else if (isYesterday(date)) label = "Yesterday";
    else label = format(date, "MMMM d, yyyy");

    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(a);
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

export default function ActivityLog({ boardId, open, onClose }: ActivityLogProps) {
  const { activities, subscribe } = useActivityStore();
  const [filterUser, setFilterUser] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (boardId && open) {
      const unsub = subscribe(boardId);
      return unsub;
    }
  }, [boardId, open, subscribe]);

  if (!open) return null;

  // Get unique users from activities
  const uniqueUsers = Array.from(
    new Map(activities.map((a) => [a.userId, { id: a.userId, name: a.userName, photo: a.userPhoto }])).values()
  );

  // Filter activities
  const filtered = filterUser ? activities.filter((a) => a.userId === filterUser) : activities;
  const grouped = groupByDate(filtered);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50" onClick={onClose}>
      <div
        className="h-full w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ActivityIcon size={18} className="text-primary" />
            <h3 className="font-semibold">Activity Log</h3>
            <span className="text-xs text-muted bg-surface px-2 py-0.5 rounded-full">
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded transition-colors ${showFilters || filterUser ? "bg-primary/10 text-primary" : "text-muted hover:text-foreground"}`}
              title="Filter by user"
            >
              <Filter size={16} />
            </button>
            <button onClick={onClose} className="text-muted hover:text-foreground p-1.5">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* User filter */}
        {showFilters && (
          <div className="p-3 border-b border-border bg-surface/50">
            <p className="text-xs font-medium text-muted mb-2">Filter by user</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterUser(null)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  !filterUser ? "bg-primary text-white" : "bg-surface hover:bg-surface-hover text-muted"
                }`}
              >
                All
              </button>
              {uniqueUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setFilterUser(u.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterUser === u.id ? "bg-primary text-white" : "bg-surface hover:bg-surface-hover text-muted"
                  }`}
                >
                  {u.photo ? (
                    <img src={u.photo} alt="" className="w-4 h-4 rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={10} />
                  )}
                  {u.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Activity timeline */}
        <div className="flex-1 overflow-y-auto p-4">
          {grouped.length === 0 ? (
            <div className="text-center py-8 text-muted text-sm">No activity yet</div>
          ) : (
            grouped.map((group) => (
              <div key={group.label} className="mb-6">
                {/* Date group header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Activity items */}
                <div className="space-y-3">
                  {group.items.map((activity) => {
                    const config = actionConfig[activity.action] || { icon: "📌", color: "bg-gray-500/10 text-gray-600" };
                    return (
                      <div key={activity.id} className="flex items-start gap-3 group">
                        {/* Action icon with color */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${config.color}`}>
                          {config.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {/* User avatar */}
                            <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
                              {activity.userPhoto ? (
                                <img src={activity.userPhoto} alt="" className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                activity.userName[0]?.toUpperCase()
                              )}
                            </div>
                            <span className="text-sm font-medium truncate">{activity.userName}</span>
                          </div>
                          <p className="text-sm text-foreground/80 mt-0.5">{activity.details}</p>
                          <span className="text-[10px] text-muted">
                            {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
