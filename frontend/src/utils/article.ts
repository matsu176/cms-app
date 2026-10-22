import dayjs from "dayjs";
import type { Article } from "../types/article";

// 公開ステータスで、公開日時がまだ先 → 「予約中」
export const isScheduled = (
  article: Pick<Article, "status" | "published_at">
): boolean =>
  article.status === "PUBLISHED" &&
  article.published_at !== null &&
  dayjs(article.published_at).isAfter(dayjs());