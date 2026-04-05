"use client";

import { useState, useEffect } from "react";
import { useTimeTrackingStore } from "@/store/useTimeTrackingStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDuration } from "@/services/timeTrackingService";
import { Clock, Play, Square, X } from "lucide-react";
import type { Card } from "@/types";

interface TimeTrackerProps {
  card: Card;
  boardId: string;
}

export default function TimeTracker({ card, boardId }: TimeTrackerProps) {
  const user = useAuthStore((s) => s.user);
  const { activeTimer, timeLogs, startTimer, stopTimer } = useTimeTrackingStore();
  const [elapsed, setElapsed] = useState(0);

  const isTimerActive = activeTimer?.cardId === card.id;
  const cardLogs = timeLogs.filter((l) => l.cardId === card.id && l.endTime !== null);
  const totalTime = cardLogs.reduce((acc, l) => acc + l.duration, 0);

  useEffect(() => {
    if (!isTimerActive || !activeTimer) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - activeTimer.startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerActive, activeTimer]);

  const handleToggle = async () => {
    if (!user) return;
    if (isTimerActive) {
      await stopTimer();
      setElapsed(0);
    } else {
      await startTimer(card.id, boardId, user.uid, user.displayName || "Unknown");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Clock size={14} className="text-muted" />
        <h4 className="text-sm font-semibold text-muted">Time Tracking</h4>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isTimerActive
              ? "bg-accent text-white hover:bg-accent/90"
              : "bg-primary text-white hover:bg-primary-hover"
          }`}
        >
          {isTimerActive ? (
            <>
              <Square size={12} />
              Stop ({formatDuration(elapsed)})
            </>
          ) : (
            <>
              <Play size={12} />
              Start Timer
            </>
          )}
        </button>
      </div>

      {totalTime > 0 && (
        <p className="text-xs text-muted">
          Total logged: <span className="font-medium text-foreground">{formatDuration(totalTime)}</span>
        </p>
      )}

      {cardLogs.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {cardLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-center justify-between text-xs text-muted py-1 border-b border-border">
              <span>{log.userName}</span>
              <span>{formatDuration(log.duration)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
