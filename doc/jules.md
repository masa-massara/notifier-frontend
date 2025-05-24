
AIエージェント Jules向け：フロントエンド実装指示書 (Notifierアプリ)
0. はじめに
本指示書は、Notifierアプリのフロントエンド開発において、グローバルな設定、共通レイアウト、そして主要な機能の実装を進めるための詳細な手順を記述するものです。
これまでのステップで、Bun + Next.js (App Router, TypeScript, Tailwind CSS) を用いた開発環境がDev Container上に構築され、Biomeによるコード品質管理、shadcn/uiによるUIコンポーネントの基本的なセットアップが完了していることを前提とします。
主要技術スタック:
ランタイム・ビルド: Bun
フレームワーク: Next.js (App Router)
UIコンポーネント: shadcn/ui (基本部品)、Magic UI (リッチな表現、URL経由で shadcn/ui add を使用)
状態管理（クライアント）: Jotai
状態管理（サーバーキャッシュ、データフェッチ）: TanStack Query (React Query) v5
フォーム管理: React Hook Form
APIクライアント: Fetch API (または軽量なラッパー)
バックエンドAPI仕様: docs/api_reference.md を参照。
ディレクトリ構造の想定 (一部):



notifier-frontend/
├── src/
│   ├── app/
│   │   ├── (authenticated)/  // 認証が必要なページのグループ (例)
│   │   │   ├── layout.tsx      // 認証済みレイアウト (AppLayout を使用)
│   │   │   ├── account/
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   ├── destinations/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── notion-integrations/
│   │   │   │   └── ... (同様の構造)
│   │   │   └── templates/
│   │   │       └── ... (同様の構造)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx      // ルートレイアウト (Providers を適用)
│   │   ├── page.tsx        // ランディングページなど (認証不要)
│   │   └── providers.tsx   // Jotai, TanStack Query プロバイダ
│   ├── components/
│   │   ├── layout/         // Header.tsx, Sidebar.tsx, AppLayout.tsx
│   │   ├── ui/             // shadcn/ui で追加されたコンポーネント (button.tsx 等)
│   │   └── magicui/        // Magic UI で追加されたコンポーネント (もし別ディレクトリなら)
│   │   └── features/       // 各機能（例: template作成フォーム）の複合コンポーネント
│   ├── lib/
│   │   ├── queryClient.ts  // TanStack Query Client インスタンス
│   │   └── utils.ts        // shadcn/ui の cn 関数など
│   ├── services/           // APIフェッチ関数 (例: templateService.ts)
│   ├── store/              // Jotai atoms (例: authAtoms.ts, queryAtoms.ts)
│   └── types/              // グローバルな型定義 (例: hono.env.d.ts)
├── .devcontainer/
├── .husky/
├── node_modules/
├── public/
├── biome.json
├── bun.lockb               // または bun.lock
├── components.json
├── Dockerfile
├── next.config.mjs
├── package.json
├── postcss.config.mjs      // Tailwind CSS用
├── tailwind.config.ts
└── tsconfig.json


ステップ11：グローバルな設定とプロバイダのセットアップ
11.1. TanStack Query の QueryClient を作成
ファイルパス: src/lib/queryClient.ts
内容:
TypeScript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 1, // 1分間はデータを新鮮とみなす
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動再フェッチを無効化
      retry: 1, // APIリクエスト失敗時のリトライ回数
    },
  },
});


11.2. Jotai の グローバル atom を定義
ファイルパス: src/store/authAtoms.ts
TypeScript
// src/store/authAtoms.ts
import { atom } from 'jotai';

export interface CurrentUser {
  uid: string;
  email: string | null;
  // 必要に応じて displayName や photoURL なども追加
}
export const currentUserAtom = atom<CurrentUser | null>(null);
export const idTokenAtom = atom<string | null>(null);


ファイルパス: src/store/queryAtoms.ts
TypeScript
// src/store/queryAtoms.ts
import { queryClientAtom as queryClientAtomPrimitive } from 'jotai-tanstack-query';
import { type QueryClient } from '@tanstack/react-query';
import { Atom } from 'jotai';

