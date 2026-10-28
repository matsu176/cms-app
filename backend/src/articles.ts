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
import {
  articleInclude,
  toArticleResponse,
  toTagCreateInput,
} from "./lib/articleTags.js";
import { validateQuery } from "./middleware/validateQuery.js";
import { articleQuerySchema, type ArticleQuery } from "./schemas/article.js";

export const articlesRouter = Router();

// :id が数字以外なら400
articlesRouter.param("id", (_req, res, next, value: string) => {
  if (!/^\d+$/.test(value)) {
    return res.status(400).json({ message: "記事IDが不正です" });
  }
  next();
});

// GET /api/articles — 一覧取得
// GET /api/articles — 一覧取得（絞り込み・検索つき）
articlesRouter.get(
  "/",
  validateQuery(articleQuerySchema),
  asyncHandler(async (_req, res) => {
    const { status, category, tag, keyword } = res.locals.query as ArticleQuery;

    // ?tag=1 は数値、?tag=1&tag=2 は配列で届くので、配列にそろえる
    const tagIds = tag === undefined ? [] : Array.isArray(tag) ? tag : [tag];

    // 指定された条件だけを、where に入れる（入れた条件は、すべて満たすもの = AND）
    const where = {
      ...(status && { status }),
      ...(category === "none" && { category_id: null }),
      ...(typeof category === "number" && { category_id: category }),
      // キーワード：タイトルまたは本文に、部分一致
      ...(keyword && {
        OR: [{ title: { contains: keyword } }, { body: { contains: keyword } }],
      }),
      // タグ：選んだタグのどれかひとつがついている記事
      ...(tagIds.length > 0 && {
        tags: { some: { tag_id: { in: tagIds } } },
      }),
    };

    const articles = await prisma.article.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: articleInclude,
    });
    res.json(articles.map(toArticleResponse));
  })
);

// GET /api/articles/:id — 詳細取得
articlesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const article = await prisma.article.findUniqueOrThrow({
      where: { id: Number(req.params.id) },
      include: articleInclude,
    });
    res.json(toArticleResponse(article));
  })
);

// POST /api/articles — 新規作成
articlesRouter.post(
  "/",
  validateBody(articleCreateSchema),
  asyncHandler(async (req, res) => {
    // tags は、Prismaにそのまま渡せないので、取り出しておく
    const { tags, ...fields } = req.body;
    const status = fields.status ?? "DRAFT";

    let published_at: Date | null = null;
    if (status === "PUBLISHED") {
      published_at = fields.published_at ?? new Date();
    }

    const article = await prisma.article.create({
      data: {
        ...fields,
        status,
        published_at,
        author_user_id: 1, // 仮：ユーザー機能ができたら差し替え
        tags: { create: toTagCreateInput(tags ?? []) },
      },
      include: articleInclude,
    });
    res.status(201).json(toArticleResponse(article));
  })
);

// PUT /api/articles/:id — 更新
articlesRouter.put(
  "/:id",
  validateBody(articleUpdateSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { tags, ...fields } = req.body;

    const current = await prisma.article.findUniqueOrThrow({
      where: { id },
      select: { status: true, published_at: true },
    });

    const nextStatus = fields.status ?? current.status;

    let published_at: Date | null = null;
    if (nextStatus === "PUBLISHED") {
      if (fields.published_at) {
        published_at = fields.published_at;
      } else if (fields.published_at === undefined && current.status === "PUBLISHED") {
        published_at = current.published_at ?? new Date();
      } else {
        published_at = new Date();
      }
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...fields,
        published_at,
        // tags が送られてきたときだけ、付け替える（省略なら、そのまま）
        ...(tags !== undefined && {
          tags: { deleteMany: {}, create: toTagCreateInput(tags) },
        }),
      },
      include: articleInclude,
    });
    res.json(toArticleResponse(article));
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

