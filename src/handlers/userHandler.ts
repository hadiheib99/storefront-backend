import express from "express";
import type { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/auth";
import { UserStore } from "../models/userModel";

const store = new UserStore();

type UserCreateBody = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
};

type UserAuthBody = {
  email: string;
  password: string;
};

const destroy = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    await store.destroy(id);
    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const index = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const list = await store.index();
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const show = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const u = await store.show(Number(req.params.id));
    res.json(u);
  } catch (err) {
    next(err);
  }
};

export const create = async (
  req: Request<unknown, unknown, UserCreateBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const created = await store.create(req.body);

    // Generate JWT token for the new user
    const secret = process.env.JWT_SECRET || "supersecret";
    const token = jwt.sign({ sub: created.id, email: created.email }, secret, {
      expiresIn: "1h",
    });

    res.status(201).json({ user: created, token });
  } catch (err) {
    next(err);
  }
};

export const authenticate = async (
  req: Request<unknown, unknown, UserAuthBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const u = await store.authenticate(email, password);

    if (!u) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || "supersecret";
    const token = jwt.sign({ sub: u.id, email: u.email }, secret, {
      expiresIn: "1h",
    });

    res.json({ user: u, token });
  } catch (err) {
    next(err);
  }
};

const userRouter = (app: express.Application) => {
  app.get("/users", authenticateToken, index);
  app.get("/users/:id", authenticateToken, show);
  app.post("/users", create);
  app.post("/users/authenticate", authenticate);
  app.delete("/users/:id", authenticateToken, destroy); // 🆕 DELETE
};

export default userRouter;
