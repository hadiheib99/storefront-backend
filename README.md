# Storefront Backend API

A TypeScript + Express + PostgreSQL backend for an online store. This project implements users, products, orders, and order-products with JWT-based auth and database migrations.

## Ports

- **API server:** `PORT=3000` (default). Visit http://localhost:3000
- **PostgreSQL (host):** `5433` (mapped to container 5432 via docker-compose)

## Environment Variables

Create a `.env` file in the project root with the following (example in repo already):

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

> Notes:  
> - `ENV` controls whether the app connects to `POSTGRES_DB` (`dev`) or `POSTGRES_DB_TEST` (`test`).  
> - `JWT_SECRET` signs tokens.  
> - `BCRYPT_PASSWORD` (pepper) and `SALT_ROUNDS` are used for password hashing.

## Package Installation

```bash
npm install
```

## Setup: Database and Server

### Option A: Docker (recommended)
```bash
# 1) Start Postgres on port 5433
npm run docker:up

# 2) Run migrations for dev and test
npm run migrate:dev
npm run migrate:test

# 3) Start the API
npm run dev    # development (nodemon)
# or
npm start      # one-off run
```

### Option B: Local Postgres (without Docker)
1. Create two databases named in `.env`: `{'POSTGRES_DB' if 'POSTGRES_DB' in env_text else 'store_dev'}` and `{'POSTGRES_DB_TEST'}`.
2. Ensure the user/password in `.env` exist and have privileges.
3. Run migrations:
```bash
npm run migrate:dev
npm run migrate:test
```
4. Start the API as above.

## Database Schema

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

## REST Endpoints

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

### Quick cURL Examples

```bash
# Create a user (returns token)
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"firstname":"Ada","lastname":"Lovelace","email":"ada@example.com","password":"pass123"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/users/authenticate \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"pass123"}' | jq -r '.token')

# Create product (auth required)
curl -X POST http://localhost:3000/products -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"Book","price":9.99,"category":"books"}'

# List products (public)
curl http://localhost:3000/products
```

## Testing
```bash
npm test
# Reset and re-run test DB migrations if needed
npm run migrate:reset:test
```

## Scripts (from package.json)
```json
{
  "start": "npx ts-node ./src/server.ts",
  "dev": "nodemon --watch src --exec ts-node src/server.ts",
  "build": "tsc",
  "test": "npm run build && db-migrate --env test up && jasmine",
  "test:crud": "jasmine --config=spec/support/jasmine.json --require=ts-node/register spec/crudSpec.ts",
  "test:demo": "jasmine --config=spec/support/jasmine.json --require=ts-node/register spec/demoSpec.ts",
  "test:watch": "nodemon --watch src --watch spec --ext ts --exec \"npm test\"",
  "demo": "ts-node ./src/demo.ts",
  "migrate:dev": "db-migrate --env dev up",
  "migrate:test": "db-migrate --env test up",
  "migrate:dev:down": "db-migrate --env dev down",
  "migrate:test:down": "db-migrate --env test down",
  "migrate:reset:dev": "db-migrate --env dev reset && db-migrate --env dev up",
  "migrate:reset:test": "db-migrate --env test reset && db-migrate --env test up",
  "docker:up": "docker-compose up -d",
  "docker:down": "docker-compose down",
  "docker:logs": "docker-compose logs -f",
  "docker:restart": "docker-compose restart",
  "setup": "docker-compose up -d && npm run migrate:dev && npm run migrate:test"
}
```

---
Generated on 2025-10-28 to satisfy the Udacity rubric items.
