import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteArticle, getErrorMessage } from "../api/articles";
import type { Article } from "../types/article";

type Props = {
  article: Article;
};

export default function ArticleDeleteButton({ article }: Props) {
  const queryClient = useQueryClient();

  // ③ useMutationでDELETE /api/articles/{id}を呼ぶ
  const mutation = useMutation({
    mutationFn: () => deleteArticle(article.id),

    // ④ 成功時：一覧のキャッシュから対象記事を取り除き、トーストを出す
    onSuccess: () => {
      queryClient.setQueriesData<Article[]>({ queryKey: ["articles"] }, (old) =>
        old?.filter((a) => a.id !== article.id)
      );
      toast.success("削除しました");
    },

    // ⑤ 失敗時：トーストでエラーメッセージを表示する
    onError: (error) => {
      toast.error(getErrorMessage(error, "削除に失敗しました"));
    },
  });

  // ② クリック時：確認ダイアログを出し、OKのときだけ③を実行する
  const handleClick = () => {
    const ok = window.confirm(
      `「${article.title}」を削除しますか？\nこの操作は取り消せません。`
    );
    if (ok) {
      mutation.mutate();
    }
  };

  // ① 「削除」ボタン
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={mutation.isPending}
      aria-label={`「${article.title}」を削除`}
      className="w-full rounded border border-red-500 px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {mutation.isPending ? "削除中…" : "削除"}
    </button>
  );
}