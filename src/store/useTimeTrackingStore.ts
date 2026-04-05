import { create } from "zustand";
import type { TimeLog, ActiveTimer } from "@/types";
import {
  startTimer as startTimerService,
  stopTimer as stopTimerService,
  subscribeBoardTimeLogs,
} from "@/services/timeTrackingService";

interface TimeTrackingState {
  timeLogs: TimeLog[];
  activeTimer: ActiveTimer | null;
  activeTimerLogId: string | null;
  subscribeLogs: (boardId: string) => () => void;
  startTimer: (cardId: string, boardId: string, userId: string, userName: string) => Promise<void>;
  stopTimer: () => Promise<void>;
}

export const useTimeTrackingStore = create<TimeTrackingState>((set, get) => ({
  timeLogs: [],
  activeTimer: null,
  activeTimerLogId: null,

  subscribeLogs: (boardId) => {
    return subscribeBoardTimeLogs(boardId, (logs) => {
      set({ timeLogs: logs });
      // Check if user has an active timer
      const active = logs.find((l) => l.endTime === null);
      if (active) {
        set({
          activeTimer: {
            cardId: active.cardId,
            boardId: active.boardId,
            startTime: active.startTime,
          },
          activeTimerLogId: active.id,
        });
      }
    });
  },

  startTimer: async (cardId, boardId, userId, userName) => {
    const { activeTimerLogId } = get();
    if (activeTimerLogId) {
      await stopTimerService(activeTimerLogId);
    }
    const logId = await startTimerService({ cardId, boardId, userId, userName });
    set({
      activeTimer: { cardId, boardId, startTime: Date.now() },
      activeTimerLogId: logId,
    });
  },

  stopTimer: async () => {
    const { activeTimerLogId } = get();
    if (activeTimerLogId) {
      await stopTimerService(activeTimerLogId);
      set({ activeTimer: null, activeTimerLogId: null });
    }
  },
}));
