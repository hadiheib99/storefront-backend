import { UserStore } from "../src/models/userModel";
import { resetDatabase } from "./helpers/database";

const users = new UserStore();

describe("User Model", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("should have index/show/create/authenticate/destroy methods", () => {
    expect(users.index).toBeDefined();
    expect(users.show).toBeDefined();
    expect(users.create).toBeDefined();
    expect(users.authenticate).toBeDefined();
    expect(users.destroy).toBeDefined();
  });

  it("create should add a user and return safe fields", async () => {
    const email = `spec_user_${Date.now()}@example.com`;
    const u = await users.create({
      firstname: "Spec",
      lastname: "User",
      email,
      password: "secret123",
    });
    expect(u.id).toBeDefined();
    expect(u.firstname).toBe("Spec");
    expect(u.lastname).toBe("User");
    expect(u.email).toBe(email);
    expect((u as any).password_digest).toBeUndefined();
  });

  it("authenticate should return a safe user for correct credentials", async () => {
    const email = `spec_user_${Date.now()}@example.com`;
    // Create user first
    await users.create({
      firstname: "Spec",
      lastname: "User",
      email,
      password: "secret123",
    });

    const u = await users.authenticate(email, "secret123");
    expect(u).not.toBeNull();
    if (u) {
      expect(u.email).toBe(email);
      expect((u as any).password_digest).toBeUndefined();
    }
  });

  it("index should list users", async () => {
    const email = `spec_user_${Date.now()}@example.com`;
    // Create user first
    await users.create({
      firstname: "Spec",
      lastname: "User",
      email,
      password: "secret123",
    });

    const list = await users.index();
    expect(Array.isArray(list)).toBeTrue();
    expect(list.length).toBeGreaterThan(0);
  });

  it("show should fetch the created user", async () => {
    const email = `spec_user_${Date.now()}@example.com`;
    // Create user first
    const created = await users.create({
      firstname: "Spec",
      lastname: "User",
      email,
      password: "secret123",
    });

    const u = await users.show(created.id);
    expect(u.id).toBe(created.id);
    expect(u.email).toBe(email);
  });

  it("destroy should delete the user without throwing", async () => {
    const email = `spec_user_${Date.now()}@example.com`;
    // Create user first
    const created = await users.create({
      firstname: "Spec",
      lastname: "User",
      email,
      password: "secret123",
    });

    await expectAsync(users.destroy(created.id)).toBeResolved();
  });
});
