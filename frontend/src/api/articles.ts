import axios from "axios";
import type {
  Article,
  ArticleFormValues,
  ArticleStatus,
} from "../types/article";

export const fetchArticles = async (): Promise<Article[]> => {
  const res = await axios.get<Article[]>("/api/articles");
  return res.data;
};


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