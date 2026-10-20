import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchArticles } from "../api/articles";
import ArticleStatusSelect from "../components/ArticleStatusSelect";
import ArticleDeleteButton from "../components/ArticleDeleteButton";
import { STATUS_BADGE_CLASS, STATUS_LABEL } from "../constants/articleStatus";
import Layout from "../components/Layout";

export default function ArticleListPage() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["articles"],
    queryFn: fetchArticles,
  });

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
        // 各行の間に仕切り線（divide-y）
        <ul className="mt-4 divide-y divide-gray-200">
          {data.map((article) => (
            <li key={article.id} className="flex items-center gap-3 py-3">
              {/* ステータスラベル（バッジ） */}
              <span
                className={`w-20 shrink-0 rounded px-2 py-0.5 text-center text-xs font-medium ${STATUS_BADGE_CLASS[article.status]}`}
              >
                {STATUS_LABEL[article.status]}
              </span>

              {/* タイトル（長いときは「…」で省略） */}
              <span className="w-64 shrink-0 truncate" title={article.title}>
                {article.title}
              </span>

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
          ))}
        </ul>
      )}
   
  </Layout>
   );
  }