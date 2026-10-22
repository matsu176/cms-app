// タイトルから、スラッグ候補を作る
export const generateSlug = (title: string): string =>
  title
    .toLowerCase()                  // 小文字にする
    .replace(/\s+/g, "-")           // 空白をハイフンにする
    .replace(/[^a-z0-9-]/g, "")     // 使えない文字を取り除く
    .replace(/-+/g, "-")            // 連続するハイフンを、1つにする
    .replace(/^-|-$/g, "");         // 先頭と末尾のハイフンを、取り除く