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
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { Board, List, Card, Comment } from "@/types";

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  lists: List[];
  cards: Card[];
  comments: Comment[];
  boardLoading: boolean;
  error: string | null;

  // Board operations
  subscribeBoards: (workspaceId: string) => () => void;
  subscribeBoardsByUser: (userId: string) => () => void;
  subscribeBoard: (boardId: string) => () => void;
  createBoard: (board: Omit<Board, "id" | "createdAt" | "updatedAt">) => Promise<string>;
  updateBoard: (id: string, data: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;

  // List operations
  subscribeLists: (boardId: string) => () => void;
  createList: (boardId: string, title: string, order: number) => Promise<string>;
  updateList: (id: string, data: Partial<List>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  reorderLists: (lists: List[]) => Promise<void>;

  // Card operations
  subscribeCards: (boardId: string) => () => void;
  createCard: (card: Omit<Card, "id" | "createdAt" | "updatedAt">) => Promise<string>;
  updateCard: (id: string, data: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  moveCard: (cardId: string, newListId: string, newOrder: number) => Promise<void>;

  // Comment operations
  subscribeComments: (cardId: string) => () => void;
  addComment: (comment: Omit<Comment, "id" | "createdAt">) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;

  clearBoard: () => void;
}

// Helper: delete all docs matching a query in batches of up to 500
async function deleteCollection(q: ReturnType<typeof query>) {
  const snap = await getDocs(q);
  if (snap.empty) return;
  // Firestore batch limit is 500
  const chunks: typeof snap.docs[] = [];
  for (let i = 0; i < snap.docs.length; i += 499) {
    chunks.push(snap.docs.slice(i, i + 499));
  }
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

// Helper: delete all files in a Storage folder
async function deleteStorageFolder(path: string) {
  try {
    const folderRef = ref(storage, path);
    const result = await listAll(folderRef);
    await Promise.all(result.items.map((item) => deleteObject(item)));
  } catch {
    // Storage folder may not exist — ignore
  }
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  lists: [],
  cards: [],
  comments: [],
  boardLoading: true,
  error: null,

  subscribeBoards: (workspaceId) => {
    const q = query(
      collection(db, "boards"),
      where("workspaceId", "==", workspaceId)
    );
    return onSnapshot(q, (snap) => {
      const boards = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Board))
        .sort((a, b) => b.createdAt - a.createdAt);
      set({ boards });
    }, (err) => console.error("subscribeBoards error:", err));
  },

  subscribeBoardsByUser: (userId) => {
    const q = query(
      collection(db, "boards"),
      where("members", "array-contains", userId)
    );
    return onSnapshot(q, (snap) => {
      const boards = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Board))
        .sort((a, b) => b.createdAt - a.createdAt);
      set({ boards });
    }, (err) => console.error("subscribeBoardsByUser error:", err));
  },

  subscribeBoard: (boardId) => {
    return onSnapshot(doc(db, "boards", boardId), (snap) => {
      if (snap.exists()) {
        set({ currentBoard: { id: snap.id, ...snap.data() } as Board, boardLoading: false });
      }
    });
  },

  createBoard: async (board) => {
    const docRef = await addDoc(collection(db, "boards"), {
      ...board,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return docRef.id;
  },

  updateBoard: async (id, data) => {
    await updateDoc(doc(db, "boards", id), { ...data, updatedAt: Date.now() });
  },

  deleteBoard: async (id) => {
    // Gather cards first (need IDs for comments, timeLogs, storage cleanup)
    const cardsSnap = await getDocs(query(collection(db, "cards"), where("boardId", "==", id)));
    const cardIds = cardsSnap.docs.map((d) => d.id);

    // Delete lists + cards in a batch
    const listsSnap = await getDocs(query(collection(db, "lists"), where("boardId", "==", id)));
    const docRefs = [
      ...listsSnap.docs.map((d) => d.ref),
      ...cardsSnap.docs.map((d) => d.ref),
      doc(db, "boards", id),
    ];
    const chunks: typeof docRefs[] = [];
    for (let i = 0; i < docRefs.length; i += 499) {
      chunks.push(docRefs.slice(i, i + 499));
    }
    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach((r) => batch.delete(r));
      await batch.commit();
    }

    // Cascade: delete comments for all cards
    for (const cardId of cardIds) {
      await deleteCollection(query(collection(db, "comments"), where("cardId", "==", cardId)));
      // Delete attachment files from Storage
      await deleteStorageFolder(`attachments/${cardId}`);
    }

    // Cascade: delete activities, automations, timeLogs, presence for this board
    await deleteCollection(query(collection(db, "activities"), where("boardId", "==", id)));
    await deleteCollection(query(collection(db, "automations"), where("boardId", "==", id)));
    await deleteCollection(query(collection(db, "timeLogs"), where("boardId", "==", id)));
    // Presence docs use boardId field
    await deleteCollection(query(collection(db, "presence"), where("boardId", "==", id)));
  },

  subscribeLists: (boardId) => {
    const q = query(
      collection(db, "lists"),
      where("boardId", "==", boardId)
    );
    return onSnapshot(q, (snap) => {
      const lists = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as List))
        .sort((a, b) => a.order - b.order);
      set({ lists });
    }, (err) => console.error("subscribeLists error:", err));
  },

  createList: async (boardId, title, order) => {
    const docRef = await addDoc(collection(db, "lists"), {
      boardId,
      title,
      order,
      createdAt: Date.now(),
    });
    return docRef.id;
  },

  updateList: async (id, data) => {
    await updateDoc(doc(db, "lists", id), data);
  },

  deleteList: async (id) => {
    const cardsSnap = await getDocs(query(collection(db, "cards"), where("listId", "==", id)));
    const cardIds = cardsSnap.docs.map((d) => d.id);

    // Delete list + its cards
    const batch = writeBatch(db);
    cardsSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(doc(db, "lists", id));
    await batch.commit();

    // Cascade: delete comments, timeLogs, and storage for each card
    for (const cardId of cardIds) {
      await deleteCollection(query(collection(db, "comments"), where("cardId", "==", cardId)));
      await deleteCollection(query(collection(db, "timeLogs"), where("cardId", "==", cardId)));
      await deleteStorageFolder(`attachments/${cardId}`);
    }
  },

  reorderLists: async (lists) => {
    const batch = writeBatch(db);
    lists.forEach((list, index) => {
      batch.update(doc(db, "lists", list.id), { order: index });
    });
    await batch.commit();
  },

  subscribeCards: (boardId) => {
    const q = query(
      collection(db, "cards"),
      where("boardId", "==", boardId)
    );
    return onSnapshot(q, (snap) => {
      const cards = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Card))
        .sort((a, b) => a.order - b.order);
      set({ cards });
    }, (err) => console.error("subscribeCards error:", err));
  },

  createCard: async (card) => {
    const docRef = await addDoc(collection(db, "cards"), {
      ...card,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return docRef.id;
  },

  updateCard: async (id, data) => {
    await updateDoc(doc(db, "cards", id), { ...data, updatedAt: Date.now() });
  },

  deleteCard: async (id) => {
    // Delete card document + comments
    const commentsSnap = await getDocs(
      query(collection(db, "comments"), where("cardId", "==", id))
    );
    const batch = writeBatch(db);
    commentsSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(doc(db, "cards", id));
    await batch.commit();

    // Cascade: delete timeLogs and storage attachments
    await deleteCollection(query(collection(db, "timeLogs"), where("cardId", "==", id)));
    await deleteStorageFolder(`attachments/${id}`);
  },

  moveCard: async (cardId, newListId, newOrder) => {
    await updateDoc(doc(db, "cards", cardId), {
      listId: newListId,
      order: newOrder,
      updatedAt: Date.now(),
    });
  },

  subscribeComments: (cardId) => {
    const q = query(
      collection(db, "comments"),
      where("cardId", "==", cardId)
    );
    return onSnapshot(q, (snap) => {
      const comments = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Comment))
        .sort((a, b) => a.createdAt - b.createdAt);
      set({ comments });
    }, (err) => console.error("subscribeComments error:", err));
  },

  addComment: async (comment) => {
    await addDoc(collection(db, "comments"), {
      ...comment,
      createdAt: Date.now(),
    });
  },

  deleteComment: async (id) => {
    await deleteDoc(doc(db, "comments", id));
  },

  clearBoard: () => {
    set({ currentBoard: null, lists: [], cards: [], comments: [], boardLoading: true });
  },
}));
