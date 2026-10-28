import type { RequestHandler } from "express";
import type { ZodType } from "zod";

// クエリパラメータを検証する。検証済みの値は res.locals.query に入れる
export const validateQuery =
  (schema: ZodType): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0]?.message ?? "検索条件が正しくありません",
        issues: result.error.issues,
      });
    }
    res.locals.query = result.data;
    next();
  };