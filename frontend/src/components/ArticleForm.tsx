import { useState } from "react";
import { STATUS_LABEL, STATUS_VALUES } from "../constants/articleStatus";
import type { ArticleFormValues, ArticleStatus } from "../types/article";

type Props = {
  initialValues?: ArticleFormValues;
  isPending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: ArticleFormValues) => void;
  onCancel: () => void;
};

// ラベル列と入力欄の見た目（3つの行で共通にして、位置をそろえる）
const labelClass = "w-32 shrink-0 pt-2 text-sm font-medium";
const fieldClass = "w-full rounded border border-gray-300 px-3 py-2 text-sm";
// ボタンの形（一覧画面の「新規作成」ボタンと同じ形）
const buttonClass = "rounded px-4 py-2 text-sm disabled:opacity-50";

export default function ArticleForm({
  initialValues = { title: "", body: "", status: "DRAFT" },
  isPending,
  errorMessage,
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initialValues.title);
  const [body, setBody] = useState(initialValues.body);
  const [status, setStatus] = useState<ArticleStatus>(initialValues.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, body, status });
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