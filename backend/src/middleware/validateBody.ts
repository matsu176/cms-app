import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validateBody =
  (schema: ZodType): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0]?.message ?? "入力内容が正しくありません",
        issues: result.error.issues, // Zodのエラー内容
      });
    }
    req.body = result.data;
    next();
  };