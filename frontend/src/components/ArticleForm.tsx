import { useState } from "react";
import type { ArticleFormValues } from "../types/article";

type Props = {
  initialValues?: ArticleFormValues;
  isPending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: ArticleFormValues) => void;
  onCancel: () => void;
};

export default function ArticleForm({
  initialValues = { title: "", body: "" },
  isPending,
  errorMessage,
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initialValues.title);
  const [body, setBody] = useState(initialValues.body);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, body });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          タイトル（必須）
          <input
            type="text"
            value={title}
            maxLength={200}
            required
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label>
          本文
          <textarea
            value={body}
            rows={10}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
      </div>

      {errorMessage && <p role="alert">{errorMessage}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? "保存中…" : "保存"}
      </button>
      <button type="button" onClick={onCancel} disabled={isPending}>
        キャンセル
      </button>
    </form>
  );
}