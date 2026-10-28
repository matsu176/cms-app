import axios from "axios";
import type {
  Article,
  ArticleFormValues,
  ArticleStatus,
} from "../types/article";

export const createArticle = async (input: ArticleFormValues) => {
  const res = await axios.post("/api/articles", input);
  return res.data;
};

export const updateArticle = async (
  id: number,
  input: ArticleFormValues
): Promise<Article> => {
  const res = await axios.put<Article>(`/api/articles/${id}`, input);
  return res.data;
};

export const fetchArticle = async (id: number): Promise<Article> => {
  const res = await axios.get<Article>(`/api/articles/${id}`);
  return res.data;
};

export const deleteArticle = async (id: number): Promise<void> => {
  await axios.delete(`/api/articles/${id}`);
};

export const updateArticleStatus = async (id: number, status: ArticleStatus) => {
  const res = await axios.patch(`/api/articles/${id}/status`, { status });
  return res.data;
};

// サーバーのエラーメッセージを取り出す
export const getErrorMessage = (
  error: unknown,
  fallback = "保存に失敗しました"
): string => {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  return fallback;
};

// 一覧の絞り込み条件（URLのクエリパラメータと、同じ名前・同じ形）
export type ArticleFilters = {
  status?: ArticleStatus;
  category?: string; // カテゴリのID、または "none"
  tags?: string[]; // タグのID
  keyword?: string;
};

export const fetchArticles = async (
  filters: ArticleFilters = {}
): Promise<Article[]> => {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  filters.tags?.forEach((id) => params.append("tag", id)); // ?tag=1&tag=2
  if (filters.keyword) params.set("keyword", filters.keyword);

  const res = await axios.get<Article[]>("/api/articles", { params });
  return res.data;
};