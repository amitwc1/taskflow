import { create } from "zustand";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Workspace } from "@/types";

interface WorkspaceState {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  subscribeWorkspaces: (userId: string) => () => void;
  createWorkspace: (name: string, description: string, userId: string) => Promise<string>;
  deleteWorkspace: (id: string) => Promise<void>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  loading: true,
  error: null,

  subscribeWorkspaces: (userId: string) => {
    set({ loading: true });
    const q = query(
      collection(db, "workspaces"),
      where("members", "array-contains", userId)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const workspaces = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as Workspace))
          .sort((a, b) => b.createdAt - a.createdAt);
        set({ workspaces, loading: false });
      },
      (error) => {
        console.error("Workspace subscription error:", error);
        set({ error: error.message, loading: false });
      }
    );
    return unsubscribe;
  },

  createWorkspace: async (name, description, userId) => {
    const docRef = await addDoc(collection(db, "workspaces"), {
      name,
      description,
      ownerId: userId,
      members: [userId],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return docRef.id;
  },

  deleteWorkspace: async (id) => {
    await deleteDoc(doc(db, "workspaces", id));
  },

  updateWorkspace: async (id, data) => {
    await updateDoc(doc(db, "workspaces", id), { ...data, updatedAt: Date.now() });
  },
}));
