import { z } from "zod";

const statusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"], {
  message: "ステータスの値が不正です",
});

// スラッグ：英数字とハイフンのみ、必須
const slugSchema = z
  .string()
  .trim()
  .min(1, "スラッグを入力してください")
  .max(200, "スラッグは200文字以内で入力してください")
  .regex(/^[a-zA-Z0-9-]+$/, "スラッグは半角英数字とハイフンのみで入力してください");

export const articleCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "タイトルを入力してください")
    .max(200, "タイトルは200文字以内で入力してください"),
  slug: slugSchema,
  body: z.string().optional(),
  status: statusEnum.optional(),
  published_at: z.coerce
    .date({ message: "公開日時の形式が正しくありません" })
    .nullable()
    .optional(),
  // カテゴリ：IDか、null（カテゴリなし）。省略も可
  category_id: z.number().int().positive().nullable().optional(),
});

// 更新：スラッグを送らなければ「変更しない」。送るなら、同じルールでチェックする
export const articleUpdateSchema = articleCreateSchema.extend({
  slug: slugSchema.optional(),
});

export const articleStatusSchema = z.object({
  status: statusEnum,
});