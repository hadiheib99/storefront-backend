import express, { NextFunction, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { ProductStore } from "../models/productModel";

const products = new ProductStore();

type ProductCreateBody = {
  name: string;
  price: number;
  category?: string | null;
};
export const index = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rows = await products.index();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const show = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await products.show(Number(req.params.id));
    res.json(p);
  } catch (err) {
    next(err);
  }
};

export const create = async (
  req: Request<{ id: string }, {}, ProductCreateBody, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const p = await products.create(req.body);
    res.status(201).json(p);
  } catch (err) {
    next(err);
  }
};
export const destroy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // If your store method is named `remove` or `destroy`, use that name instead of `delete`.
    await products.destroy(Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};


const productRouter = (app: express.Application) => {
  app.get("/products", index);                 // public
  app.get("/products/:id", show);              // public
  app.post("/products", authenticateToken, create); // protected
};

export default productRouter;
