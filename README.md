# CMS App

フロントエンド・バックエンドの両方をTypeScriptのみで実装したCMSアプリです。
バックエンドは Express + Prisma、フロントエンドは React + Viteで構築。


## 主な機能（現時点）

- 記事一覧の表示（作成日時の降順、0件のときは「記事はありません」）
- 記事の新規作成（タイトル必須・本文は任意、初期ステータスは `DRAFT`）
- 記事の編集（既存の値を読み込んで更新）
- 記事の削除（確認ダイアログあり）
- ステータス管理（`DRAFT` / `PUBLISHED` / `ARCHIVED`）
  - 一覧上のプルダウンから、ページを再読み込みせずに切り替え（楽観的更新、失敗時は元に戻る）
- ローディング表示、保存中の二重送信防止、トースト通知などの基本UX

## 技術スタック

| 領域 | 使用技術 |
| --- | --- |
| フロントエンド | React, Vite, TypeScript, TanStack Query, axios, react-hot-toast, Tailwind CSS |
| バックエンド | Node.js, Express, TypeScript, tsx, Prisma, Zod |
| データベース | MySQL / MariaDB |
| テスト | Vitest, Supertest |

## フォルダ構成

```
cms-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── app.ts
│   │   ├── index.ts
│   │   ├── articles.ts
│   │   ├── schemas/
│   │   ├── middleware/
│   │   └── lib/
│   ├── tests/
│   │   ├── article.test.ts
│   │   ├── phase1.test.ts
│   │   └── sample.test.ts
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── types/
    ├── package.json
    └── tsconfig.json
```

## セットアップ

### 前提

- Node.js
- MySQL または MariaDB（`cmsdb` データベースを作成しておく）

### 1. クローン

```bash
git clone https://github.com/onishimazu/cms-app.git
cd cms-app
```

### 2. バックエンド

```bash
cd backend
npm install
```

`backend/.env` にDB接続情報を設定します（値は環境に合わせて変更してください）。

```env
DATABASE_URL="mysql://ユーザー名:パスワード@localhost:3306/cmsdb"
```

マイグレーションとPrisma Clientの生成を行い、サーバーを起動します。

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

### 3. フロントエンド

別のターミナルで起動します。

```bash
cd frontend
npm install
npm run dev
```

フロントエンドの開発サーバーは、`/api` へのリクエストをバックエンドへプロキシします。
ブラウザで Vite が表示するURL（通常は `http://localhost:5173`）を開いてください。

## 画面

| パス | 内容 |
| --- | --- |
| `/` | 記事一覧（ステータス変更・編集・削除） |
| `/articles/new` | 記事の新規作成 |
| `/articles/:id/edit` | 記事の編集 |

## API

| メソッド | パス | 説明 | 成功時 |
| --- | --- | --- | --- |
| GET | `/api/articles` | 記事一覧（`created_at` 降順） | 200 |
| POST | `/api/articles` | 記事の作成（`title` 必須、1〜200文字） | 201 |
| GET | `/api/articles/:id` | 記事1件の取得 | 200 |
| PUT | `/api/articles/:id` | 記事の更新（`title`、`body`） | 200 |
| PATCH | `/api/articles/:id/status` | ステータス変更 | 200 |
| DELETE | `/api/articles/:id` | 記事の削除 | 204 |

エラー時のレスポンス：

- 入力値が不正な場合は `400`（Zod のエラー内容を返す）
- 対象の記事が存在しない場合は `404`
- DB接続エラーなどは `500`

## テスト

バックエンドのAPI・ロジックを Vitest と Supertest でテストしています（フロントエンドのテストは対象外）。

```bash
cd backend
npx vitest run
```

`tests/phase1.test.ts` で、一覧・作成/編集・ステータス管理・削除を検証しています。

## 今後の予定

- フェーズ2: カテゴリ・タグ・絞り込み・並び替え・予約公開
- フェーズ3: コメント機能、リッチテキスト編集、リビジョン管理
- フェーズ4: 認証・権限・通知・API化・最終仕上げ