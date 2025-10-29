import request from "supertest";
import app from "../../src/server";
import { resetDatabase } from "../helpers/database";
import { signupAndLogin } from "../helpers/auth";

describe("Users Endpoints", () => {
  let token = "";
  let userId = 0;
  let email = "";

  beforeAll(async () => {
    await resetDatabase();
    const boot = await signupAndLogin();
    token = boot.token;
    userId = boot.userId;
    email = boot.email;
  });

  it("POST /users → creates another user (token optional)", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        firstname: "Ada",
        lastname: "Lovelace",
        email: `user_${Date.now()}@example.com`,
        password: "secret123",
      });

    expect([200, 201]).toContain(res.status);
    // Some implementations return {user, token}; some only {id,...}.
    // We accept either, but don't rely on token from here.
    expect(res.body?.user ?? res.body?.id).toBeDefined();
  });

  it("POST /users/authenticate → logs in and returns token", async () => {
    const res = await request(app).post("/users/authenticate").send({
      email,
      password: "secret123",
    });
    expect(res.status).toBe(200);
    expect(typeof res.body?.token).toBe("string");
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
    // If your show doesn't return email, skip this:
    if (res.body.email) {
      expect(res.body.email).toBe(email);
    }
  });

  it("DELETE /users/:id → deletes the user (auth required)", async () => {
    const res = await request(app)
      .delete(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect([200, 204]).toContain(res.status);
  });
});
