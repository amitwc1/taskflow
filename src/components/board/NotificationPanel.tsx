"use client";

import { useState, useRef, useEffect } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationPanel() {
  const user = useAuthStore((s) => s.user);
  const { notifications, unreadCount, subscribe, markRead, markAllRead } =
    useNotificationStore();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const unsub = subscribe(user.uid);
      return unsub;
    }
  }, [user, subscribe]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const iconMap: Record<string, string> = {
    card_assigned: "👤",
    comment_added: "💬",
    due_date_approaching: "⏰",
    due_date_passed: "🔴",
    mentioned: "@",
    board_invited: "📋",
    automation_triggered: "⚡",
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded hover:bg-white/20 transition-colors relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 max-h-96 bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
            {unreadCount > 0 && user && (
              <button
                onClick={() => markAllRead(user.uid)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted text-sm">
                No notifications
              </div>
            ) : (
              notifications.slice(0, 50).map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 border-b border-border hover:bg-surface transition-colors cursor-pointer ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    if (!n.read) markRead(n.id);
                  }}
                >
                  <span className="text-base shrink-0 mt-0.5">
                    {iconMap[n.type] || "📌"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted truncate">{n.message}</p>
                    <span className="text-[10px] text-muted">
                      {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
