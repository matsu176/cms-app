import { useState } from "react";
import { STATUS_LABEL, STATUS_VALUES } from "../constants/articleStatus";
import type { ArticleFormValues, ArticleStatus } from "../types/article";
import toast from "react-hot-toast";
import { generateSlug } from "../utils/slug";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../api/categories";
import { fetchTags } from "../api/tags";
import TagInput from "./TagInput";

type Props = {
  initialValues?: ArticleFormValues;
  isPending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: ArticleFormValues) => void;
  onCancel: () => void;
};

// <input type="datetime-local"> が使う形式
const DATETIME_LOCAL_FORMAT = "YYYY-MM-DDTHH:mm";

// ラベル列と入力欄の見た目（3つの行で共通にして、位置をそろえる）
const labelClass = "w-32 shrink-0 pt-2 text-sm font-medium";
const fieldClass = "w-full rounded border border-gray-300 px-3 py-2 text-sm";
// ボタンの形（一覧画面の「新規作成」ボタンと同じ形）
const buttonClass = "rounded px-4 py-2 text-sm disabled:opacity-50";

export default function ArticleForm({
  initialValues = { title: "", slug: "", body: "", status: "DRAFT", published_at: null, category_id: null,tags: [] },
  isPending,
  errorMessage,
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initialValues.title);
  const [slug, setSlug] = useState(initialValues.slug);
  const [body, setBody] = useState(initialValues.body);
  const [status, setStatus] = useState<ArticleStatus>(initialValues.status);
  const initialLocal = initialValues.published_at
  ? dayjs(initialValues.published_at).format(DATETIME_LOCAL_FORMAT)
  : "";
  const [publishedAt, setPublishedAt] = useState(initialLocal);
  const [categoryId, setCategoryId] = useState(
  initialValues.category_id === null ? "" : String(initialValues.category_id)
  );
  const { data: categories } = useQuery({
     queryKey: ["categories"],
     queryFn: fetchCategories,
   });
  const [tags, setTags] = useState<string[]>(initialValues.tags);
  const { data: existingTags } = useQuery({
     queryKey: ["tags"],
     queryFn: fetchTags,
   });

  // タイトルからスラッグ候補を作って、入力欄に入れる
  const handleGenerateSlug = () => {
    const candidate = generateSlug(title);
    if (candidate === "") {
      toast.error(
        "タイトルに英数字がないため、候補を作れません。スラッグを直接入力してください"
      );
      return;
    }
    setSlug(candidate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let published_at: string | null = null;
    if (status === "PUBLISHED" && publishedAt) {
    // 変更していなければ、元の値をそのまま送る（秒の端数がずれないように）
    published_at =
      publishedAt === initialLocal
        ? initialValues.published_at
        : dayjs(publishedAt).toISOString();
    }

    onSubmit({ 
      title, slug, body, status, published_at,
      category_id: categoryId === "" ? null : Number(categoryId),
      tags, 
    });
    };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* タイトル */}
      <div className="flex items-start gap-4">
        <label htmlFor="title" className={labelClass}>
          タイトル（必須）
        </label>
        <input
          id="title"
          type="text"
          value={title}
          maxLength={200}
          required
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass}
        />
      </div>

      {/* スラッグ */}
      <div className="flex items-start gap-4">
        <label htmlFor="slug" className={labelClass}>
          スラッグ（必須）
        </label>
        <div className="w-full">
          <div className="flex gap-2">
            <input
              id="slug"
              type="text"
              value={slug}
              maxLength={200}
              required
              pattern="[A-Za-z0-9\-]+"
              title="半角英数字とハイフンのみ使えます"
              onChange={(e) => setSlug(e.target.value)}
              className={`${fieldClass} min-w-0`}
            />
            <button
              type="button"
              onClick={handleGenerateSlug}
              className="shrink-0 rounded bg-gray-200 px-3 py-2 text-sm text-gray-800 hover:bg-gray-300"
            >
              タイトルから自動生成
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            半角英数字とハイフンのみ。ほかの記事と重複できません
          </p>
        </div>
      </div>

      {/* 本文 */}
      <div className="flex items-start gap-4">
        <label htmlFor="body" className={labelClass}>
          本文
        </label>
        <textarea
          id="body"
          value={body}
          rows={12}
          onChange={(e) => setBody(e.target.value)}
          className={fieldClass}
        />
      </div>

      {/* カテゴリ */}
      <div className="flex items-start gap-4">
        <label htmlFor="category" className={labelClass}>
         カテゴリ
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={`${fieldClass} !w-56`}
        >
          <option value="">カテゴリなし</option>
         {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* タグ */}
      <div className="flex items-start gap-4">
        <span className={labelClass}>タグ</span>
        <TagInput
          value={tags}
          onChange={setTags}
          suggestions={existingTags?.map((t) => t.name) ?? []}
        />
      </div>

      {/* ステータス */}
      <div className="flex items-start gap-4">
        <label htmlFor="status" className={labelClass}>
          ステータス
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ArticleStatus)}
          className={`${fieldClass} !w-40`}
        >
          {STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABEL[value]}
            </option>
          ))}
        </select>
      </div>

      {/* 公開日時 */}
      <div className="flex items-start gap-4">
        <label htmlFor="published_at" className={labelClass}>
         公開日時
        </label>
        <div className="w-full">
          <input
            id="published_at"
            type="datetime-local"
            value={publishedAt}
            disabled={status !== "PUBLISHED"}
            onChange={(e) => setPublishedAt(e.target.value)}
            className={`${fieldClass} !w-64 disabled:bg-gray-100 disabled:text-gray-400`}
          />
          <p className="mt-1 text-xs text-gray-500">
            ステータスが「公開」のときだけ設定できます。空欄なら保存した時点で公開され、
            未来の日時なら「予約中」になります
          </p>
         </div>
      </div>

      {/* エラーメッセージ（入力欄の左端にそろえる） */}
      {errorMessage && (
        <p role="alert" className="pl-36 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {/* ボタン（入力欄の左端にそろえて、ボタン同士は少し離す） */}
      <div className="flex gap-3 pl-36">
        <button
          type="submit"
          disabled={isPending}
          className={`${buttonClass} bg-blue-600 text-white hover:bg-blue-700`}
        >
          {isPending ? "保存中…" : "保存"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className={`${buttonClass} bg-gray-200 text-gray-800 hover:bg-gray-300`}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}