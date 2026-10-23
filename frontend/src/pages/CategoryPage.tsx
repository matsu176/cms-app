import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import { getErrorMessage } from "../api/articles";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
} from "../api/categories";

export default function CategoryPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    if (isError) {
      toast.error("カテゴリの取得に失敗しました", { id: "categories-fetch-error" });
    }
  }, [isError]);

  // 作成
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("カテゴリを追加しました");
      setName("");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "カテゴリの追加に失敗しました"));
    },
  });

  // 削除
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("カテゴリを削除しました");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      // 所属していた記事は「カテゴリなし」に変わるので、記事一覧も取り直す
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "カテゴリの削除に失敗しました"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(name.trim());
  };

  const handleDelete = (id: number, categoryName: string) => {
    const ok = window.confirm(
      `カテゴリ「${categoryName}」を削除しますか？\nこのカテゴリの記事は「カテゴリなし」になります。`
    );
    if (ok) deleteMutation.mutate(id);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">カテゴリ管理</h2>
        <Link to="/" className="text-sm text-blue-600 underline">
          記事一覧に戻る
        </Link>
      </div>

      {/* 追加フォーム */}
      <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
        <input
          type="text"
          value={name}
          maxLength={100}
          required
          placeholder="カテゴリ名（例：技術）"
          onChange={(e) => setName(e.target.value)}
          className="w-64 rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createMutation.isPending ? "追加中…" : "追加"}
        </button>
      </form>

      {isLoading && <p className="mt-4">読み込み中…</p>}
      {categories && categories.length === 0 && (
        <p className="mt-4">カテゴリはありません</p>
      )}

      {categories && categories.length > 0 && (
        <ul className="mt-4 divide-y divide-gray-200">
          {categories.map((category) => {
            const isDeleting =
              deleteMutation.isPending && deleteMutation.variables === category.id;

            return (
              <li key={category.id} className="flex items-center gap-3 py-3">
                <span className="flex-1 truncate">{category.name}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(category.id, category.name)}
                  disabled={isDeleting}
                  className="w-20 rounded border border-red-500 px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
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