import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { getErrorMessage } from "../api/articles";
import { deleteTag, fetchTags } from "../api/tags";

export default function TagPage() {
  const queryClient = useQueryClient();

  const { data: tags, isLoading, isError } = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  useEffect(() => {
    if (isError) {
      toast.error("タグの取得に失敗しました", { id: "tags-fetch-error" });
    }
  }, [isError]);

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      toast.success("タグを削除しました");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      // 記事からタグが外れるので、記事一覧も取り直す
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "タグの削除に失敗しました"));
    },
  });

  const handleDelete = (id: number, name: string, count: number) => {
    const ok = window.confirm(
      `タグ「${name}」を削除しますか？\n${count}件の記事からタグが外れます（記事は削除されません）。`
    );
    if (ok) deleteMutation.mutate(id);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">タグ管理</h2>
        <Link to="/" className="text-sm text-blue-600 underline">
          記事一覧に戻る
        </Link>
      </div>

      {isLoading && <p className="mt-4">読み込み中…</p>}
      {tags && tags.length === 0 && <p className="mt-4">タグはありません</p>}

      {tags && tags.length > 0 && (
        <ul className="mt-4 divide-y divide-gray-200">
          {tags.map((tag) => {
            const count = tag._count?.articles ?? 0;
            const isDeleting =
              deleteMutation.isPending && deleteMutation.variables === tag.id;

            return (
              <li key={tag.id} className="flex items-center gap-3 py-3">
                <span className="flex-1 truncate">{tag.name}</span>
                <span className="w-24 shrink-0 text-right text-sm text-gray-500">
                  {count}件の記事
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(tag.id, tag.name, count)}
                  disabled={isDeleting}
                  className="w-20 shrink-0 rounded border border-red-500 px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {isDeleting ? "削除中…" : "削除"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Layout>
  );
}