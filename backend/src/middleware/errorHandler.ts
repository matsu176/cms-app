import type { ErrorRequestHandler } from "express";

export const hasCode = (e: unknown, code: string) =>
  typeof e === "object" && e !== null && "code" in e && e.code === code;

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Prismaの「対象が見つからない」→ 404
  if (hasCode(err, "P2025")) {
    return res.status(404).json({ message: "記事が見つかりません" });
  }
  // ユニーク制約違反（スラッグの重複）→ 409
  // ※カテゴリ名の重複は、カテゴリのルートの中で処理している
  if (hasCode(err, "P2002")) {
    return res.status(409).json({ message: "このスラッグはすでに使われています" });
  };

  // 外部キー制約違反（存在しないカテゴリIDを指定）→ 400
  if (hasCode(err, "P2003")) {
    return res.status(400).json({ message: "指定されたカテゴリが存在しません" });
  }
  
  console.error(err);
  res.status(500).json({ message: "サーバーエラーが発生しました" });
};