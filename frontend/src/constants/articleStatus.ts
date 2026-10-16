import type { ArticleStatus } from "../types/article";

export const STATUS_VALUES: ArticleStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
];

export const STATUS_LABEL: Record<ArticleStatus, string> = {
  DRAFT: "下書き",
  PUBLISHED: "公開",
  ARCHIVED: "アーカイブ",
};

// Tailwindは、クラス名が「完全な文字列」でソースにあるものだけを拾うの
export const STATUS_BADGE_CLASS: Record<ArticleStatus, string> = {
  DRAFT: "bg-gray-200 text-gray-800",
  PUBLISHED: "bg-green-500 text-white",
  ARCHIVED: "bg-yellow-200 text-yellow-800",
};