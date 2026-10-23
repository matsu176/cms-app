import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "カテゴリ名を入力してください")
    .max(100, "カテゴリ名は100文字以内で入力してください"),
});