import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchArticles } from "../api/articles";
import ArticleStatusSelect from "../components/ArticleStatusSelect";
import ArticleDeleteButton from "../components/ArticleDeleteButton";
import { STATUS_BADGE_CLASS, STATUS_LABEL } from "../constants/articleStatus";

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
    <div className="mx-auto max-w-3xl p-4">
      <button
        onClick={() => navigate("/articles/new")}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        新規作成
      </button>

      {isLoading && <p className="mt-4">読み込み中…</p>}

      {data && data.length === 0 && <p className="mt-4">記事はありません</p>}

      {data && data.length > 0 && (
        <ul className="mt-4 divide-y">
          {data.map((article) => (
            <li key={article.id} className="flex items-center gap-3 py-2">
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[article.status]}`}
              >
                {STATUS_LABEL[article.status]}
              </span>
              <span className="flex-1">{article.title}</span>
              <Link
                to={`/articles/${article.id}/edit`}
                className="text-sm text-blue-600 underline"
              >
                編集
              </Link>
              <ArticleStatusSelect article={article} />
              <ArticleDeleteButton article={article} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}