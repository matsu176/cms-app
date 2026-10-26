import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { fetchArticles } from "../api/articles";
import { fetchCategories } from "../api/categories";
import { fetchTags } from "../api/tags";
import ArticleStatusSelect from "../components/ArticleStatusSelect";
import ArticleDeleteButton from "../components/ArticleDeleteButton";
import Layout from "../components/Layout";
import Pagination from "../components/Pagination";
import {
  SCHEDULED_BADGE_CLASS,
  SCHEDULED_LABEL,
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
} from "../constants/articleStatus";
import { isScheduled } from "../utils/article";

const PAGE_SIZE = 10;

export default function ArticleListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["articles"],
    queryFn: fetchArticles,
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  useEffect(() => {
    if (isError) {
      toast.error("記事の取得に失敗しました", { id: "articles-fetch-error" });
    }
  }, [isError]);

  // ---------- 絞り込み（URLの ?category=... ?tag=... と連動） ----------
  const categoryParam = searchParams.get("category"); // null：すべて ／ "none"：カテゴリなし ／ "3"：ID
  const tagParam = searchParams.get("tag"); // null：すべて ／ "3"：ID

  // 削除済みのカテゴリ・タグがURLに残っていたら、絞り込まない
  const categoryFilter =
    categoryParam === null ||
    categoryParam === "none" ||
    !categories ||
    categories.some((c) => String(c.id) === categoryParam)
      ? categoryParam
      : null;

  const tagFilter =
    tagParam === null || !tags || tags.some((t) => String(t.id) === tagParam)
      ? tagParam
      : null;

  // 条件は、すべて満たすものだけを残す（併用できる）
  const filteredArticles = (data ?? []).filter((article) => {
    if (categoryFilter === "none" && article.category_id !== null) return false;
    if (
      categoryFilter !== null &&
      categoryFilter !== "none" &&
      article.category_id !== Number(categoryFilter)
    ) {
      return false;
    }
    if (
      tagFilter !== null &&
      !article.tags.some((t) => t.id === Number(tagFilter))
    ) {
      return false;
    }
    return true;
  });

  const handleFilterChange = (key: "category" | "tag", value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.delete("page"); // 絞り込みを変えたら、1ページ目に戻す
    setSearchParams(next);
  };

  // ---------- ページング（絞り込んだ結果に対して行う） ----------
  const requestedPage = Math.floor(Number(searchParams.get("page"))) || 1;
  const totalCount = filteredArticles.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const pagedArticles = filteredArticles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const rangeStart = (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalCount);

  const categoryLabel = (categoryId: number | null) => {
    if (categoryId === null) return "カテゴリなし";
    return categories?.find((c) => c.id === categoryId)?.name ?? "";
  };

  const secondaryButton =
    "rounded bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300";

  return (
    <Layout>
      {/* 見出し + ボタン */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">記事一覧</h2>
        <div className="flex gap-2">
          <button onClick={() => navigate("/tags")} className={secondaryButton}>
            タグ管理
          </button>
          <button onClick={() => navigate("/categories")} className={secondaryButton}>
            カテゴリ管理
          </button>
          <button
            onClick={() => navigate("/articles/new")}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            新規作成
          </button>
        </div>
      </div>

      {/* 絞り込み */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="category-filter" className="text-sm font-medium">
            カテゴリ
          </label>
          <select
            id="category-filter"
            value={categoryFilter ?? ""}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-48 rounded border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">すべて</option>
            <option value="none">カテゴリなし</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="tag-filter" className="text-sm font-medium">
            タグ
          </label>
          <select
            id="tag-filter"
            value={tagFilter ?? ""}
            onChange={(e) => handleFilterChange("tag", e.target.value)}
            className="w-48 rounded border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">すべて</option>
            {tags?.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <p className="mt-4">読み込み中…</p>}

      {data && data.length === 0 && <p className="mt-4">記事はありません</p>}

      {data && data.length > 0 && filteredArticles.length === 0 && (
        <p className="mt-4">該当する記事はありません</p>
      )}

      {filteredArticles.length > 0 && (
        <>
          <p className="mt-4 text-sm text-gray-600">
            全{totalCount}件中 {rangeStart}〜{rangeEnd}件を表示
          </p>

          <ul className="mt-2 divide-y divide-gray-200">
            {pagedArticles.map((article) => {
              const scheduled = isScheduled(article);

              return (
                <li key={article.id} className="flex items-center gap-3 py-3">
                  <span
                    className={`w-20 shrink-0 rounded px-2 py-0.5 text-center text-xs font-medium ${
                      scheduled
                        ? SCHEDULED_BADGE_CLASS
                        : STATUS_BADGE_CLASS[article.status]
                    }`}
                    title={
                      scheduled
                        ? `${dayjs(article.published_at).format("YYYY/MM/DD HH:mm")} に公開予定`
                        : undefined
                    }
                  >
                    {scheduled ? SCHEDULED_LABEL : STATUS_LABEL[article.status]}
                  </span>

                  {/* タイトル / スラッグ・カテゴリ / タグ */}
                  <div className="w-64 shrink-0">
                    <p className="truncate" title={article.title}>
                      {article.title}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {article.slug} ／ {categoryLabel(article.category_id)}
                    </p>
                    {article.tags.length > 0 && (
                      <p className="truncate text-xs text-blue-700">
                        {article.tags.map((t) => `#${t.name}`).join(" ")}
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/articles/${article.id}/edit`}
                    className="w-12 shrink-0 text-center text-sm text-blue-600 underline"
                  >
                    編集
                  </Link>

                  <div className="w-28 shrink-0">
                    <ArticleStatusSelect article={article} />
                  </div>

                  <div className="w-20 shrink-0">
                    <ArticleDeleteButton article={article} />
                  </div>
                </li>
              );
            })}
          </ul>

          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </>
      )}
    </Layout>
  );
}