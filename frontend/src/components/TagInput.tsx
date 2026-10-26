import { useState } from "react";

type Props = {
  value: string[];                    // いま付いているタグ名（チップ）
  onChange: (tags: string[]) => void; // 追加・削除したときに、新しい配列を渡す
  suggestions: string[];              // 既存のタグ名（オートコンプリートの候補）
};

const MAX_TAGS = 20;
const MAX_LENGTH = 30;

export default function TagInput({ value, onChange, suggestions }: Props) {
  const [text, setText] = useState("");

  const has = (name: string) =>
    value.some((t) => t.toLowerCase() === name.toLowerCase());

  // チップを追加する
  const addTag = (raw: string) => {
    const name = raw.trim();
    setText("");
    if (name === "" || name.length > MAX_LENGTH) return;
    if (has(name) || value.length >= MAX_TAGS) return;
    onChange([...value, name]); // 配列に追加（新しい配列を作る）
  };

  // チップを削除する
  const removeTag = (name: string) => {
    onChange(value.filter((t) => t !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    // 日本語の変換を確定するEnterは、無視する
    if (e.nativeEvent.isComposing) return;
    e.preventDefault(); // フォームが送信されないようにする
    addTag(text);
  };

  // 簡易オートコンプリート：入力中の文字列に前方一致する、未追加のタグ名
  const keyword = text.trim().toLowerCase();
  const candidates =
    keyword === ""
      ? []
      : suggestions
          .filter((name) => name.toLowerCase().startsWith(keyword) && !has(name))
          .slice(0, 8);

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap items-center gap-2 rounded border border-gray-300 px-2 py-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
          >
            {tag}
            <button
              type="button"
              aria-label={`タグ「${tag}」を外す`}
              onClick={() => removeTag(tag)}
              className="text-blue-600 hover:text-blue-900"
            >
              ×
            </button>
          </span>
        ))}

        <input
          type="text"
          value={text}
          maxLength={MAX_LENGTH}
          placeholder="タグを入力して Enter"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-w-[10rem] flex-1 px-1 py-1 text-sm outline-none"
        />
      </div>

      {/* 候補の一覧 */}
      {candidates.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded border border-gray-200 bg-white text-sm shadow">
          {candidates.map((name) => (
            <li key={name}>
              <button
                type="button"
                // click だと、入力欄のフォーカスが外れてしまうので、mousedown で受ける
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(name);
                }}
                className="block w-full px-3 py-2 text-left hover:bg-gray-100"
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-1 text-xs text-gray-500">
        Enterで追加、「×」で外せます。新しい名前は、保存すると新しいタグとして登録されます
      </p>
    </div>
  );
}