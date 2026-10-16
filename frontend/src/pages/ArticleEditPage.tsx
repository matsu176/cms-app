import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import ArticleForm from "../components/ArticleForm";
import {
  fetchArticle,
  updateArticle,
  getErrorMessage,
} from "../api/articles";
import type { ArticleFormValues } from "../types/article";

export default function ArticleEditPage() {
  const { id } = useParams();
  const articleId = Number(id);
  const isValidId = Number.isInteger(articleId) && articleId > 0;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 初期値の取得（GET /api/articles/{id}）
  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", articleId],
    queryFn: () => fetchArticle(articleId),
    enabled: isValidId,
    gcTime: 0, // 画面を離れたらキャッシュを捨てて、開くたびに最新を取得
    retry: false, // 404のときに何度も再試行しない
  });

  // 更新（PUT /api/articles/{id}）
  const mutation = useMutation({
    mutationFn: (values: ArticleFormValues) => updateArticle(articleId, values),
    onSuccess: () => {
      toast.success("保存しました");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      navigate("/");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const notFound =
    !isValidId || (axios.isAxiosError(error) && error.response?.status === 404);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <p>記事が見つかりません</p>
        <Link to="/" className="text-blue-600 underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <p>読み込み中…</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <p>記事の取得に失敗しました</p>
        <Link to="/" className="text-blue-600 underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-xl font-bold">記事の編集</h1>
      <ArticleForm
        key={article.id}
        initialValues={{ title: article.title, body: article.body ?? "" }}
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? getErrorMessage(mutation.error) : null}
        onSubmit={(values) => mutation.mutate(values)}
        onCancel={() => navigate("/")}
      />
    </div>
  );
}