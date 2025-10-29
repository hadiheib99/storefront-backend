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
    await store.destroy(Number(req.params.id));
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
    res.status(201).json(created);
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
    res.json(u);
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
