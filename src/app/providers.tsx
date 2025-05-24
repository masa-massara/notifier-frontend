// src/app/providers.tsx (修正案)
"use client";

import { Toaster } from "@/components/ui/toaster"; // パスはプロジェクトに合わせてな
import { onAuthStateChangedListener } from "@/services/authService"; // パスはプロジェクトに合わせてな
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider, createStore } from "jotai";
import { queryClientAtom } from "jotai-tanstack-query"; // ライブラリからインポートした queryClientAtom を使う
import type React from "react";
import { useEffect, useState } from "react";

// QueryClientのインスタンスをコンポーネントの外、またはuseStateで一度だけ生成する
// useStateを使うと、コンポーネントのライフサイクル内で安定したインスタンスを保てるで
// const [sharedQueryClient] = useState(() => new QueryClient());
// もしくは、モジュールスコープでグローバルなインスタンスとして定義
const sharedQueryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
	// Jotaiのストアを作成し、queryClientAtomの初期値を設定
	const [jotaiStore] = useState(() => {
		const store = createStore();
		// sharedQueryClient を jotai-tanstack-query が使う queryClientAtom に設定する
		store.set(queryClientAtom, sharedQueryClient);
		return store;
	});

	useEffect(() => {
		// Firebaseの認証状態リスナーの登録など
		const unsubscribe = onAuthStateChangedListener();
		return () => unsubscribe();
	}, []);

	return (
		<JotaiProvider store={jotaiStore}>
			<QueryClientProvider client={sharedQueryClient}>
				{children}
				<Toaster />
			</QueryClientProvider>
		</JotaiProvider>
	);
}
