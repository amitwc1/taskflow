import {
  collection,
  documentId,
  getDoc,
  getDocs,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types";

function toUserProfile(id: string, data: Record<string, unknown>): UserProfile {
  const rawEmail = typeof data.email === "string" ? data.email : "";
  const rawName =
    typeof data.name === "string"
      ? data.name
      : typeof data.displayName === "string"
        ? data.displayName
        : rawEmail;

  return {
    id,
    name: rawName?.trim() || rawEmail || "Unknown",
    email: rawEmail,
    photoURL: typeof data.photoURL === "string" ? data.photoURL : null,
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;

  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;

  return toUserProfile(snap.id, snap.data());
}

export async function getUserDetails(userIds: string[]): Promise<Record<string, UserProfile>> {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueUserIds.length === 0) return {};

  const usersById: Record<string, UserProfile> = {};

  // Firestore limits `in` queries, so chunk the lookup for board/member caches.
  for (let index = 0; index < uniqueUserIds.length; index += 30) {
    const batchIds = uniqueUserIds.slice(index, index + 30);
    const snapshot = await getDocs(
      query(collection(db, "users"), where(documentId(), "in", batchIds))
    );

    snapshot.docs.forEach((userDoc) => {
      usersById[userDoc.id] = toUserProfile(userDoc.id, userDoc.data());
    });
  }

  return usersById;
}
