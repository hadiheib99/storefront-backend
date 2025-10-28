import db from "./db";

export type OrderProduct = {
  id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
};

export class OrderProductStore {
  async add(op: { order_id: number; product_id: number; quantity: number }): Promise<OrderProduct> {
    try {
      const conn = await db.connect();
      const sql = `INSERT INTO order_products (order_id, product_id, quantity)
                   VALUES ($1, $2, $3)
                   RETURNING id, order_id, product_id, quantity`;
      const result = await conn.query(sql, [op.order_id, op.product_id, op.quantity]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not add product ${op.product_id} to order ${op.order_id}: ${err}`);
    }
  }
}