// jotai-tanstack-query の queryClientAtom は QueryClient | undefined 型なので、
// アプリケーション全体で QueryClient が必ず存在することを型で示すためにラップする (任意)
// もしくは、利用箇所で存在チェックを行う
export const queryClientAtom: Atom<QueryClient> = queryClientAtomPrimitive as Atom<QueryClient>;

// または、シンプルにそのままエクスポートしても良い
// export { queryClientAtom } from 'jotai-tanstack-query';


11.3. Honoの型拡張ファイルを作成 (ContextVariableMap)
ファイルパス: src/types/hono.env.d.ts (または src/hono.env.d.ts)
内容:
TypeScript
// src/types/hono.env.d.ts
import 'hono';

declare module 'hono' {
  interface ContextVariableMap {
    userId: string; // authMiddleware によってセットされる userId
  }
}


確認: tsconfig.json の include 設定でこの .d.ts ファイルが認識されることを確認してください。
11.4. プロバイダコンポーネントを作成
ファイルパス: src/app/providers.tsx
内容:
TypeScript
// src/app/providers.tsx
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Provider as JotaiProvider, useSetAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClientAtom } from '@/store/queryAtoms';
import { queryClient } from '@/lib/queryClient';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase'; // Firebase初期化とauthインスタンス取得関数 (後述)
import { currentUserAtom, idTokenAtom, CurrentUser } from '@/store/authAtoms';

const HydrateAtoms = ({ initialValues, children }: { initialValues?: any, children: ReactNode }) => {
  useHydrateAtoms(initialValues || [[queryClientAtom, queryClient]]);
  return <>{children}</>;
};

// Firebase Auth の状態を監視し、Jotai atomを更新するコンポーネント
const AuthStateSynchronizer = () => {
  const setCurrentUser = useSetAtom(currentUserAtom);
  const setIdToken = useSetAtom(idTokenAtom);

  useEffect(() => {
    const auth = getFirebaseAuth(); // Firebase Authインスタンスを取得
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        const token = await user.getIdToken();
        setCurrentUser({ uid: user.uid, email: user.email });
        setIdToken(token);
        console.log("Firebase Auth: User signed in, token acquired.");
      } else {
        setCurrentUser(null);
        setIdToken(null);
        console.log("Firebase Auth: User signed out.");
      }
    });
    return () => unsubscribe(); // クリーンアップ
  }, [setCurrentUser, setIdToken]);

  return null; // このコンポーネントはUIを描画しない
};


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <HydrateAtoms>
          <AuthStateSynchronizer /> {/* Firebase Authの状態監視を追加 */}
          {children}
        </HydrateAtoms>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </JotaiProvider>
  );
}


11.5. Firebase Client SDK 初期化ファイルを作成
ファイルパス: src/lib/firebase.ts
内容: フロントエンド用のFirebase Client SDKを初期化し、Authインスタンスを取得する関数を定義します。
TypeScript
// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // オプション
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);

export const getFirebaseApp = () => app;
export const getFirebaseAuth = () => auth;


環境変数: 上記 firebaseConfig で使用する NEXT_PUBLIC_FIREBASE_... の各値は、Next.jsの環境変数として設定する必要があります (.env.local など)。Firebaseコンソールのプロジェクト設定からウェブアプリの構成情報を取得してください。
1.6. ルートレイアウト (src/app/layout.tsx) でプロバイダを適用
ファイルパス: src/app/layout.tsx
内容: Providers コンポーネントで children をラップし、shadcn/ui の Toaster も配置します。
TypeScript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import { AppLayout } from "@/components/layout/AppLayout"; // 次のステップで作成

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "[Notifierアプリ]",
  description: "Notifier App - Get notified from Notion!", // 適宜変更
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning> {/* suppressHydrationWarning はテーマ対応などで必要になることがある */}
      <body className={inter.className}>
        <Providers>
          <AppLayout> {/* 共通レイアウトでラップ */}
            {children}
          </AppLayout>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}


ステップ12：共通レイアウトコンポーネントの実装 (Header, Sidebar, AppLayout)
12.1. ディレクトリ作成: src/components/layout
12.2. Header.tsx の作成
ファイルパス: src/components/layout/Header.tsx
内容:
TypeScript
// src/components/layout/Header.tsx
'use client';
import Link from 'next/link';
import { useAtomValue, useSetAtom } from 'jotai';
import { currentUserAtom, idTokenAtom } from '@/store/authAtoms';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, UserCircle2, Moon, Sun } from 'lucide-react'; // アイコン例
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getFirebaseAuth } from '@/lib/firebase';
import { useRouter } from 'next/navigation'; // App Router用
// import { useTheme } from "next-themes"; // もしダークモード対応するなら

