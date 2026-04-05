import { create } from "zustand";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  init: () => () => void;
}

function firebaseUserToUser(u: FirebaseUser): User {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
  };
}

async function ensureUserDoc(u: FirebaseUser) {
  const ref = doc(db, "users", u.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      photoURL: u.photoURL,
      createdAt: Date.now(),
    });
  } else {
    // Update fields that may have been null during initial creation (race with onAuthStateChanged)
    const data = snap.data();
    const updates: Record<string, unknown> = {};
    if (!data.displayName && u.displayName) updates.displayName = u.displayName;
    if (!data.photoURL && u.photoURL) updates.photoURL = u.photoURL;
    if (!data.email && u.email) updates.email = u.email;
    if (Object.keys(updates).length > 0) {
      await updateDoc(ref, updates);
    }
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await ensureUserDoc(firebaseUser);
        set({ user: firebaseUserToUser(firebaseUser), initialized: true, loading: false });
      } else {
        set({ user: null, initialized: true, loading: false });
      }
    });
    return unsubscribe;
  },

  signUp: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await ensureUserDoc(cred.user);
      set({ user: firebaseUserToUser(cred.user), loading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sign up failed";
      set({ error: msg, loading: false });
      throw e;
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      set({ user: firebaseUserToUser(cred.user), loading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sign in failed";
      set({ error: msg, loading: false });
      throw e;
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await ensureUserDoc(cred.user);
      set({ user: firebaseUserToUser(cred.user), loading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Google sign in failed";
      set({ error: msg, loading: false });
      throw e;
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));
