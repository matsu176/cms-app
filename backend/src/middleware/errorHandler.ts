import type { ErrorRequestHandler } from "express";

const hasCode = (e: unknown, code: string) =>
  typeof e === "object" && e !== null && "code" in e && e.code === code;

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Prismaの「対象が見つからない」→ 404
  if (hasCode(err, "P2025")) {
    return res.status(404).json({ message: "記事が見つかりません" });
  }
  console.error(err);
  res.status(500).json({ message: "サーバーエラーが発生しました" });
};