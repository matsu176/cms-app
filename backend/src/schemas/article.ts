import { z } from "zod";

const statusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"], {
  message: "ステータスの値が不正です",
});

export const articleCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "タイトルを入力してください")
    .max(200, "タイトルは200文字以内で入力してください"),
  body: z.string().optional(),
  status: statusEnum.optional(), // 省略した場合は、ルート側でDRAFTにする
});

export const articleUpdateSchema = articleCreateSchema;

export const articleStatusSchema = z.object({
  status: statusEnum,
});