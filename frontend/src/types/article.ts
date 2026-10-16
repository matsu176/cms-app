export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Article {
  id: number;
  title: string;
  body: string | null;
  status: ArticleStatus;
  published_at: string | null; // ISO 8601形式の文字列
  created_at: string;
  updated_at: string;
}

export type ArticleFormValues = {
  title: string;
  body: string;
};