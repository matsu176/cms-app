import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import ArticleForm from "../components/ArticleForm";
import { fetchArticle, updateArticle, getErrorMessage } from "../api/articles";
import type { ArticleFormValues } from "../types/article";

export default function ArticleEditPage() {
  const { id } = useParams();
  const articleId = Number(id);
  const isValidId = Number.isInteger(articleId) && articleId > 0;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", articleId],
    queryFn: () => fetchArticle(articleId),
    enabled: isValidId,
    gcTime: 0,
    retry: false,
  });

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
      <Layout>
        <p>記事が見つかりません</p>
        <Link to="/" className="text-blue-600 underline">
          一覧に戻る
        </Link>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <p>読み込み中…</p>
      </Layout>
    );
  }

  if (error || !article) {
    return (
      <Layout>
        <p>記事の取得に失敗しました</p>
        <Link to="/" className="text-blue-600 underline">
          一覧に戻る
        </Link>
      </Layout>
    );
  }

  return (
    <Layout>
      <h2 className="text-2xl font-semibold">記事の編集</h2>
      <ArticleForm
        key={article.id}
        initialValues={{
          title: article.title,
          slug: article.slug, 
          body: article.body ?? "",
          status: article.status,
          published_at: article.published_at, 
        }}
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? getErrorMessage(mutation.error) : null}
        onSubmit={(values) => mutation.mutate(values)}
        onCancel={() => navigate("/")}
      />
    </Layout>
  );
}