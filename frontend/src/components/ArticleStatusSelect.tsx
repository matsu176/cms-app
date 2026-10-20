import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateArticleStatus, getErrorMessage } from "../api/articles";
import { STATUS_LABEL, STATUS_VALUES } from "../constants/articleStatus";
import type { Article, ArticleStatus } from "../types/article";

type Props = {
  article: Article;
};

export default function ArticleStatusSelect({ article }: Props) {
  const queryClient = useQueryClient();

  // キャッシュ内の「この記事の行」だけを書き換える
  const patchCache = (changes: Partial<Article>) => {
    queryClient.setQueryData<Article[]>(["articles"], (old) =>
      old?.map((a) => (a.id === article.id ? { ...a, ...changes } : a))
    );
  };

  const mutation = useMutation({
    mutationFn: (status: ArticleStatus) =>
      updateArticleStatus(article.id, status),

    // 通信の前に、画面を先に書き換える（楽観的更新）
    onMutate: async (status) => {
      // 進行中の一覧取得が、書き換えを上書きしないように止める
      await queryClient.cancelQueries({ queryKey: ["articles"] });

      // ロールバック用に、変更前の値を控えておく
      const previous = {
        status: article.status,
        published_at: article.published_at,
      };

      patchCache({
        status,
        published_at: status === "PUBLISHED" ? new Date().toISOString() : null,
      });

      return { previous };
    },

    // 失敗したら、元の値に戻す（ロールバック）
    onError: (error, _status, context) => {
      if (context) patchCache(context.previous);
      toast.error(getErrorMessage(error, "ステータスの更新に失敗しました"));
    },

    onSuccess: () => {
      toast.success("ステータスを更新しました");
    },

    // 成功でも失敗でも、最後にサーバーの最新の状態と合わせる
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["articles"] }),
  });

  return (
    <select
      value={article.status}
      disabled={mutation.isPending} // 通信中は、この行だけ操作できない
      onChange={(e) => mutation.mutate(e.target.value as ArticleStatus)}
      className="w-full rounded border px-2 py-1 text-sm"
    >
      {STATUS_VALUES.map((value) => (
        <option key={value} value={value}>
          {STATUS_LABEL[value]}
        </option>
      ))}
    </select>
  );
}