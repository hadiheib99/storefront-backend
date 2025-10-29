import request from "supertest";

import app from "../../src/server";
import { resetDatabase } from "../helpers/database";
import { signupAndLogin } from "../helpers/auth";

describe("Orders Endpoints", () => {
  let token = "";
  let userId = 0;
  let productId = 0;
  let orderId = 0;

  beforeAll(async () => {
    await resetDatabase();
    const boot = await signupAndLogin();
    token = boot.token;
    userId = boot.userId;

    // create product for order
    const p = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Mouse", price: 25, category: "electronics" });

    expect(p.status).toBe(201);
    productId = Number(p.body?.id);
    expect(Number.isFinite(productId)).toBeTrue();
  });

  it("POST /orders → creates order (auth)", async () => {
    const res = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: userId, status: "active" });

    expect(res.status).toBe(201);
    orderId = Number(res.body?.id);
    expect(Number.isFinite(orderId)).toBeTrue();
  });

  it("GET /orders → lists orders (auth)", async () => {
    const res = await request(app)
      .get("/orders")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTrue();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("GET /orders/:id → returns order (auth)", async () => {
    const res = await request(app)
      .get(`/orders/${orderId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Number(res.body?.id)).toBe(orderId);
    const uid = Number(res.body?.user_id ?? res.body?.userId);
    expect(uid).toBe(userId);
  });

  it("POST /orders/:id/products → adds product to order (auth)", async () => {
    const res = await request(app)
      .post(`/orders/${orderId}/products`)
      .set("Authorization", `Bearer ${token}`)
      .send({ product_id: productId, quantity: 3 });

    expect(res.status).toBe(201);
    expect(Number(res.body?.order_id ?? res.body?.orderId)).toBe(orderId);
    expect(Number(res.body?.product_id ?? res.body?.productId)).toBe(productId);
    expect(Number(res.body?.quantity)).toBe(3);
  });
});
