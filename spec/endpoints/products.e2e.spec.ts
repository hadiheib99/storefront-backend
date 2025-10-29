import request from "supertest";
import app from "../../src/server";
import { resetDatabase, closeDatabase } from "../helpers/database";

describe("Products Endpoints", () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  let token = "";
  let productId = 0;

  it("bootstrap → create a user and get token", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        firstname: "Prod",
        lastname: "Owner",
        email: `prod_${Date.now()}@example.com`,
        password: "secret123",
      });
    expect(res.status).toBe(201);
    token = res.body.token as string;
  });

  it("POST /products → creates a product", async () => {
    const res = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Notebook", price: 12.5, category: "stationery" });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    productId = Number(res.body.id);
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
    expect(Number(res.body.id)).toBe(productId);
  });

  it("DELETE /products/:id → deletes product", async () => {
    const res = await request(app)
      .delete(`/products/${productId}`)
      .set("Authorization", `Bearer ${token}`);

    expect([200, 204]).toContain(res.status);
  });
});
