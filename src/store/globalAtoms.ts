// src/store/globalAtoms.ts
import type { User } from "firebase/auth";
import { atom } from "jotai";
// import { QueryClient } from "@tanstack/react-query"; // もし使ってなければ不要
// import { queryClientAtom } from "jotai-tanstack-query"; // ここでインポートする必要もなさそう

// 現在のユーザー情報を保持するAtom
export const currentUserAtom = atom<User | null>(null);

// Firebase IDトークンを保持するAtom
export const idTokenAtom = atom<string | null>(null);

// 以下の行を削除またはコメントアウト
// export const customQueryClientAtom = queryClientAtom(new QueryClient());
