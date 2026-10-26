export interface Tag {
  id: number;
  name: string;
  _count?: { articles: number }; // タグ一覧のAPIだけが返す（付いている記事の数）
}