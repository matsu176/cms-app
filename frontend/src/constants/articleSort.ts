// 並び替えの選択肢（value は、URLの ?sort= とAPIで使う値）
export const SORT_OPTIONS = [
  { value: "created_desc", label: "作成日時が新しい順" },
  { value: "updated_desc", label: "更新日時が新しい順" },
  { value: "published_desc", label: "公開日時が新しい順" },
  { value: "title_asc", label: "タイトル昇順" },
] as const;

export type ArticleSort = (typeof SORT_OPTIONS)[number]["value"];

// 何も指定しないときの並び順
export const DEFAULT_SORT: ArticleSort = "created_desc";