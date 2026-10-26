import type { Tag } from "./tag";

export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Article {
  id: number;
  title: string;
  slug: string; 
  body: string | null;
  status: ArticleStatus;
  published_at: string | null; // ISO 8601形式の文字列
  created_at: string;
  updated_at: string;
  category_id: number | null;
  tags: Tag[];
}

export type ArticleFormValues = {
  title: string;
  slug: string;
  body: string;
  status: ArticleStatus;
  published_at: string | null; 
  category_id: number | null;
  tags: string[]; 
};