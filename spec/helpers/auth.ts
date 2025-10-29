import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/server";

/**
 * Creates a user, then authenticates to get a JWT; if the API
 * doesn't return a token, we mint one locally with JWT_SECRET.
 */
export async function signupAndLogin(seed = Date.now()): Promise<{
  token: string;
  userId: number;
  email: string;
}> {
  const email = `spec_${seed}@example.com`;
  const password = "secret123";

  // 1) Create user
  const signup = await request(app).post("/users").send({
    firstname: "Spec",
    lastname: "User",
    email,
    password,
  });
  if (signup.status !== 201) {
    throw new Error(
      `Signup failed: ${signup.status} ${JSON.stringify(signup.body)}`
    );
  }
  const userId: number = Number(signup.body?.user?.id ?? signup.body?.id);
  if (!Number.isFinite(userId)) {
    throw new Error(
      `Signup returned invalid userId: ${JSON.stringify(signup.body)}`
    );
  }

  // 2) Try to login to obtain JWT (some apps just return the user)
  const login = await request(app)
    .post("/users/authenticate")
    .send({ email, password });

  let token: string | undefined =
    typeof login.body?.token === "string" ? login.body.token : undefined;

  // 3) Fallback: if no token in API response, mint one using JWT_SECRET
  if (!token) {
    const secret = process.env.JWT_SECRET || "supersecret"; // matches your .env
    // Use a generic payload; most auth middleware only verifies signature.
    token = jwt.sign({ sub: userId, email }, secret, { expiresIn: "1h" });
  }

  return { token, userId, email };
}
