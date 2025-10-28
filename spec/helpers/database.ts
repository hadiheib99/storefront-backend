import db from "../../src/models/db";

export async function resetDatabase(): Promise<void> {
  const conn = await db.connect();
  try {
    await conn.query("SET session_replication_role = replica;");
    await conn.query(
      "TRUNCATE TABLE order_products, orders, products, users RESTART IDENTITY CASCADE;"
    );
    await conn.query("SET session_replication_role = DEFAULT;");
  } finally {
    conn.release();
  }
}

export async function closeDatabase(): Promise<void> {
  await db.end();
}
