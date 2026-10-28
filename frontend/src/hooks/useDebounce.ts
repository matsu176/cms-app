import { useEffect, useState } from "react";

// value が変わってから、delay ミリ秒のあいだ、変わらなければ、その値を返す
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // delay ミリ秒後に、値を反映するタイマーをセットする
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    // 次の入力が来たら（または画面から消えるとき）、前のタイマーを取り消す
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}