export function Header() {
  const currentUser = useAtomValue(currentUserAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);
  const setIdToken = useSetAtom(idTokenAtom);
  const router = useRouter();
  // const { setTheme, theme } = useTheme(); // ダークモード用

  const handleLogout = async () => {
    try {
      const auth = getFirebaseAuth();
      await auth.signOut();
      setCurrentUser(null);
      setIdToken(null);
      router.push('/login'); // ログアウト後ログインページへ
    } catch (error) {
      console.error("Error signing out: ", error);
      // TODO: エラー時のToast通知など
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            {/* <Icons.logo className="h-6 w-6" /> アプリアイコン */}
            <span className="inline-block font-bold text-lg">[Notifierアプリ]</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            {/* ダークモード切替ボタン (オプション)
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <UserCircle2 className="h-6 w-6" /> {/* またはユーザーアバター */}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {currentUser.email || "アカウント"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/account/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>アカウント設定</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>ログアウト</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">ログイン</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">新規登録</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}


12.3. Sidebar.tsx の作成
ファイルパス: src/components/layout/Sidebar.tsx
内容:
TypeScript
// src/components/layout/Sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // 現在のパスを取得
import { useAtomValue } from 'jotai';
import { currentUserAtom } from '@/store/authAtoms';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ListChecks, Settings2, PlugZap, Send, HelpCircle } from 'lucide-react'; // アイコン例

const mainNavItems = [
  { title: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard }, // `/templates` でも良い
  { title: '通知テンプレート', href: '/templates', icon: ListChecks },
];

const settingsNavItems = [
  { title: 'Notion連携', href: '/notion-integrations', icon: PlugZap },
  { title: '送信先', href: '/destinations', icon: Send },
  { title: 'アカウント設定', href: '/account/settings', icon: Settings2 },
  // { title: 'ヘルプ', href: '/help', icon: HelpCircle }, // オプション
];

export function Sidebar({ className }: { className?: string }) {
  const currentUser = useAtomValue(currentUserAtom);
  const pathname = usePathname();

  if (!currentUser) {
    return null; // ログインしていない場合は表示しない
  }

  const renderNavItem = (item: { href: string; title: string; icon: React.ElementType }) => (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        pathname === item.href ? "bg-accent" : "transparent",
      )}
    >
      <item.icon className="mr-2 h-4 w-4" />
      {item.title}
    </Link>
  );

  return (
    <aside className={cn("fixed top-16 z-30 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto border-r py-6 pr-2 md:sticky md:block", className)}>
      <nav className="flex flex-col gap-4 px-2">
        <div className="flex flex-col gap-1">
          {mainNavItems.map(renderNavItem)}
        </div>
        <div>
          <h3 className="mb-1 mt-2 rounded-md px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
            設定
          </h3>
          <div className="flex flex-col gap-1">
            {settingsNavItems.map(renderNavItem)}
          </div>
        </div>
      </nav>
    </aside>
  );
}


12.4. AppLayout.tsx の作成
ファイルパス: src/components/layout/AppLayout.tsx
内容:
TypeScript
// src/components/layout/AppLayout.tsx
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <div className="container mx-auto flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
        <Sidebar />
        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid"> {/* Main content takes remaining space */}
          <div className="mx-auto w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
      {/* フッターはなし */}
    </div>
  );
}


src/app/layout.tsx でこの AppLayout を使うように修正済み (ステップ11.6参照)。


オーケー！「認証フローが完了しました」っちゅうことで、Jules（またはあんた自身）がユーザーのログイン、新規登録、ログアウト、アカウント設定画面といった基本的な認証周りの機能をフロントエンドに実装してくれたんやな！素晴らしい進捗や！

これで、Notifierアプリのフロントエンドにユーザーがちゃんと「自分のアカウント」で入れるようになったわけやから、いよいよユーザーごとの設定（Notion連携、送信先、そして本丸の通知テンプレート）を管理する機能を作り込んでいく番やな。

-----



-----

