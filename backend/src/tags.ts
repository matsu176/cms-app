import { Router } from "express";
import { prisma } from "./lib/prisma.js";
import { asyncHandler } from "./middleware/asyncHandler.js";

export const tagsRouter = Router();

tagsRouter.param("id", (_req, res, next, value: string) => {
  if (!/^\d+$/.test(value)) {
    return res.status(400).json({ message: "タグIDが不正です" });
  }
  next();
});

// GET /api/tags — 一覧（何件の記事に付いているかも返す）
tagsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } },
    });
    res.json(tags);
  })
);

// DELETE /api/tags/:id — 削除
// 記事との関連付けは、DBが自動で外す（onDelete: Cascade）。記事は消えない
tagsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.tag.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  })
);