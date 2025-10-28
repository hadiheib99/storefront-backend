import db from "./db";

export type Order = {
  id?: number;
  user_id: number;
  status?: "active" | "complete";
  created_at?: string;
};

export class OrderStore {
  async create(o: { user_id: number; status?: "active" | "complete" }): Promise<Order> {
    try {
      const conn = await db.connect();
      const sql = `INSERT INTO orders (user_id, status)
                   VALUES ($1, $2)
                   RETURNING id, user_id, status, created_at`;
      const result = await conn.query(sql, [o.user_id, o.status ?? "active"]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not create order for user ${o.user_id}: ${err}`);
    }
  }

  async currentByUser(user_id: number): Promise<Order> {
    try {
      const conn = await db.connect();
      const sql = `SELECT id, user_id, status, created_at
                   FROM orders
                   WHERE user_id = $1 AND status = 'active'
                   ORDER BY id DESC
                   LIMIT 1`;
      const result = await conn.query(sql, [user_id]);
      conn.release();
      if (result.rows.length === 0) {
        throw new Error(`No active order for user ${user_id}`);
      }
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not get current order for user ${user_id}: ${err}`);
    }
  }
}
