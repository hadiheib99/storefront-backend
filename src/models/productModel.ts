// src/models/productModel.ts
import db from "./db";

export type Product = {
  id?: number;
  name: string;
  price: number;
  category?: string | null;
  created_at?: string;
};

export class ProductStore {
  async index(): Promise<Product[]> {
    try {
      const conn = await db.connect();
      const sql = `SELECT id, name, price, category, created_at FROM products ORDER BY id`;
      const result = await conn.query(sql);
      conn.release();
      // Parse price to number for each product
      return result.rows.map((row) => ({
        ...row,
        price: parseFloat(row.price),
      }));
    } catch (err) {
      throw new Error(`Could not list products: ${err}`);
    }
  }

  async show(id: number): Promise<Product> {
    try {
      const conn = await db.connect();
      const sql = `SELECT id, name, price, category, created_at FROM products WHERE id = $1`;
      const result = await conn.query(sql, [id]);
      conn.release();
      if (result.rows.length === 0) {
        throw new Error(`Product ${id} not found`);
      }
      // Parse price to number
      const product = result.rows[0];
      return {
        ...product,
        price: parseFloat(product.price),
      };
    } catch (err) {
      throw new Error(`Could not find product ${id}: ${err}`);
    }
  }

  async create(p: Omit<Product, "id" | "created_at">): Promise<Product> {
    try {
      const conn = await db.connect();
      const sql = `INSERT INTO products (name, price, category)
                   VALUES ($1, $2, $3)
                   RETURNING id, name, price, category, created_at`;
      const result = await conn.query(sql, [
        p.name,
        p.price,
        p.category ?? null,
      ]);
      conn.release();
      // Parse price to number - THIS IS CRITICAL
      const product = result.rows[0];
      return {
        ...product,
        price: parseFloat(product.price),
      };
    } catch (err) {
      throw new Error(`Could not create product ${p.name}: ${err}`);
    }
  }

  async destroy(id: number): Promise<void> {
    try {
      const conn = await db.connect();
      const sql = `DELETE FROM products WHERE id = $1`;
      await conn.query(sql, [id]);
      conn.release();
    } catch (err) {
      throw new Error(`Could not delete product ${id}: ${err}`);
    }
  }
}
