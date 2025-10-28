# REQUIREMENTS

This document enumerates all operational details required by the reviewer.

## 1) Port Numbers
- **API Server:** 3000
- **PostgreSQL (host port):** 5433 (mapped to container 5432)

## 2) Environment Variables
Same as in `.env` (example values):
```
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5433
POSTGRES_DB=store_dev
POSTGRES_DB_TEST=store_test
POSTGRES_USER=store_user
POSTGRES_PASSWORD=store_pass
ENV=test


JWT_SECRET=supersecret
BCRYPT_PASSWORD=pepper_string
SALT_ROUNDS=10
```

## 3) Package Installation
```bash
npm install
```

## 4) Setup: DB and Server
- With Docker:
  1. `npm run docker:up`
  2. `npm run migrate:dev && npm run migrate:test`
  3. `npm run dev` (or `npm start`)

- Without Docker:
  1. Create dev & test databases from `.env`
  2. `npm run migrate:dev && npm run migrate:test`
  3. Start the app with `npm run dev`

## 5) Database Schema (Columns & Types)
```sql
-- 20251026104213-users-up.sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname  VARCHAR(100) NOT NULL,
  email     VARCHAR(200) UNIQUE NOT NULL,
  password_digest VARCHAR(200) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 20251026104215-products-up.sql
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 20251026104216-orders-up.sql
CREATE TYPE order_status AS ENUM ('active', 'complete');
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 20251026104218-order-products-up.sql
CREATE TABLE IF NOT EXISTS order_products (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);
```

## 6) Endpoints (at `http://localhost:3000`)
| Method | Path | Auth | Description |
|-------|------|------|-------------|
| GET | `/` | none | Health check: returns message and top-level routes. |
| POST | `/users` | none | Create user and returns JWT. |
| POST | `/users/authenticate` | none | Authenticate user and returns JWT. |
| GET | `/users` | Bearer token | List all users. |
| GET | `/users/:id` | Bearer token | Get user by id. |
| DELETE | `/users/:id` | Bearer token | Delete user by id. |
| GET | `/products` | none | List products. |
| GET | `/products/:id` | none | Get product by id. |
| POST | `/products` | Bearer token | Create product. |
| POST | `/orders` | Bearer token | Create order. |
| GET | `/users/:user_id/orders/current` | Bearer token | Current active order for a user. |
| POST | `/orders/:id/products` | Bearer token | Add product to order. |

> Protected endpoints require header: `Authorization: Bearer <token>`

## 7) How to Run Tests
```bash
npm test
```

