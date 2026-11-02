// 並び順の種類（URLの ?sort= に使う値）
export const ARTICLE_SORTS = [
  "created_desc",
  "updated_desc",
  "published_desc",
  "title_asc",
] as const;

export type ArticleSort = (typeof ARTICLE_SORTS)[number];

// 並び順 → Prismaの orderBy
// 最後に id を入れているのは、同じ値が並んだときも、順序が毎回同じになるようにするため
export const toOrderBy = (sort: ArticleSort) => {
  switch (sort) {
    case "updated_desc":
      return [{ updated_at: "desc" as const }, { id: "desc" as const }];
    case "published_desc":
      // 公開日時がない記事は、MySQLの降順では、最後に並ぶ
      return [
        { published_at: "desc" as const },
        { created_at: "desc" as const },
        { id: "desc" as const },
      ];
    case "title_asc":
      return [{ title: "asc" as const }, { id: "asc" as const }];
    default:
      return [{ created_at: "desc" as const }, { id: "desc" as const }];
  }
};