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
    const article = await prisma.article.create({
      data: {
        ...req.body,
        slug: randomUUID(), // 仮：必須・重複不可のため自動生成
        status: "DRAFT",
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
    const article = await prisma.article.update({
      where: { id: Number(req.params.id) },
      data: req.body,
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