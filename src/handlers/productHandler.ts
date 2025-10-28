import express, { Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { ProductStore } from "../models/productModel";

const store = new ProductStore();

const index = async (_req: Request, res: Response) => {
  try {
    const products = await store.index();
    res.json({ products });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const show = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const prod = await store.show(id);
    res.json({ product: prod });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const { name, price, category } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: "name and price are required" });
    }
    const created = await store.create({ name, price: Number(price), category });
    res.status(201).json({ product: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const productRouter = (app: express.Application) => {
  app.get("/products", index);                 // public
  app.get("/products/:id", show);              // public
  app.post("/products", authenticateToken, create); // protected
};

export default productRouter;
