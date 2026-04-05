import {
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { TimeLog } from "@/types";

export async function startTimer(params: {
  cardId: string;
  boardId: string;
  userId: string;
  userName: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, "timeLogs"), {
    ...params,
    startTime: Date.now(),
    endTime: null,
    duration: 0,
    createdAt: Date.now(),
  });
  return docRef.id;
}

export async function stopTimer(timeLogId: string) {
  const now = Date.now();
  const docRef = doc(db, "timeLogs", timeLogId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    const duration = now - data.startTime;
    await updateDoc(docRef, {
      endTime: now,
      duration,
    });
  }
}

export function subscribeTimeLogs(
  cardId: string,
  callback: (logs: TimeLog[]) => void
) {
  const q = query(
    collection(db, "timeLogs"),
    where("cardId", "==", cardId)
  );
  return onSnapshot(q, (snap) => {
    const logs = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as TimeLog))
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(logs);
  }, (error) => {
    console.error("TimeLogs subscription error:", error);
    callback([]);
  });
}

export function subscribeBoardTimeLogs(
  boardId: string,
  callback: (logs: TimeLog[]) => void
) {
  const q = query(
    collection(db, "timeLogs"),
    where("boardId", "==", boardId)
  );
  return onSnapshot(q, (snap) => {
    const logs = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as TimeLog))
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(logs);
  }, (error) => {
    console.error("Board timeLogs subscription error:", error);
    callback([]);
  });
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
