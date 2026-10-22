import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchArticles } from "../api/articles";
import ArticleStatusSelect from "../components/ArticleStatusSelect";
import ArticleDeleteButton from "../components/ArticleDeleteButton";
import Layout from "../components/Layout";
import Pagination from "../components/Pagination";
import dayjs from "dayjs";
import { isScheduled } from "../utils/article";
import {
  SCHEDULED_BADGE_CLASS,
  SCHEDULED_LABEL,
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
} from "../constants/articleStatus";

const PAGE_SIZE = 10;

export default function ArticleListPage() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["articles"],
    queryFn: fetchArticles,
  });

  const [searchParams] = useSearchParams();

// URLの ?page=2 から、ページ番号を取り出す（数字でなければ 1）
const requestedPage = Math.floor(Number(searchParams.get("page"))) || 1;

const totalCount = data?.length ?? 0;
const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

// 範囲外のページ番号（0、999 など）は、1〜最後の間に収める
const currentPage = Math.min(Math.max(1, requestedPage), totalPages);

// 表示するのは、このページの10件だけ
const pagedArticles = data
  ? data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  : [];

// 件数表示用：このページの先頭と末尾が、全体の何件目か
const rangeStart = (currentPage - 1) * PAGE_SIZE + 1;
const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalCount);

  useEffect(() => {
    if (isError) {
      toast.error("記事の取得に失敗しました", { id: "articles-fetch-error" });
    }
  }, [isError]);

  return (
  <Layout>
      {/* 見出し + 新規作成ボタン */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">記事一覧</h2>
        <button
          onClick={() => navigate("/articles/new")}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          新規作成
        </button>
      </div>

      {isLoading && <p className="mt-4">読み込み中…</p>}

      {data && data.length === 0 && <p className="mt-4">記事はありません</p>}

      {data && data.length > 0 && (
        <>
        {/* 件数の表示 */}
       <p className="mt-4 text-sm text-gray-600">
        全{totalCount}件中 {rangeStart}〜{rangeEnd}件を表示
       </p>
        <ul className="mt-4 divide-y divide-gray-200">
          {pagedArticles.map((article) => {
            // 一覧を表示するたびに、現在日時と比べて判定する
            const scheduled = isScheduled(article);

            return (
            <li key={article.id} className="flex items-center gap-3 py-3">
              {/* ステータスラベル（予約中のときは、青いバッジ） */}
              <span
                className={`w-20 shrink-0 rounded px-2 py-0.5 text-center text-xs font-medium ${
                  scheduled ? SCHEDULED_BADGE_CLASS :STATUS_BADGE_CLASS[article.status]
                }`}
                title={
                  scheduled
                    ? `${dayjs(article.published_at).format("YYYY/MM/DD HH:mm")} に公開予定`
                    : undefined
                }
              >
                {scheduled ? SCHEDULED_LABEL : STATUS_LABEL[article.status]}
              </span>

              {/* タイトルとスラッグ（長いときは「…」で省略） */}
              <div className="w-64 shrink-0">
                 <p className="truncate" title={article.title}>
                  {article.title}
                 </p>
                 <p className="truncate text-xs text-gray-500" title={article.slug}>
                  {article.slug}
                 </p>
              </div>

              {/* 編集リンク */}
              <Link
                to={`/articles/${article.id}/edit`}
                className="w-12 shrink-0 text-center text-sm text-blue-600 underline"
              >
                編集
              </Link>

              {/* ステータス選択 */}
              <div className="w-28 shrink-0">
                <ArticleStatusSelect article={article} />
              </div>

              {/* 削除ボタン */}
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