\<immersive type="markdown" title="AIエージェント Jules向け：フロントエンド実装指示書 (ステップ13：Notion連携管理機能)"\>

## AIエージェント Jules向け：フロントエンド実装指示書 (Notifierアプリ)

### ステップ13：Notion連携管理機能の実装 (USR-005, USR-006, USR-007)

**目的:**
ユーザーが自身のNotionインテグレーション情報を `[Notifierアプリ]` に登録・一覧表示・削除できるようにする。これにより、ユーザーは自分のNotionワークスペースとアプリケーションを安全に連携させることができる。

**前提:**

  * ステップ11で定義したグローバルプロバイダ (`Providers`) が `src/app/layout.tsx` に設定済みであること。
  * ステップ12で定義した共通レイアウトコンポーネント (`AppLayout`, `Header`, `Sidebar`) が利用可能であること。
  * 認証フローが完了しており、ログインユーザーの `userId` と `idToken` が Jotai atom (`currentUserAtom`, `idTokenAtom`) で管理されていること。
  * shadcn/uiの基本的なコンポーネント (`Button`, `Input`, `Label`, `Table`, `DropdownMenu`, `AlertDialog`, `Toast`など) および `lucide-react` (アイコン用) がプロジェクトに追加済みであること。

**実装する画面と機能:**

**13.1. Notion連携一覧画面 (`/notion-integrations`) (USR-006)**

  * **ファイルパス**: `src/app/(authenticated)/notion-integrations/page.tsx`
      * `(authenticated)` は認証済みユーザーのみがアクセスできるルートグループを想定。適宜実際のルーティング構造に合わせること。
      * この画面を表示するためのレイアウトファイル (`src/app/(authenticated)/layout.tsx`) で `AppLayout` を使用する。
  * **UI要素と配置**:
      * `PageHeader` コンポーネントを使用し、画面タイトルを「Notion連携管理」と表示する。
      * `PageHeader` 内の右側に「新しいNotion連携を登録」ボタン (shadcn/ui `Button`) を配置し、クリックで `/notion-integrations/new` へ遷移するようにする。
      * **一覧表示エリア**:
          * `atomsWithQuery` (Jotai + TanStack Query) を使用して、バックエンドAPI `GET /api/v1/me/notion-integrations` から認証ユーザーのNotion連携情報一覧を取得する。
              * `queryKey`: `['userNotionIntegrations', currentUser?.uid]` (currentUserAtomから取得したUIDを使用)
              * `queryFn`: `idTokenAtom` から取得したトークンを付けてAPIを呼び出すフェッチ関数。
          * 取得したデータは `DataTable` コンポーネント (shadcn/ui `Table` ベースで別途作成またはカスタマイズ) を使用して表示する。
              * **テーブル列**: 「連携名 (`integrationName`)」、「登録日時 (`createdAt`)」、「アクション」。
              * **アクション列**: 各連携情報に対して「削除」ボタン (shadcn/ui `Button` variant="destructive" にゴミ箱アイコン🗑️ from `lucide-react`) を配置。
          * **0件の場合**: 「まだNotion連携が登録されていません。「新しいNotion連携を登録」ボタンから最初の連携を登録しましょう。」というメッセージと、上記の「新しいNotion連携を登録」ボタンと同様のボタンを表示する。
          * **ローディング中**: `LoadingSpinner` または `DataTable` のスケルトン表示。
          * **エラー時**: エラーメッセージと再試行ボタンを表示。
  * **削除処理 (USR-007)**:
      * 「削除」ボタンクリック時: shadcn/ui `AlertDialog` を使用して「本当にこのNotion連携を削除しますか？この連携を使用しているテンプレートも機能しなくなります。」のような確認メッセージを表示する。
      * 確認後、`atomsWithMutation` (Jotai + TanStack Query) を使用して、バックエンドAPI `DELETE /api/v1/me/notion-integrations/:integrationId` を呼び出す。
      * 成功時: Notion連携一覧のクエリ (`['userNotionIntegrations', currentUser?.uid]`) を `invalidateQueries` して一覧を最新の状態に更新し、shadcn/ui `Toast` で「Notion連携を削除しました」と通知する。
      * 失敗時: `Toast` でエラーメッセージを表示する。

