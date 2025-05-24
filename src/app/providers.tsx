// src/app/providers.tsx
"use client";

import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider, createStore, useSetAtom } from "jotai";
import { queryClientAtom } from "jotai-tanstack-query";
import type React from "react";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"; // Firebaseから直接インポートします
import { auth } from "@/lib/firebase"; // Firebase authインスタンス
import { currentUserAtom, idTokenAtom } from "@/store/globalAtoms"; // 正しいatomをインポートします

// 以前authServiceにあったonAuthStateChangedListenerはここで直接扱います

const sharedQueryClient = new QueryClient();

// Firebase Authの状態をJotai atomと同期させるコンポーネント
const AuthStateSynchronizer = () => {
  const setCurrentUser = useSetAtom(currentUserAtom);
  const setIdToken = useSetAtom(idTokenAtom);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        // currentUserAtomがFirebaseのUser型を期待していることを確認します
        setCurrentUser(user);
        const token = await user.getIdToken();
        setIdToken(token);
      } else {
        setCurrentUser(null);
        setIdToken(null);
      }
    });
    return () => unsubscribe(); // コンポーネントがアンマウントされる際に解除します
  }, [setCurrentUser, setIdToken]);

  return null; // このコンポーネント自体は画面には何もレンダリングしません
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [jotaiStore] = useState(() => {
    const store = createStore();
    store.set(queryClientAtom, sharedQueryClient); // TanStack Query用のatomも初期化します
    return store;
  });

  // authServiceからonAuthStateChangedListenerを呼び出すuseEffectは削除します

  return (
    <JotaiProvider store={jotaiStore}>
      <QueryClientProvider client={sharedQueryClient}>
        <AuthStateSynchronizer /> {/* AuthStateSynchronizerをここに追加します */}
        {children}
        <Toaster />
      </QueryClientProvider>
    </JotaiProvider>
  );
}
