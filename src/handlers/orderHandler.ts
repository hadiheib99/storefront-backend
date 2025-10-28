import express, { Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { OrderStore } from "../models/orderModel";
import { OrderProductStore } from "../models/orderProductModel";

const orders = new OrderStore();
const orderProducts = new OrderProductStore();

// Create order (protected)
const create = async (req: Request, res: Response) => {
  try {
    const { user_id, status } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id is required" });
    const created = await orders.create({ user_id: Number(user_id), status });
    res.status(201).json({ order: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Current active order by user (protected)
const currentByUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.user_id);
    const current = await orders.currentByUser(userId);
    res.json({ order: current });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

// Add product to order (protected)
const addProduct = async (req: Request, res: Response) => {
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const orderRouter = (app: express.Application) => {
  app.post("/orders", authenticateToken, create);
  app.get("/users/:user_id/orders/current", authenticateToken, currentByUser);
  app.post("/orders/:id/products", authenticateToken, addProduct);
};

export default orderRouter;
