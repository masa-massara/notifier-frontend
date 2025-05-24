フロントエンドアプリケーション要件定義書： [Notifierアプリ]
1. はじめに
1.1. プロジェクト概要
本ドキュメントは、Notion連携通知アプリケーション [Notifierアプリ] のフロントエンド開発に関する要件を定義するものである。
[Notifierアプリ] は、ユーザーが自身のNotionアカウントと連携し、特定のNotionデータベースの変更をトリガーとして、カスタマイズされた条件に基づき、指定したチャットツール（Discord、Microsoft Teamsなど）へリアルタイム通知を設定・管理できるウェブアプリケーションである。
本フロントエンドは、既存のバックエンドAPIと連携し、ユーザーが直感的かつ効率的に操作できるインターフェースを提供することを目的とする。
1.2. 本ドキュメントの目的
本ドキュメントは、開発チーム（人間、AIを含む）が共通認識を持ち、仕様の齟齬なくフロントエンド開発を進めるための指針となることを目的とする。ユーザーストーリー、画面構成、主要コンポーネント、データフロー、非機能要件などを網羅する。
1.3. 対象読者
プロジェクトマネージャー
UI/UXデザイナー
フロントエンドエンジニア
バックエンドエンジニア（API連携部分の確認のため）
QAエンジニア
1.4. 用語定義
Notion連携: Notifierアプリのユーザーが自身のNotionワークスペースへのアクセスを許可するために登録するNotionインテグレーション情報（APIトークンを含む）。
送信先 (Destination): 通知メッセージを送信する先のWebhook URL（例: DiscordチャンネルのWebhook）。
通知テンプレート (Template): 通知を送信するための具体的な設定。対象Notionデータベース、通知条件、メッセージ書式、送信先、使用するNotion連携を含む。
プレースホルダ: 通知メッセージ本文内で、実際のNotionページのプロパティ値や関連情報に置き換わる特別な文字列（例: {プロパティ名}, {_pageUrl}）。
1.5. 参考資料
バックエンドAPI仕様書: docs/api_reference.md
アプリケーションアーキテクチャ概要: docs/architecture.md
Webhook処理フロー解説: docs/webhook_processing_flow.md
通知テンプレートのプレースホルダ仕様: docs/template_placeholders.md
アプリケーション概要・ドキュメント構成: docs/index.md
2. 全体的な要件と設計方針
2.1. 技術スタック
ランタイム・ビルド: Bun
フレームワーク: Next.js (App Routerを想定)
UIコンポーネントライブラリ: shadcn/ui
UI拡張（アニメーション等）: Magic UI (部分的に導入検討)
状態管理（クライアント）: Jotai
状態管理（サーバーキャッシュ、データフェッチ）: TanStack Query (React Query) v5
フォーム管理: React Hook Form
Gitフック: Husky
リンター・フォーマッター: Biome
2.2. 全体的なユーザー体験 (UX)
直感的で分かりやすく、ユーザーが迷うことなく主要な操作（Notion連携登録、送信先登録、テンプレート作成・管理）を完了できること。
適切なフィードバック（ローディング状態、成功メッセージ、エラーメッセージ）を適時に表示すること。
アプリ名やロゴ、基本的なテーマカラーは後から容易にカスタマイズ可能な設計とする。
2.3. API連携方針
バックエンドAPI（ベースURL: [バックエンドAPIのベースURL、例: /api/v1]）と非同期通信を行う。
TanStack Query と Jotaiインテグレーション (atomWithQuery,) を積極的に活用し、データの取得・更新・キャッシュ管理、ローディング状態管理、エラーハンドリングを一元的に行う。
APIリクエスト時には、Jotaiで管理するFirebase IDトークンを Authorization: Bearer <IDトークン> ヘッダーに付与する。
依存関係: 本フロントエンドの一部の機能（特に通知テンプレート作成・編集画面でのNotionデータベース選択やプロパティ選択の理想形）は、Notionデータベースの情報（アクセス可能なデータベース一覧、特定のデータベースのスキーマ）を取得するための新しいバックエンドAPIエンドポイントを必要とする。これらのAPIは既存の docs/api_reference.md には記載されておらず、フロントエンド開発と並行してバックエンド側で設計・実装する必要がある。
2.4. エラーハンドリング方針
クライアントサイドバリデーション: React Hook Form を利用し、フォーム送信前に主要な入力値の検証を行う。エラーがある場合は、該当フィールド近辺に分かりやすくメッセージを表示する。
APIエラー: TanStack Query のエラーハンドリング機構を利用し、APIからのエラーレスポンス（4xx, 5xx系）を適切に処理する。ユーザーにはエラー内容に応じたメッセージ（例: shadcn/ui の Toast コンポーネントなど）を表示し、必要であれば再試行を促すか、サポートへの問い合わせを示唆する。
予期せぬエラー: グローバルなエラーバウンダリ（Error Boundary）を設け、予期せぬUIクラッシュを防ぎ、ユーザーにエラー発生を通知する。
2.5. レスポンシブデザイン
主要な画面（ログイン、各種一覧、各種フォーム）は、デスクトップ（一般的なラップトップ画面幅以上）およびタブレット端末（縦向き・横向き）での表示と操作に最適化する。スマートフォン向けのレイアウトは将来的な拡張とし、初期リリースではPC/タブレット優先とする。
3. 共通レイアウトとグローバル状態
3.1. 共通レイアウトコンポーネント (AppLayout.tsx)
アプリケーション全体の骨格を提供し、以下の要素で構成される。
ヘッダーエリア (components/layout/Header.tsx):
左側: [アプリ名] と [アプリアイコン] (クリックでダッシュボードへ)。
右側 (ユーザーログイン時): ユーザー名表示、アカウント設定画面への歯車アイコン⚙️。
右側 (未ログイン時): 「ログイン」ボタン、「新規登録」ボタン。
サイドナビゲーションエリア (components/layout/Sidebar.tsx) (ログイン後のみ表示):
ダッシュボード（テンプレート一覧など、ログイン後の初期表示画面）
通知テンプレート管理（一覧、新規作成）
Notion連携管理（一覧、新規登録）
送信先管理（一覧、新規登録）
ヘルプ (オプション)
メインコンテンツエリア: 各画面の主要コンテンツが表示される領域。
フッターエリア: なし。
3.2. グローバル状態管理 (Jotai Atoms - 例: store/globalAtoms.ts)
currentUserAtom:
型: { uid: string; email: string | null; } | null
説明: ログイン中のFirebaseユーザー情報（主要なもののみ）。アプリケーションの認証状態の判定に使用。
初期値: null。
更新タイミング: ログイン成功時、ログアウト時、アプリケーション初期化時の認証状態確認時。
idTokenAtom:
型: string | null
説明: Firebase Authenticationから取得したIDトークン。APIリクエストのAuthorizationヘッダーに使用。
初期値: null。
更新タイミング: ログイン成功時、トークンリフレッシュ時、ログアウト時。
queryClientAtom (from jotai-tanstack-query):
説明: TanStack Queryの QueryClient インスタンスをJotaiのatomとしてラップし、アプリ全体で共有・アクセス可能にする。
3.3. プロバイダ設定 (例: app/providers.tsx for Next.js App Router)

