import express, { NextFunction, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { OrderStore } from "../models/orderModel";
import { OrderProductStore } from "../models/orderProductModel";

const orders = new OrderStore();
const orderProducts = new OrderProductStore();


type OrderCreateBody = {
  user_id: number;
  status?: "active" | "complete";
};

type AddProductBody = {
  product_id: number;
  quantity: number;
};

export const index = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const list = await orders.index();
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const show = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const o = await orders.show(Number(req.params.id));
    res.json(o);
  } catch (err) {
    next(err);
  }
};

export const create = async (
  req: Request<unknown, unknown, OrderCreateBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const o = await orders.create(req.body);
    res.status(201).json(o);
  } catch (err) {
    next(err);
  }
};

export const addProduct = async (
  req: Request<{ id: string }, unknown, AddProductBody>,
  res: Response,
  next: NextFunction
) => {
  
  try {
    const order_id = Number(req.params.id);
    const { product_id, quantity } = req.body;
    if (!product_id || quantity === undefined) {
      return res.status(400).json({ error: "product_id and quantity are required" });
      }
    
    const added = await orderProducts.add({
      order_id,
      product_id: Number(product_id),
      quantity: Number(quantity),
    });
    res.status(201).json({ order_product: added });
  } catch (err) {
    next(err);
  }
};
const currentByUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.user_id);
    const current = await orders.currentByUser(userId);
    res.json({ order: current });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

const orderRouter = (app: express.Application) => {
  app.post("/orders", authenticateToken, create);
  app.get("/users/:user_id/orders/current", authenticateToken, currentByUser);
  app.post("/orders/:id/products", authenticateToken, addProduct);
};

export default orderRouter;