**13.2. 新規Notion連携登録画面 (`/notion-integrations/new`) (USR-005)**

  * **ファイルパス**: `src/app/(authenticated)/notion-integrations/new/page.tsx`
  * **UI要素と配置**:
      * `PageHeader` コンポーネントを使用し、画面タイトルを「新しいNotion連携を登録」と表示する。
      * **フォーム (React Hook Form + shadcn/ui `Form`, `Input`, `Label`, `Button` を使用)**:
          * **連携名入力フィールド**:
              * ラベル: 「連携名」
              * shadcn/ui `Input` type="text"
              * プレースホルダ: 「例: マイワークスペース用連携」
              * バリデーション: 必須入力、適切な文字数制限。
          * **Notionインテグレーションシークレット入力フィールド**:
              * ラベル: 「Notionインテグレーションシークレット (APIトークン)」
              * shadcn/ui `Input` type="password" (入力内容が隠れるように)
              * プレースホルダ: 「例: secret\_xxxxxxxx...」
              * バリデーション: 必須入力。形式 (`secret_` で始まるかなど) の簡単なチェック。
              * ヘルプテキスト: 「Notionの「インテグレーション」設定ページで内部インテグレーションを作成し、「内部インテグレーションシークレット」をコピーして貼り付けてください。」のような案内を表示。
          * **アクションボタン**:
              * 「登録する」ボタン (shadcn/ui `Button` type="submit"): フォーム送信。
              * 「キャンセル」ボタン (shadcn/ui `Button` variant="outline"): クリックで一覧画面 (`/notion-integrations`) へ戻る。
  * **登録処理**:
      * 「登録する」ボタンクリック時: React Hook Formでバリデーション後、`atomsWithMutation` (Jotai + TanStack Query) を使用して、バックエンドAPI `POST /api/v1/me/notion-integrations` を呼び出す。
          * リクエストボディ: `{ integrationName: string, notionIntegrationToken: string }`
      * 成功時: shadcn/ui `Toast` で「Notion連携を登録しました」と通知し、Notion連携一覧画面 (`/notion-integrations`) へリダイレクトする。一覧のクエリも `invalidateQueries` しておく。
      * 失敗時: フォーム近辺または `Toast` でAPIからのエラーメッセージを表示する。

**APIクライアント/フェッチ関数の作成 (`src/services/userNotionIntegrationService.ts` など)**:

  * 上記のAPIエンドポイント (`GET /me/notion-integrations`, `POST /me/notion-integrations`, `DELETE /me/notion-integrations/:integrationId`) を呼び出すためのTypeScript関数を作成してください。
  * これらの関数は、引数として `idTokenAtom` から取得したIDトークンを受け取り、`Authorization: Bearer <token>` ヘッダーを設定して `Workspace` APIを実行するようにします。
  * エラーハンドリング（レスポンスステータスコードのチェック、エラーレスポンスボディのパース）も適切に行ってください。

**Jotai + TanStack Query Atoms の作成 (`src/store/userNotionIntegrationAtoms.ts` など)**:

  * `atomsWithQuery` を使用して、Notion連携一覧を取得するためのatom (`userNotionIntegrationsAtom`, `userNotionIntegrationsQueryAtom`) を作成してください。
      * `queryKey` は `['userNotionIntegrations', currentUser?.uid]` のようにユーザーIDを含むようにし、`enabled` オプションでログイン時のみフェッチするようにしてください。
  * `atomsWithMutation` を使用して、Notion連携の作成用 (`createUserNotionIntegrationMutationAtom`) および削除用 (`deleteUserNotionIntegrationMutationAtom`) のatomを作成してください。
      * それぞれの `onSuccess` コールバックで、`queryClient.invalidateQueries({ queryKey: ['userNotionIntegrations', currentUser?.uid] })` を呼び出し、一覧表示が最新の状態に更新されるようにしてください。

**その他考慮事項:**

  * Notionインテグレーションシークレットは機密情報なので、フロントエンド側で（フォーム入力時以外は）保持したり表示したりしないように注意してください。登録後はバックエンドで暗号化されて保存される想定です。
  * 各API呼び出し時のローディング状態（例: ボタンを無効化してスピナーを表示）も適切にハンドリングしてください (`useMutation` の `isPending` や `useQuery` の `isLoading` フラグを利用)。

-----

