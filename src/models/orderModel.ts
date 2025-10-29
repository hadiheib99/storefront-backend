import db from "./db";

// Table rows (exact column names as in your migrations)
type OrderRow = {
  id: number;
  user_id: number;
  status: "active" | "complete";
  created_at: string;
};

type OrderProductsRow = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
};

// Public types used by the app
export type Order = {
  id?: number;
  user_id: number;
  status: "active" | "complete";
  created_at?: string;
};

export type OrderCreate = {
  user_id: number;
  status?: "active" | "complete";
};

export class OrderStore {
  /**
   * List all orders
   */
  async index(): Promise<Order[]> {
    const conn = await db.connect();
    try {
      const sql =
        "SELECT id, user_id, status, created_at FROM orders ORDER BY id ASC";
      const result = await conn.query<OrderRow>(sql);
      // map 1:1 because types match; keep field names unchanged
      return result.rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        status: r.status,
        created_at: r.created_at,
      }));
    } finally {
      conn.release();
    }
  }

  /**
   * Get a single order by id
   */
  async show(id: number): Promise<Order> {
    const conn = await db.connect();
    try {
      const sql =
        "SELECT id, user_id, status, created_at FROM orders WHERE id = $1";
      const result = await conn.query<OrderRow>(sql, [id]);
      const r = result.rows[0];
      if (!r) {
        throw new Error(`Order ${id} not found`);
      }
      return {
        id: r.id,
        user_id: r.user_id,
        status: r.status,
        created_at: r.created_at,
      };
    } finally {
      conn.release();
    }
  }

  /**
   * Create new order
   */
  async create(o: OrderCreate): Promise<Order> {
    const conn = await db.connect();
    try {
      const sql =
        "INSERT INTO orders (user_id, status) VALUES ($1, COALESCE($2, 'active')) RETURNING id, user_id, status, created_at";
      const params: [number, "active" | "complete" | null] = [
        o.user_id,
        o.status ?? null,
      ];
      const result = await conn.query<OrderRow>(sql, params);
      const r = result.rows[0];
      return {
        id: r.id,
        user_id: r.user_id,
        status: r.status,
        created_at: r.created_at,
      };
    } finally {
      conn.release();
    }
  }

  /**
   * Add product to an order
   */
  async addProduct(
    order_id: number,
    product_id: number,
    quantity: number
  ): Promise<OrderProductsRow> {
    const conn = await db.connect();
    try {
      const sql =
        "INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING id, order_id, product_id, quantity, created_at";
      const params: [number, number, number] = [order_id, product_id, quantity];
      const result = await conn.query<OrderProductsRow>(sql, params);
      return result.rows[0];
    } finally {
      conn.release();
    }
  }

  /**
   * Delete an order (hard delete)
   */
  async delete(id: number): Promise<void> {
    const conn = await db.connect();
    try {
      await conn.query("DELETE FROM orders WHERE id = $1", [id]);
    } finally {
      conn.release();
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
      throw new Error(
        `Could not get current order for user ${user_id}: ${err}`
      );
    }
  }
}
