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
     const id = Number(req.params.id);
     if (!Number.isFinite(id)) {
       return res.status(400).json({ error: "Invalid product id" });
     }
     const p = await products.show(id);
     if (!p) return res.status(404).json({ error: "Not found" });
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
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
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
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    await products.destroy(id);
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
