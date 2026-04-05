import { create } from "zustand";
import type { Notification } from "@/types";
import {
  subscribeNotifications,
  markAsRead,
  markAllAsRead,
} from "@/services/notificationService";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  subscribe: (userId: string) => () => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  subscribe: (userId) => {
    return subscribeNotifications(userId, (notifications) => {
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      });
    });
  },

  markRead: async (id) => {
    await markAsRead(id);
  },

  markAllRead: async (userId) => {
    await markAllAsRead(userId);
  },
}));
