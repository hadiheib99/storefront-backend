import request from "supertest";
import app from "../../src/server";
import { resetDatabase } from "../helpers/database";
import { signupAndLogin } from "../helpers/auth";

describe("Products Endpoints", () => {
  let token = "";
  let productId = 0;

  beforeAll(async () => {
    await resetDatabase();
    const boot = await signupAndLogin();
    token = boot.token;

    // Create a product we can GET later
    const create = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Notebook", price: Number(12.5), category: "stationery" });

    expect(create.status).toBe(201);
    productId = Number(create.body?.id);
    expect(Number.isFinite(productId)).toBeTrue();
  });

  it("POST /products → creates a product", async () => {
    const res = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Pencil", price: 2.5, category: "stationery" });

    expect(res.status).toBe(201);
    expect(res.body?.id).toBeDefined();
  });

  it("GET /products → lists products", async () => {
    const res = await request(app).get("/products");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTrue();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("GET /products/:id → returns product", async () => {
    const res = await request(app).get(`/products/${productId}`);
    expect(res.status).toBe(200);
    expect(Number(res.body?.id)).toBe(productId);
  });

  it("DELETE /products/:id → deletes product", async () => {
    const del = await request(app)
      .delete(`/products/${productId}`)
      .set("Authorization", `Bearer ${token}`);
    expect([200, 204]).toContain(del.status);
  });
});
