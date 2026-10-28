import { useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";

type Props = {
  value: string; // URLに入っているキーワード
  onChange: (keyword: string) => void; // 入力が落ち着いたときに呼ぶ（親がURLを更新する）
};

export default function KeywordFilter({ value, onChange }: Props) {
  // 入力欄に、いま打っている文字
  const [input, setInput] = useState(value);
  // 300ms、入力が止まったときの文字
  const debounced = useDebounce(input, 300);

  // URL側の値が変わったとき（「戻る」ボタン、条件のクリアなど）、入力欄にも反映する。
  // effectではなく、描画の最中に、前の値と比べて行う
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    // 自分がURLに書いた値と同じなら、入力欄は触らない（入力の続きを、消さないため）
    if (value !== debounced) {
      setInput(value);
    }
  }

  // 入力が落ち着いたら、親に伝える
  useEffect(() => {
    if (debounced.trim() !== value) {
      onChange(debounced.trim());
    }
    // debounced が変わったときだけ動かしたいので、他の値は依存に入れない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <input
      id="keyword-filter"
      type="search"
      value={input}
      placeholder="タイトル・本文を検索"
      onChange={(e) => setInput(e.target.value)}
      className="w-56 rounded border border-gray-300 px-3 py-1.5 text-sm"
    />
  );
}