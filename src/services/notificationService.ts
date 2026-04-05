/**
 * Notification Service
 * Creates, subscribes to, and manages user notifications.
 * Sends targeted notifications for card assignments, comments, moves, etc.
 */

import {
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Notification, NotificationType } from "@/types";

/** Create a single notification */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  boardId?: string;
  cardId?: string;
}) {
  await addDoc(collection(db, "notifications"), {
    ...params,
    read: false,
    createdAt: Date.now(),
  });
}

/** Notify multiple users at once */
export async function notifyMultiple(
  userIds: string[],
  params: {
    type: NotificationType;
    title: string;
    message: string;
    boardId?: string;
    cardId?: string;
  }
) {
  const batch = writeBatch(db);
  for (const userId of userIds) {
    const ref = doc(collection(db, "notifications"));
    batch.set(ref, {
      userId,
      ...params,
      read: false,
      createdAt: Date.now(),
    });
  }
  await batch.commit();
}

/** Subscribe to a user's notifications (real-time) */
export function subscribeNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId)
  );
  return onSnapshot(q, (snap) => {
    const notifications = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Notification))
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(notifications);
  }, (error) => {
    console.error("Notifications subscription error:", error);
    callback([]);
  });
}

/** Mark a single notification as read */
export async function markAsRead(notificationId: string) {
  await updateDoc(doc(db, "notifications", notificationId), { read: true });
}

/** Mark all of a user's notifications as read */
export async function markAllAsRead(userId: string) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs
    .filter((d) => d.data().read === false)
    .forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
}

/** Delete a single notification */
export async function deleteNotification(notificationId: string) {
  await deleteDoc(doc(db, "notifications", notificationId));
}

/** Clear all notifications for a user */
export async function clearAllNotifications(userId: string) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
