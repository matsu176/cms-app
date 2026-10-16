import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("GET /api/articles", () => {
  it("200 を返す", async () => {
    const res = await request(app).get("/api/articles");
    expect(res.status).toBe(200);
  });
});