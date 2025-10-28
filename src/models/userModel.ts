import db from "./db";
import bcrypt from "bcrypt";

export type SafeUser = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  created_at?: string;
};

export type NewUser = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
};

const pepper = process.env.BCRYPT_PASSWORD as string;
const saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);

export class UserStore {
  async index(): Promise<SafeUser[]> {
    try {
      const conn = await db.connect();
      const sql =
        "SELECT id, firstname, lastname, email, created_at FROM users ORDER BY id";
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get users: ${err}`);
    }
  }

  async show(id: number): Promise<SafeUser> {
    try {
      const conn = await db.connect();
      const sql =
        "SELECT id, firstname, lastname, email, created_at FROM users WHERE id=$1";
      const result = await conn.query(sql, [id]);
      conn.release();
      if (result.rows.length === 0) throw new Error(`User ${id} not found`);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not find user ${id}: ${err}`);
    }
  }

  async create(u: NewUser): Promise<SafeUser> {
    try {
      const conn = await db.connect();
      const hash = bcrypt.hashSync(u.password + pepper, saltRounds);
      const sql = `INSERT INTO users (firstname, lastname, email, password_digest)
                   VALUES ($1, $2, $3, $4)
                   RETURNING id, firstname, lastname, email, created_at`;
      const result = await conn.query(sql, [
        u.firstname,
        u.lastname,
        u.email,
        hash,
      ]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not create user ${u.email}: ${err}`);
    }
  }

  async authenticate(
    email: string,
    password: string
  ): Promise<SafeUser | null> {
    try {
      const conn = await db.connect();
      const sql =
        "SELECT id, firstname, lastname, email, password_digest, created_at FROM users WHERE email=$1";
      const result = await conn.query(sql, [email]);
      conn.release();

      if (result.rows.length) {
        const user = result.rows[0];
        const valid = bcrypt.compareSync(
          password + pepper,
          user.password_digest
        );
        if (valid) {
          const { password_digest, ...safe } = user;
          return safe;
        }
      }
      return null;
    } catch (err) {
      throw new Error(`Authentication error for ${email}: ${err}`);
    }
  }

  // 🆕 Destroy user
  async destroy(id: number): Promise<void> {
    try {
      const conn = await db.connect();
      const sql = "DELETE FROM users WHERE id = $1";
      await conn.query(sql, [id]);
      conn.release();
    } catch (err) {
      throw new Error(`Could not delete user ${id}: ${err}`);
    }
  }
}
