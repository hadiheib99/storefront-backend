import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const {
  POSTGRES_HOST,
  POSTGRES_PORT, // ← ADD THIS
  POSTGRES_DB,
  POSTGRES_DB_TEST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  ENV,
} = process.env as Record<string, string>;

// Switch between test and dev databases
const database = ENV === "test" ? POSTGRES_DB_TEST : POSTGRES_DB;

const db = new Pool({
  host: POSTGRES_HOST,
  port: parseInt(POSTGRES_PORT || "5432"), // ← ADD THIS LINE
  database,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
});

export default db;
