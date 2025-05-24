import type { User } from "firebase/auth"; // FirebaseのUser型をインポートしてると仮定
// src/store/globalAtoms.ts (修正案)
import { atom } from "jotai";

// 現在のユーザー情報を保持するAtom
export const currentUserAtom = atom<User | null>(null);

// Firebase IDトークンを保持するAtom
export const idTokenAtom = atom<string | null>(null);

// customQueryClientAtom の定義はここからは削除するか、
// もし他の場所で特別な QueryClient インスタンスを使いたい場合は別途 atom(new QueryClient()) で定義する。
// 今回のケースでは、providers.tsx でライブラリ標準の queryClientAtom を使うことを推奨するで。
