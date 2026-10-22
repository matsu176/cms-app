import { Router } from "express";
import { randomUUID } from "node:crypto";
import { prisma } from "./lib/prisma.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
import { validateBody } from "./middleware/validateBody.js";
import {
  articleCreateSchema,
  articleUpdateSchema,
  articleStatusSchema,
} from "./schemas/article.js";

export const articlesRouter = Router();

// :id が数字以外なら400
articlesRouter.param("id", (_req, res, next, value: string) => {
  if (!/^\d+$/.test(value)) {
    return res.status(400).json({ message: "記事IDが不正です" });
  }
  next();
});

// GET /api/articles — 一覧取得
articlesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const articles = await prisma.article.findMany({
      orderBy: { created_at: "desc" },
    });
    res.json(articles);
  })
);

// GET /api/articles/:id — 詳細取得
articlesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const article = await prisma.article.findUniqueOrThrow({
      where: { id: Number(req.params.id) },
    });
    res.json(article);
  })
);

// POST /api/articles — 新規作成
articlesRouter.post(
  "/",
  validateBody(articleCreateSchema),
  asyncHandler(async (req, res) => {
    const status = req.body.status ?? "DRAFT"; // 指定がなければ下書き

    // 公開のときだけ、公開日時を持つ。指定がなければ、現在日時（すぐ公開）
    let published_at: Date | null = null;
    if (status === "PUBLISHED") {
      published_at = req.body.published_at ?? new Date();
    }

    const article = await prisma.article.create({
      data: {
        ...req.body, // title, slug, body, status
        status,
        published_at: status === "PUBLISHED" ? new Date() : null,
        author_user_id: 1, // 仮：ユーザー機能ができたら差し替え
      },
    });
    res.status(201).json(article);
  })
);

// PUT /api/articles/:id — 更新
articlesRouter.put(
  "/:id",
  validateBody(articleUpdateSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    // 存在しないIDなら、ここで P2025 → 404
    const current = await prisma.article.findUniqueOrThrow({
      where: { id },
      select: { status: true, published_at: true },
    });

    // ステータスが指定されなければ、いまのステータスのまま
    const nextStatus = req.body.status ?? current.status;

    // 公開にした瞬間に現在日時。それ以外は null。
    // すでに公開中の記事を編集しただけなら、公開日時は変えない。
    let published_at: Date | null = null;
    if (nextStatus === "PUBLISHED") {
      if (req.body.published_at) {
        // 日時の指定あり → その日時（未来なら「予約中」）
        published_at = req.body.published_at;
      } else if (
        req.body.published_at === undefined &&
        current.status === "PUBLISHED"
      ) {
        // 日時を送っていない + すでに公開中 → 変えない
        published_at = current.published_at ?? new Date();
      } else {
        // 空欄（null）、または、新しく公開する → 現在日時
        published_at = new Date();
      }
    }

    const article = await prisma.article.update({
      where: { id },
      data: { ...req.body, published_at },
    });
    res.json(article);
  })
);

// PATCH /api/articles/:id/status — ステータス変更
articlesRouter.patch(
  "/:id/status",
  validateBody(articleStatusSchema),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const article = await prisma.article.update({
      where: { id: Number(req.params.id) },
      data: {
        status,
        published_at: status === "PUBLISHED" ? new Date() : null,
      },
    });
    res.json(article);
  })
);

// DELETE /api/articles/:id — 削除
articlesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.article.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  })
);