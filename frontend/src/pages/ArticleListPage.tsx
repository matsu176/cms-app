import { useEffect } from "react"; 
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { fetchArticles, type ArticleFilters } from "../api/articles";
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
  STATUS_VALUES,
} from "../constants/articleStatus";
import { isScheduled } from "../utils/article";
import KeywordFilter from "../components/KeywordFilter"; 

const PAGE_SIZE = 10;

export default function ArticleListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ---------- ① 条件は、URLから読み取る（stateは使わない） ----------
  const statusParam = searchParams.get("status");
  const status = STATUS_VALUES.find((s) => s === statusParam); // 不正な値は無視

  const categoryParam = searchParams.get("category");
  const category =
    categoryParam === "none" || /^\d+$/.test(categoryParam ?? "")
      ? (categoryParam ?? undefined)
      : undefined;

  const tagIds = searchParams.getAll("tag").filter((id) => /^\d+$/.test(id));
  const keywordParam = searchParams.get("keyword") ?? "";

  const filters: ArticleFilters = { status, category, tags: tagIds, keyword: keywordParam };
  const hasFilter = Boolean(status || category || tagIds.length > 0 || keywordParam);

  // ---------- ② 条件を、URLに書き込む関数 ----------
  const updateParams = (
    changes: Record<string, string | string[] | null>,
    options?: { replace?: boolean }
  ) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      next.delete(key);
      if (value === null || value === "") continue;
      if (Array.isArray(value)) {
        value.forEach((v) => next.append(key, v)); // ?tag=1&tag=2
      } else {
        next.set(key, value);
      }
    }
    next.delete("page"); // 条件を変えたら、1ページ目に戻す
    setSearchParams(next, options);
  };

  // ---------- ④ データ取得：queryKey に条件を入れる ----------
  const { data, isLoading, isError, isPlaceholderData } = useQuery({
    queryKey: ["articles", filters], // 条件が変わると、別のキャッシュになり、自動で取り直される
    queryFn: () => fetchArticles(filters), // → GET /api/articles?status=...&keyword=...
    placeholderData: keepPreviousData, // 取得中も、前の一覧を表示しておく
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

  const toggleTag = (id: number) => {
    const key = String(id);
    const next = tagIds.includes(key)
      ? tagIds.filter((t) => t !== key)
      : [...tagIds, key];
    updateParams({ tag: next });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams()); // 条件も、ページも、全部消す
  };

  // ---------- ページング（絞り込み済みの結果に対して行う） ----------
  const articles = data ?? [];
  const requestedPage = Math.floor(Number(searchParams.get("page"))) || 1;
  const totalCount = articles.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const pagedArticles = articles.slice(
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
  const selectClass = "rounded border border-gray-300 px-3 py-1.5 text-sm";

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

      {/* 絞り込み・検索 */}
      <div className="mt-4 space-y-3 rounded border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm font-medium">
              ステータス
            </label>
            <select
              id="status-filter"
              value={status ?? ""}
              onChange={(e) => updateParams({ status: e.target.value })}
              className={`${selectClass} w-36`}
            >
              <option value="">すべて</option>
              {STATUS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABEL[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="category-filter" className="text-sm font-medium">
              カテゴリ
            </label>
            <select
              id="category-filter"
              value={category ?? ""}
              onChange={(e) => updateParams({ category: e.target.value })}
              className={`${selectClass} w-40`}
            >
              <option value="">すべて</option>
              <option value="none">カテゴリなし</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="keyword-filter" className="text-sm font-medium">
              キーワード
            </label>
            <KeywordFilter
              value={keywordParam}
            // 1文字ごとに、ブラウザの履歴が増えないよう、replace にする
              onChange={(keyword) => updateParams({ keyword }, { replace: true })}
            />
          </div>
        </div>

        {/* タグ（複数選択。ボタンのオン・オフ） */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">タグ</span>
          {tags && tags.length === 0 && (
            <span className="text-sm text-gray-500">タグはありません</span>
          )}
          {tags?.map((tag) => {
            const selected = tagIds.includes(String(tag.id));
            return (
              <button
                key={tag.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleTag(tag.id)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  selected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>

        <div>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasFilter}
            className="text-sm text-blue-600 underline disabled:text-gray-400 disabled:no-underline"
          >
            条件をクリア
          </button>
        </div>
      </div>

      {isLoading && <p className="mt-4">読み込み中…</p>}

      {data && articles.length === 0 && (
        <p className="mt-4">
          {hasFilter ? "該当する記事はありません" : "記事はありません"}
        </p>
      )}

      {articles.length > 0 && (
        // 条件を変えて、取得中のあいだは、少し薄くする
        <div className={isPlaceholderData ? "opacity-60" : ""}>
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
        </div>
      )}
    </Layout>
  );
}