import request from "supertest";
import app from "../../src/server";
import { resetDatabase, closeDatabase } from "../helpers/database";

describe("Users Endpoints", () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  let token = "";
  let userId = 0;
  const email = `user_${Date.now()}@example.com`;
  const password = "secret123";

  it("POST /users → creates user and returns token", async () => {
    const res = await request(app).post("/users").send({
      firstname: "Ada",
      lastname: "Lovelace",
      email,
      password,
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeDefined();

    token = res.body.token as string;
    userId = Number(res.body.user.id);
  });

  it("POST /users/authenticate → logs in and returns token", async () => {
    const res = await request(app).post("/users/authenticate").send({
      email,
      password,
    });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
  });

  it("GET /users → lists users (auth required)", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTrue();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("GET /users/:id → returns a user (auth required)", async () => {
    const res = await request(app)
      .get(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Number(res.body.id)).toBe(userId);
    expect(res.body.email).toBe(email);
  });

  it("DELETE /users/:id → deletes the user (auth required)", async () => {
    const res = await request(app)
      .delete(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect([200, 204]).toContain(res.status);
  });
});
