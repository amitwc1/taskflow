/**
 * Activity Service
 * Logs and subscribes to activity events for boards and individual cards.
 * Provides per-card history and user activity tracking.
 */

import { addDoc, collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Activity, ActivityAction } from "@/types";

/** Log an activity event to Firestore */
export async function logActivity(params: {
  boardId: string;
  cardId?: string;
  listId?: string;
  userId: string;
  userName: string;
  userPhoto: string | null;
  action: ActivityAction;
  details: string;
  metadata?: Record<string, unknown>;
}) {
  await addDoc(collection(db, "activities"), {
    ...params,
    createdAt: Date.now(),
  });
}

/** Subscribe to all activities for a board (real-time) */
export function subscribeActivities(
  boardId: string,
  callback: (activities: Activity[]) => void
) {
  const q = query(
    collection(db, "activities"),
    where("boardId", "==", boardId)
  );
  return onSnapshot(q, (snap) => {
    const activities = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Activity))
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(activities);
  }, (error) => {
    console.error("Activities subscription error:", error);
    callback([]);
  });
}

/** Subscribe to activities for a specific card (real-time) */
export function subscribeCardActivities(
  cardId: string,
  callback: (activities: Activity[]) => void
) {
  const q = query(
    collection(db, "activities"),
    where("cardId", "==", cardId)
  );
  return onSnapshot(q, (snap) => {
    const activities = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Activity))
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(activities);
  }, (error) => {
    console.error("Card activities subscription error:", error);
    callback([]);
  });
}

/** Get activity count per user for a board (one-time fetch) */
export async function getUserActivityCounts(
  boardId: string
): Promise<Record<string, number>> {
  const q = query(
    collection(db, "activities"),
    where("boardId", "==", boardId)
  );
  const snap = await getDocs(q);
  const counts: Record<string, number> = {};
  snap.docs.forEach((d) => {
    const data = d.data();
    counts[data.userId] = (counts[data.userId] || 0) + 1;
  });
  return counts;
}
