import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/auth";
import { UserStore } from "../models/userModel";

const store = new UserStore();

const destroy = async (req: Request, res: Response) => {
  try {
    await store.destroy(Number(req.params.id));
    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const index = async (_req: Request, res: Response) => {
  const users = await store.index();
  res.json({ users });
};

const show = async (req: Request, res: Response) => {
  const user = await store.show(Number(req.params.id));
  res.json({ user });
};

const create = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const created = await store.create({
      firstname,
      lastname,
      email,
      password,
    });
    const token = jwt.sign({ user: created }, process.env.JWT_SECRET as string);
    res.status(201).json({ user: created, token });
  } catch (err: any) {
    // Check for duplicate email error
    if (
      err.message.includes("duplicate key") &&
      err.message.includes("users_email_key")
    ) {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

const authenticate = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await store.authenticate(email, password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ user }, process.env.JWT_SECRET as string);
  res.json({ user, token });
};

const userRouter = (app: express.Application) => {
  app.get("/users", authenticateToken, index);
  app.get("/users/:id", authenticateToken, show);
  app.post("/users", create);
  app.post("/users/authenticate", authenticate);
  app.delete("/users/:id", authenticateToken, destroy); // 🆕 DELETE
};

export default userRouter;