TypeScript


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





4. 各画面の機能要件、UI要素配置、画面遷移
4.1. ユーザー認証関連画面
4.1.1. アカウント作成画面 (/signup) (USR-001)
目的: 新規ユーザーがメールアドレスとパスワードでアカウントを作成する。
レイアウト: 共通ヘッダー（未ログイン）、メインコンテンツエリア。
メインコンテンツ要素:
画面タイトル「アカウント作成」
[アプリ名] と [アプリアイコン] (任意)
メールアドレス入力フィールド (必須)
パスワード入力フィールド (必須、強度要件表示推奨)
パスワード確認入力フィールド (必須)
「アカウントを作成する」ボタン
「既にアカウントをお持ちですか？ ログイン」リンク (ログイン画面へ)
処理: Firebase Authenticationの createUserWithEmailAndPassword を使用。成功時メイン画面へ、失敗時エラー表示。
4.1.2. ログイン画面 (/login) (USR-002)
目的: 既存ユーザーがメールアドレスとパスワードでログインする。
レイアウト: 共通ヘッダー（未ログイン）、メインコンテンツエリア。
メインコンテンツ要素:
画面タイトル「ログイン」
[アプリ名] と [アプリアイコン] (任意)
メールアドレス入力フィールド (必須)
パスワード入力フィールド (必須、表示/非表示切り替え推奨)
「ログイン」ボタン
「パスワードをお忘れですか？」リンク (パスワードリセット申請画面へ)
「アカウントをお持ちでないですか？ 新規登録」リンク (アカウント作成画面へ)
処理: Firebase Authenticationの signInWithEmailAndPassword を使用。成功時IDトークン保持しメイン画面へ、失敗時エラー表示。
4.1.3. パスワードリセット申請画面 (/reset-password) (USR-004) (オプション)
目的: パスワードを忘れたユーザーがリセットメールの送信を申請する。
レイアウト: 共通ヘッダー（未ログイン）、メインコンテンツエリア。
メインコンテンツ要素:
画面タイトル「パスワードのリセット」
説明文
登録メールアドレス入力フィールド (必須)
「リセットメールを送信」ボタン
「ログイン画面に戻る」リンク
処理: Firebase Authenticationの sendPasswordResetEmail を使用。
4.1.4. アカウント設定画面 (/account/settings) (USR-003含む)
目的: ログインユーザーが自身の情報を確認し、パスワード変更やログアウトを行う。
レイアウト: 共通ヘッダー（ログイン済）、サイドナビゲーション、メインコンテンツエリア。
メインコンテンツ要素:
画面タイトル「アカウント設定」
セクション1: プロフィール情報: メールアドレス表示。
セクション2: パスワード変更: 現在のパスワード、新しいパスワード、新しいパスワード（確認用）の各入力フィールド、「パスワードを変更する」ボタン。
セクション3: ログアウト: 「ログアウト」ボタン (USR-003)。
処理:
パスワード変更: Firebase Authenticationのパスワード更新機能を利用。
ログアウト: Firebase Authenticationの signOut を使用し、IDトークンを破棄後、ログイン画面へ遷移。
4.2. Notion連携管理機能 (ユーザー別)
4.2.1. Notion連携一覧画面 (/notion-integrations) (USR-006)
目的: ユーザーが登録したNotionインテグレーションを一覧表示し、管理する。
レイアウト: 共通ヘッダー（ログイン済）、サイドナビゲーション、メインコンテンツエリア。
メインコンテンツ要素:
PageHeader コンポーネント: タイトル「Notion連携管理」、右側に「新しいNotion連携を登録」ボタン。
一覧表示エリア (テーブルまたはカード形式):
表示項目: 連携名、登録日時。
アクション: 各連携に対する「削除」ボタン (USR-007)。
未登録時のメッセージと登録ボタン表示。
処理: GET /api/v1/me/notion-integrations で一覧取得。削除時は確認後 DELETE /api/v1/me/notion-integrations/:integrationId を呼び出し。
4.2.2. 新規Notion連携登録画面 (/notion-integrations/new) (USR-005)
目的: ユーザーが新しいNotionインテグレーション情報を登録する。
レイアウト: 共通ヘッダー（ログイン済）、サイドナビゲーション、メインコンテンツエリア。
メインコンテンツ要素:
PageHeader コンポーネント: タイトル「新しいNotion連携を登録」。
入力フォーム: 連携名入力フィールド (必須)、Notionインテグレーションシークレット入力フィールド (必須、パスワード形式推奨、取得方法ヘルプ)。
「登録」ボタン、「キャンセル」ボタン。
処理: POST /api/v1/me/notion-integrations を呼び出し。成功時メッセージ表示し一覧へ、失敗時エラー表示。
4.3. 送信先 (Destination) 管理機能
4.3.1. 送信先一覧画面 (/destinations) (USR-009 参照部分)
目的: ユーザーが登録した通知送信先 (Webhook URL) を一覧表示・管理する。
レイアウト: 共通ヘッダー（ログイン済）、サイドナビゲーション、メインコンテンツエリア。
メインコンテンツ要素:
PageHeader コンポーネント: タイトル「送信先管理」、右側に「新しい送信先を登録」ボタン。
一覧表示エリア (テーブルまたはカード形式):
表示項目: 送信先名、Webhook URL (一部マスク検討)、登録日時。
アクション: 各送信先に対する「編集」「削除」ボタン。
未登録時のメッセージと登録ボタン表示。
処理: GET /api/v1/destinations で一覧取得。編集・削除は対応APIを呼び出し。
4.3.2. 新規・編集 送信先登録画面 (/destinations/new, /destinations/:id/edit) (USR-008, USR-009 作成・更新部分)
目的: 新しい送信先情報を登録、または既存の情報を編集する。
レイアウト: 共通ヘッダー（ログイン済）、サイドナビゲーション、メインコンテンツエリア。
メインコンテンツ要素:
PageHeader コンポーネント: タイトル (新規: 「新しい送信先を登録」, 編集: 「送信先の編集: [送信先名]」)。
入力フォーム: 送信先名入力フィールド (任意または必須)、Webhook URL入力フィールド (必須、URL形式バリデーション、取得方法ヘルプ)。
「保存」ボタン（新規時は「登録」）、「キャンセル」ボタン。
処理: 新規作成は POST /api/v1/destinations、更新は PUT /api/v1/destinations/:id を呼び出し。成功時メッセージ表示し一覧へ、失敗時エラー表示。
4.4. 通知テンプレート (Template) 管理機能
4.4.1. 通知テンプレート一覧画面 (/templates) (USR-011 参照部分)
目的: ユーザーが作成した通知テンプレートを一覧表示し、管理する。
レイアウト: 共通ヘッダー（ログイン済）、サイドナビゲーション、メインコンテンツエリア。これが実質的なダッシュボード/初期画面となる。
メインコンテンツ要素:
PageHeader コンポーネント: タイトル「通知テンプレート一覧」、右側に「新しいテンプレートを作成」ボタン。
一覧表示エリア (テーブルまたはカード形式):
表示項目: テンプレート名、対象NotionデータベースID (可能なら名前も)、通知先名 (Destinationのname)、最終更新日時。
アクション: 各テンプレートに対する「編集」「削除」ボタン。
未作成時のメッセージと作成ボタン表示。
処理: GET /api/v1/templates で一覧取得。編集・削除は対応APIを呼び出し。
4.4.2. 通知テンプレート作成・編集画面 (/templates/new, /templates/:id/edit) (USR-010, USR-011 作成・更新部分)
目的: 通知テンプレートを新規作成、または既存のものを編集する。
レイアウト: 共通ヘッダー（ログイン済）、サイドナビゲーション、メインコンテンツエリア。
メインコンテンツ要素:
PageHeader コンポーネント: タイトル (新規: 「新しい通知テンプレートを作成」, 編集: 「テンプレート編集: [テンプレート名]」)。
入力フォーム (セクション分け推奨):
1. 基本情報:
テンプレート名 (テキスト入力, 必須)。
使用するNotion連携 (登録済み連携からプルダウン選択, 必須)。
対象Notionデータベース (選択した連携に基づき、データベース名プルダウン選択推奨 (理想形)、またはID手入力 (基本形), 必須)。
API依存: この「理想形」を実現するには、選択されたNotion連携アカウントの権限でアクセス可能なデータベース一覧を取得するバックエンドAPIが別途必要です。また、データベース選択/検証後にそのスキーマ（プロパティ情報）を取得するAPIも必要となります。これらのAPIは現在の docs/api_reference.md には定義されていません。
2. 通知条件 (AND条件):
「条件を追加」ボタンで動的に条件セットを追加。
各条件セット: プロパティ選択プルダウン (対象DBのスキーマから動的生成)、演算子選択プルダウン、値入力 (プロパティ型と演算子に応じてUI変化)、条件削除ボタン。
API依存: プロパティ選択肢の動的生成には、上記「対象Notionデータベース」で取得したスキーマ情報（または専用APIで取得したプロパティ情報）が必要です。
3. 通知メッセージ:
メッセージ本文 (複数行テキストエリア, 必須)。
利用可能なプレースホルダ一覧 (特殊・DBプロパティ) を表示し、クリックで本文へ挿入支援。
API依存: DBプロパティプレースホルダの動的表示には、上記「対象Notionデータベース」で取得したスキーマ情報が必要です。
4. 送信先:
通知先のチャンネル (登録済み送信先からプルダウン選択, 必須)。
「キャンセル」ボタン、「保存する」ボタン（新規時は「作成する」、編集時は「更新する」）。
処理: 新規作成は POST /api/v1/templates、更新は PUT /api/v1/templates/:id を呼び出し。バックエンドでNotionデータベースアクセス検証が行われることを想定。成功時メッセージ表示し一覧へ、失敗時エラー表示。
4.5. その他 (将来的な拡張・オプション)
4.5.1. 通知履歴の確認 (USR-012) (オプション)
概要: 送信された通知の履歴（成功/失敗、日時、内容の概要など）をユーザーが確認できるようにする。
備考: バックエンドAPIの追加開発が必要。
4.5.2. ヘルプ・ドキュメント (USR-013) (オプション)
概要: アプリケーションの使い方、プレースホルダの仕様、トラブルシューティング情報などをアプリ内から参照できるようにする。
備考: docs フォルダ内のMarkdownドキュメントをフロントエンドで表示する、または専用ページを作成する。
5. 非機能要件 (主要なもの)
ユーザビリティ:
主要な操作は簡潔に行えること。
エラーメッセージは具体的で、ユーザーが対応を理解できるようにする。
パフォーマンス:
TanStack Queryによるデータキャッシュ最適化、UIの応答性。
セキュリティ:
IDトークン管理、機密情報（Webhook URL、Notionトークンなど）の適切な取り扱い。
一般的なウェブ脆弱性対策。
6. デザイン・UIについて
[アプリ名]、[アプリアイコン]、テーマカラーなどは後から容易に変更・適用可能な設計とする。
shadcn/ui をベースとした、シンプルでクリーン、直感的なデザイン。
Magic UI は、ローディング表示やフィードバック、カードのアニメーションなど、ユーザー体験を向上させるポイントで限定的に使用を検討。

