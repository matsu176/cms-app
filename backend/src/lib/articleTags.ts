// 記事を取得するときに、タグも一緒に取る指定
export const articleInclude = {
  tags: { include: { tag: true } },
} as const;

// タグ名の配列 → Prismaの「関連付けを作る」指定
// 存在するタグは再利用し、なければ新規作成する（connectOrCreate）
export const toTagCreateInput = (names: string[]) => {
  // 大文字・小文字だけが違う名前は、1つにまとめる
  const unique = [...new Map(names.map((n) => [n.toLowerCase(), n])).values()];

  return unique.map((name) => ({
    tag: {
      connectOrCreate: {
        where: { name },
        create: { name },
      },
    },
  }));
};

// 返事の形：tags を、中間テーブルの行ではなく、タグそのものの配列にする
export const toArticleResponse = <T extends { tags: { tag: unknown }[] }>(
  article: T
) => ({
  ...article,
  tags: article.tags.map((t) => t.tag),
});