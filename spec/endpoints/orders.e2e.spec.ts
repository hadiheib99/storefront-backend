import request from "supertest";
import app from "../../src/server";
import { resetDatabase, closeDatabase } from "../helpers/database";

describe("Orders Endpoints", () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  let token = "";
  let userId = 0;
  let productId = 0;
  let orderId = 0;

  it("bootstrap → create a user (token) and a product", async () => {
    const u = await request(app)
      .post("/users")
      .send({
        firstname: "Order",
        lastname: "Owner",
        email: `order_${Date.now()}@example.com`,
        password: "secret123",
      });
    expect(u.status).toBe(201);
    token = u.body.token as string;
    userId = Number(u.body.user.id);

    const p = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Mouse", price: 25, category: "electronics" });

    expect(p.status).toBe(201);
    productId = Number(p.body.id);
  });

  it("POST /orders → creates order (auth)", async () => {
    const res = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: userId, status: "active" });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    orderId = Number(res.body.id);
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
    expect(Number(res.body.id)).toBe(orderId);
    expect(Number(res.body.user_id ?? res.body.userId)).toBe(userId);
  });

  it("POST /orders/:id/products → adds product to order (auth)", async () => {
    const res = await request(app)
      .post(`/orders/${orderId}/products`)
      .set("Authorization", `Bearer ${token}`)
      .send({ product_id: productId, quantity: 3 });

    expect(res.status).toBe(201);
    // accept snake_case or camelCase responses
    expect(Number(res.body.order_id ?? res.body.orderId)).toBe(orderId);
    expect(Number(res.body.product_id ?? res.body.productId)).toBe(productId);
    expect(Number(res.body.quantity)).toBe(3);
  });
});
