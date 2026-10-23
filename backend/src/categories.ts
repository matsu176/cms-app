import { Router } from "express";
import { prisma } from "./lib/prisma.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
import { validateBody } from "./middleware/validateBody.js";
import { hasCode } from "./middleware/errorHandler.js";
import { categoryCreateSchema } from "./schemas/category.js";

export const categoriesRouter = Router();

// :id が数字以外なら400
categoriesRouter.param("id", (_req, res, next, value: string) => {
  if (!/^\d+$/.test(value)) {
    return res.status(400).json({ message: "カテゴリIDが不正です" });
  }
  next();
});

// GET /api/categories — 一覧
categoriesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: { id: "asc" },
    });
    res.json(categories);
  })
);

// POST /api/categories — 新規作成
categoriesRouter.post(
  "/",
  validateBody(categoryCreateSchema),
  asyncHandler(async (req, res) => {
    try {
      const category = await prisma.category.create({ data: req.body });
      res.status(201).json(category);
    } catch (e) {
      // 名前の重複（ユニーク制約違反）
      if (hasCode(e, "P2002")) {
        return res
          .status(409)
          .json({ message: "このカテゴリ名はすでに使われています" });
      }
      throw e;
    }
  })
);

// DELETE /api/categories/:id — 削除
// 所属していた記事の category_id は、DBが自動で NULL にする（onDelete: SetNull）
categoriesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  })
);