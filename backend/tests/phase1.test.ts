import { describe, it, expect, afterAll, vi } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

// ---------- 共通の準備 ----------

// テストで作った記事のIDを覚えておき、最後に削除する。
// （開発用に入れてあるデータを消さないため、deleteMany() の全件削除はしない）
const createdIds: number[] = [];

const createArticle = async (payload: Record<string, unknown>) => {
  const res = await request(app).post("/api/articles").send(payload);
  if (res.status === 201) createdIds.push(res.body.id);
  return res;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 存在しないIDとして使う値
const NOT_FOUND_ID = 999999999;

// 再起動のシミュレーションで作った接続も、最後に閉じる
const extraClients: { $disconnect: () => Promise<void> }[] = [];

afterAll(async () => {
  if (createdIds.length > 0) {
    await prisma.article.deleteMany({ where: { id: { in: createdIds } } });
  }
  await prisma.$disconnect();
  for (const client of extraClients) {
    await client.$disconnect();
  }
});

// ---------- ① 記事一覧 ----------

// describe("記事一覧（GET /api/articles）", () => {
//   it("配列で返る", async () => {
//     await createArticle({ title: "一覧テスト" });

//     const res = await request(app).get("/api/articles");

//     expect(res.status).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);
//     expect(res.body.length).toBeGreaterThan(0);
//   });

//   it("新しい順（created_at降順）で返る", async () => {
//     const older = await createArticle({ title: "古い記事" });
//     await sleep(20); // 作成日時が確実に違うようにする
//     const newer = await createArticle({ title: "新しい記事" });

//     const res = await request(app).get("/api/articles");
//     const ids: number[] = res.body.map((a: { id: number }) => a.id);

//     // 新しい記事のほうが、先に並んでいる
//     expect(ids.indexOf(newer.body.id)).toBeLessThan(ids.indexOf(older.body.id));

//     // 全体が降順になっている
//     const times: number[] = res.body.map((a: { created_at: string }) =>
//       new Date(a.created_at).getTime()
//     );
//     expect(times).toEqual([...times].sort((a, b) => b - a));
//   });
// });

// // ---------- ② 作成 ----------

// describe("記事の新規作成（POST /api/articles）", () => {
//   it("タイトルと本文を送ると、DRAFTで作成される", async () => {
//     const res = await createArticle({ title: "新規記事", body: "本文です" });

//     expect(res.status).toBe(201);
//     expect(res.body.id).toEqual(expect.any(Number));
//     expect(res.body.title).toBe("新規記事");
//     expect(res.body.body).toBe("本文です");
//     expect(res.body.status).toBe("DRAFT");
//     expect(res.body.published_at).toBeNull();
//   });

//   it("本文なしでも作成できる", async () => {
//     const res = await createArticle({ title: "本文なしの記事" });

//     expect(res.status).toBe(201);
//     expect(res.body.body).toBeNull();
//   });

//   it("リクエストでステータスを指定しても、常にDRAFTになる", async () => {
//     const res = await createArticle({ title: "公開指定の記事", status: "PUBLISHED" });

//     expect(res.status).toBe(201);
//     expect(res.body.status).toBe("DRAFT");
//   });

//   it("タイトルが空だと400", async () => {
//     const res = await createArticle({ title: "", body: "本文" });

//     expect(res.status).toBe(400);
//   });

//   it("タイトルが空白だけでも400", async () => {
//     const res = await createArticle({ title: "   " });

//     expect(res.status).toBe(400);
//   });

//   it("タイトルが200文字ならOK、201文字なら400", async () => {
//     const ok = await createArticle({ title: "あ".repeat(200) });
//     const ng = await createArticle({ title: "あ".repeat(201) });

//     expect(ok.status).toBe(201);
//     expect(ng.status).toBe(400);
//   });
// });

// // ---------- ③ 編集（取得・更新） ----------

// describe("記事の取得・更新（GET / PUT /api/articles/:id）", () => {
//   it("GETで記事を1件取得できる", async () => {
//     const created = await createArticle({ title: "取得テスト", body: "本文" });

//     const res = await request(app).get(`/api/articles/${created.body.id}`);

//     expect(res.status).toBe(200);
//     expect(res.body.id).toBe(created.body.id);
//     expect(res.body.title).toBe("取得テスト");
//   });

//   it("GETで存在しないIDだと404", async () => {
//     const res = await request(app).get(`/api/articles/${NOT_FOUND_ID}`);

//     expect(res.status).toBe(404);
//   });

//   it("PUTでタイトルと本文を更新できる", async () => {
//     const created = await createArticle({ title: "更新前", body: "更新前の本文" });
//     const id = created.body.id;

//     const res = await request(app)
//       .put(`/api/articles/${id}`)
//       .send({ title: "更新後", body: "更新後の本文" });

//     expect(res.status).toBe(200);
//     expect(res.body.title).toBe("更新後");

//     // 実際に保存されているか、取得し直して確認する
//     const fetched = await request(app).get(`/api/articles/${id}`);
//     expect(fetched.body.title).toBe("更新後");
//     expect(fetched.body.body).toBe("更新後の本文");
//   });

//   it("PUTで存在しないIDだと404", async () => {
//     const res = await request(app)
//       .put(`/api/articles/${NOT_FOUND_ID}`)
//       .send({ title: "存在しない記事" });

//     expect(res.status).toBe(404);
//   });

//   it("PUTでタイトルが空だと400", async () => {
//     const created = await createArticle({ title: "更新テスト" });

//     const res = await request(app)
//       .put(`/api/articles/${created.body.id}`)
//       .send({ title: "" });

//     expect(res.status).toBe(400);
//   });
// });

// // ---------- ④ ステータス管理 ----------

// describe("ステータス変更（PATCH /api/articles/:id/status）", () => {
//   it("公開に変更するとpublished_atが設定される", async () => {
//     // 準備：テスト対象の記事を1件作る
//     const created = await createArticle({ title: "はじめての記事", body: "本文" });
//     const articleId = created.body.id;

//     // 実行：ステータスをPUBLISHEDに変更する
//     const res = await request(app)
//       .patch(`/api/articles/${articleId}/status`)
//       .send({ status: "PUBLISHED" });

//     // 確認：期待した結果になっているか
//     expect(res.status).toBe(200);
//     expect(res.body.status).toBe("PUBLISHED");
//     expect(res.body.published_at).not.toBeNull();
//   });

//   it("公開から下書きに戻すとpublished_atがnullに戻る", async () => {
//     const created = await createArticle({ title: "戻すテスト" });
//     const id = created.body.id;
//     await request(app).patch(`/api/articles/${id}/status`).send({ status: "PUBLISHED" });

//     const res = await request(app)
//       .patch(`/api/articles/${id}/status`)
//       .send({ status: "DRAFT" });

//     expect(res.status).toBe(200);
//     expect(res.body.status).toBe("DRAFT");
//     expect(res.body.published_at).toBeNull();
//   });

//   it("アーカイブに変更してもpublished_atはnull", async () => {
//     const created = await createArticle({ title: "アーカイブテスト" });
//     const id = created.body.id;
//     await request(app).patch(`/api/articles/${id}/status`).send({ status: "PUBLISHED" });

//     const res = await request(app)
//       .patch(`/api/articles/${id}/status`)
//       .send({ status: "ARCHIVED" });

//     expect(res.status).toBe(200);
//     expect(res.body.status).toBe("ARCHIVED");
//     expect(res.body.published_at).toBeNull();
//   });

//   it("3値以外のステータスだと400", async () => {
//     const created = await createArticle({ title: "不正な値のテスト" });

//     const res = await request(app)
//       .patch(`/api/articles/${created.body.id}/status`)
//       .send({ status: "INVALID" });

//     expect(res.status).toBe(400);
//   });

//   it("存在しないIDだと404", async () => {
//     const res = await request(app)
//       .patch(`/api/articles/${NOT_FOUND_ID}/status`)
//       .send({ status: "PUBLISHED" });

//     expect(res.status).toBe(404);
//   });
// });

// // ---------- ⑤ 削除 ----------

// describe("記事の削除（DELETE /api/articles/:id）", () => {
//   it("削除すると204が返り、その後は取得できない", async () => {
//     const created = await createArticle({ title: "削除する記事" });
//     const id = created.body.id;

//     const res = await request(app).delete(`/api/articles/${id}`);
//     expect(res.status).toBe(204);

//     const fetched = await request(app).get(`/api/articles/${id}`);
//     expect(fetched.status).toBe(404);
//   });

//   it("削除した記事は、一覧にも出ない", async () => {
//     const created = await createArticle({ title: "一覧から消える記事" });
//     const id = created.body.id;

//     await request(app).delete(`/api/articles/${id}`);

//     const list = await request(app).get("/api/articles");
//     const ids: number[] = list.body.map((a: { id: number }) => a.id);
//     expect(ids).not.toContain(id);
//   });

//   it("存在しないIDだと404", async () => {
//     const res = await request(app).delete(`/api/articles/${NOT_FOUND_ID}`);

//     expect(res.status).toBe(404);
//   });
// });

// ---------- フェーズ1 完了条件の確認（DBの中身まで確認する） ----------

describe("フェーズ1 完了条件の確認", () => {
  // ① タイトルが空のまま保存しようとすると、エラーになり保存されない
  it("タイトルが空のまま保存しようとするとエラーになり、保存されない", async () => {
    const before = await prisma.article.count();

    const empty = await createArticle({ title: "", body: "本文だけある" });
    const blank = await createArticle({ title: "   ", body: "本文だけある" });
    const missing = await createArticle({ body: "本文だけある" });

    // エラーになる
    expect(empty.status).toBe(400);
    expect(blank.status).toBe(400);
    expect(missing.status).toBe(400);

    // DBの件数が増えていない = 保存されていない
    const after = await prisma.article.count();
    expect(after).toBe(before);
  });

  // ② ステータス変更で、statusとpublished_atが正しく更新される
  describe("ステータス変更でstatusとpublished_atが正しく更新される", () => {
    it("DRAFT→PUBLISHEDで、published_atに現在日時が設定される", async () => {
      const created = await createArticle({ title: "公開テスト" });
      const id = created.body.id;

      const before = Date.now();
      const res = await request(app)
        .patch(`/api/articles/${id}/status`)
        .send({ status: "PUBLISHED" });
      const after = Date.now();

      expect(res.status).toBe(200);

      // DBに実際に保存された値で確認する
      const saved = await prisma.article.findUniqueOrThrow({ where: { id } });
      expect(saved.status).toBe("PUBLISHED");
      expect(saved.published_at).not.toBeNull();

      // 設定された日時が「いま」に近い（前後1秒の余裕を見る）
      const publishedTime = saved.published_at!.getTime();
      expect(publishedTime).toBeGreaterThanOrEqual(before - 1000);
      expect(publishedTime).toBeLessThanOrEqual(after + 1000);
    });

    it.each(["DRAFT", "ARCHIVED"] as const)(
      "PUBLISHED→%sで、published_atが解除される（null）",
      async (nextStatus) => {
        const created = await createArticle({ title: "解除テスト" });
        const id = created.body.id;

        // 準備：いったん公開にする
        await request(app)
          .patch(`/api/articles/${id}/status`)
          .send({ status: "PUBLISHED" });

        // 実行：公開以外に変更する
        const res = await request(app)
          .patch(`/api/articles/${id}/status`)
          .send({ status: nextStatus });
        expect(res.status).toBe(200);

        // DBの値を確認する
        const saved = await prisma.article.findUniqueOrThrow({ where: { id } });
        expect(saved.status).toBe(nextStatus);
        expect(saved.published_at).toBeNull();
      }
    );
  });

  // ③ 削除すると、実際にDBから削除される
  it("削除操作を行うと、対象の記事が実際にDBから削除される", async () => {
    const target = await createArticle({ title: "削除される記事" });
    const other = await createArticle({ title: "残る記事" });
    const targetId = target.body.id;
    const otherId = other.body.id;

    // 削除前：DBにある
    expect(await prisma.article.findUnique({ where: { id: targetId } })).not.toBeNull();

    const res = await request(app).delete(`/api/articles/${targetId}`);
    expect(res.status).toBe(204);

    // 削除後：DBから消えている
    expect(await prisma.article.findUnique({ where: { id: targetId } })).toBeNull();

    // 他の記事は、巻き込まれていない
    expect(await prisma.article.findUnique({ where: { id: otherId } })).not.toBeNull();
  });

  // ④ アプリを再起動しても、保存した記事が失われない
  it("アプリ（Express）を再起動しても、保存した記事が失われない", async () => {
    const created = await createArticle({
      title: "再起動テスト",
      body: "再起動しても残るはず",
    });
    const id = created.body.id;

    // 再起動のシミュレーション：
    // モジュールを読み込み直して、アプリとDB接続を「新しく起動し直した」状態にする
    vi.resetModules();
    const { app: restartedApp } = await import("../src/app.js");
    const { prisma: restartedPrisma } = await import("../src/lib/prisma.js");
    extraClients.push(restartedPrisma);

    // 再起動後のアプリから、同じ記事が取得できる
    const res = await request(restartedApp).get(`/api/articles/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("再起動テスト");
    expect(res.body.body).toBe("再起動しても残るはず");

    // 一覧にも含まれている
    const list = await request(restartedApp).get("/api/articles");
    const ids: number[] = list.body.map((a: { id: number }) => a.id);
    expect(ids).toContain(id);
  });
});