# Storefront Backend API

A TypeScript + Express + PostgreSQL backend for an online store. This project implements users, products, orders, and order-products with JWT-based auth and database migrations.

## Ports

- **API server:** `PORT=3000` (default). Visit http://localhost:3000
- **PostgreSQL (host):** `5433` (mapped to container 5432 via docker-compose)

## Environment Variables

Create a `.env` file in the project root with the following (example in repo already):

````
# Storefront Backend API

A TypeScript + Express + PostgreSQL backend for an online store. This project implements users, products, orders, and order-products with JWT-based authentication and database migrations.

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Web Framework:** Express.js
- **Database:** PostgreSQL (running in Docker)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Testing:** Jasmine with Supertest
- **Migrations:** db-migrate

## Ports

- **API Server:** `3000` (default, configurable via `PORT` env var)
- **PostgreSQL (host):** `5433` (mapped to container port `5432` via docker-compose)

## Environment Variables

Create a `.env` file in the project root (example already provided):

```env
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5433
POSTGRES_DB=store_dev
POSTGRES_DB_TEST=store_test
POSTGRES_USER=store_user
POSTGRES_PASSWORD=store_pass
ENV=dev

JWT_SECRET=supersecret
BCRYPT_PASSWORD=pepper_string
SALT_ROUNDS=10
````

**Important Notes:**

- `ENV` controls database selection: `dev` uses `POSTGRES_DB`, `test` uses `POSTGRES_DB_TEST`
- `JWT_SECRET` is used for signing authentication tokens
- `BCRYPT_PASSWORD` (pepper) and `SALT_ROUNDS` are used for secure password hashing

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database and Server

**Option A: Using Docker (Recommended)**

```bash
# Start PostgreSQL container
npm run docker:up

# Run migrations for both dev and test databases
npm run migrate:dev
npm run migrate:test

# Start the development server with hot reload
npm run dev
```

**Option B: Using Local PostgreSQL**

1. Install PostgreSQL locally
2. Create databases: `store_dev` and `store_test`
3. Create user: `store_user` with password `store_pass`
4. Grant privileges to the user on both databases
5. Run migrations and start server:

```bash
npm run migrate:dev
npm run migrate:test
npm run dev
```

### 3. Verify Setup

Visit `http://localhost:3000` - you should see:

```json
{
  "message": "Storefront API is running",
  "endpoints": {
    "users": "/users",
    "products": "/products",
    "orders": "/orders"
  }
}
```

## Database Schema

````

> Notes:
> - `ENV` controls whether the app connects to `POSTGRES_DB` (`dev`) or `POSTGRES_DB_TEST` (`test`).
> - `JWT_SECRET` signs tokens.
> - `BCRYPT_PASSWORD` (pepper) and `SALT_ROUNDS` are used for password hashing.

## Package Installation

```bash
npm install
````

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

````sql
## Database Schema

### Tables and Relationships

**users**
- `id` - SERIAL PRIMARY KEY
- `firstname` - VARCHAR(100) NOT NULL
- `lastname` - VARCHAR(100) NOT NULL
- `email` - VARCHAR(200) UNIQUE NOT NULL
- `password_digest` - VARCHAR(200) NOT NULL (bcrypt hashed)
- `created_at` - TIMESTAMPTZ DEFAULT NOW()

**products**
- `id` - SERIAL PRIMARY KEY
- `name` - VARCHAR(200) NOT NULL
- `price` - NUMERIC(10,2) NOT NULL
- `category` - VARCHAR(100) (nullable)
- `created_at` - TIMESTAMPTZ DEFAULT NOW()

**orders**
- `id` - SERIAL PRIMARY KEY
- `user_id` - INTEGER NOT NULL (FK → users.id, CASCADE DELETE)
- `status` - ENUM('active', 'complete') NOT NULL DEFAULT 'active'
- `created_at` - TIMESTAMPTZ DEFAULT NOW()

**order_products** (junction table)
- `id` - SERIAL PRIMARY KEY
- `order_id` - INTEGER NOT NULL (FK → orders.id, CASCADE DELETE)
- `product_id` - INTEGER NOT NULL (FK → products.id, CASCADE DELETE)
- `quantity` - INTEGER NOT NULL CHECK (quantity > 0)

## API Endpoints

### Authentication Flow

1. **Create User** → Returns JWT token
2. **Use Token** → Include in `Authorization: Bearer <token>` header for protected routes

### Public Endpoints (No Auth Required)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/` | Health check | - | `{ message, endpoints }` |
| GET | `/products` | List all products | - | `Product[]` |
| GET | `/products/:id` | Get product by ID | - | `Product` |
| POST | `/users` | Create new user | `{ firstname, lastname, email, password }` | `{ user, token }` |
| POST | `/users/authenticate` | Login | `{ email, password }` | `{ user, token }` |

### Protected Endpoints (Require JWT Token)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/users` | List all users | - | `User[]` |
| GET | `/users/:id` | Get user by ID | - | `User` |
| DELETE | `/users/:id` | Delete user | - | `204 No Content` |
| POST | `/products` | Create product | `{ name, price, category? }` | `Product` |
| DELETE | `/products/:id` | Delete product | - | `204 No Content` |
| GET | `/orders` | List all orders | - | `Order[]` |
| GET | `/orders/:id` | Get order by ID | - | `Order` |
| POST | `/orders` | Create order | `{ user_id, status? }` | `Order` |
| POST | `/orders/:id/products` | Add product to order | `{ product_id, quantity }` | `OrderProduct` |
| GET | `/users/:user_id/orders/current` | Get user's active order | - | `{ order }` |

### Example API Usage

**1. Create a User**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Ada",
    "lastname": "Lovelace",
    "email": "ada@example.com",
    "password": "secure123"
  }'
````

Response:

```json
{
  "user": {
    "id": 1,
    "firstname": "Ada",
    "lastname": "Lovelace",
    "email": "ada@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**2. Login (Authenticate)**

```bash
curl -X POST http://localhost:3000/users/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ada@example.com",
    "password": "secure123"
  }'
```

**3. Create a Product (Protected)**

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "price": 999.99,
    "category": "electronics"
  }'
```

**4. List Products (Public)**

```bash
curl http://localhost:3000/products
```

**5. Create an Order (Protected)**

```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "status": "active"
  }'
```

**6. Add Product to Order (Protected)**

```bash
curl -X POST http://localhost:3000/orders/1/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 2
  }'
```

## Testing

### Run All Tests

```bash
npm test
```

This will:

1. Set `ENV=test` to use the test database
2. Run migrations on `store_test`
3. Compile TypeScript
4. Execute Jasmine test suites

### Test Coverage

- **Unit Tests:** Model methods (UserStore, ProductStore, OrderStore)
- **Integration Tests:** API endpoints with authentication
- **All tests:** 29 specs covering CRUD operations and auth flows

### Reset Test Database

```bash
npm run migrate:reset:test
```

## Available NPM Scripts

````

## REST Endpoints

| Method | Path                             | Auth         | Description                                         |
| ------ | -------------------------------- | ------------ | --------------------------------------------------- |
| GET    | `/`                              | none         | Health check: returns message and top-level routes. |
| POST   | `/users`                         | none         | Create user and returns JWT.                        |
| POST   | `/users/authenticate`            | none         | Authenticate user and returns JWT.                  |
| GET    | `/users`                         | Bearer token | List all users.                                     |
| GET    | `/users/:id`                     | Bearer token | Get user by id.                                     |
| DELETE | `/users/:id`                     | Bearer token | Delete user by id.                                  |
| GET    | `/products`                      | none         | List products.                                      |
| GET    | `/products/:id`                  | none         | Get product by id.                                  |
| POST   | `/products`                      | Bearer token | Create product.                                     |
| POST   | `/orders`                        | Bearer token | Create order.                                       |
| GET    | `/users/:user_id/orders/current` | Bearer token | Current active order for a user.                    |
| POST   | `/orders/:id/products`           | Bearer token | Add product to order.                               |

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
````

## Testing

```bash
npm test
# Reset and re-run test DB migrations if needed
npm run migrate:reset:test
```

## Scripts (from package.json)

```json
## Available NPM Scripts

### Development
- `npm start` - Start server (production mode)
- `npm run dev` - Start server with hot reload (nodemon)
- `npm run build` - Compile TypeScript to JavaScript

### Database Migrations
- `npm run migrate:dev` - Run migrations on dev database
- `npm run migrate:test` - Run migrations on test database
- `npm run migrate:dev:down` - Rollback last dev migration
- `npm run migrate:test:down` - Rollback last test migration
- `npm run migrate:reset:dev` - Reset and re-run all dev migrations
- `npm run migrate:reset:test` - Reset and re-run all test migrations

### Docker
- `npm run docker:up` - Start PostgreSQL container
- `npm run docker:down` - Stop and remove containers
- `npm run docker:logs` - View container logs
- `npm run docker:restart` - Restart containers

### Testing
- `npm test` - Build and run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint and auto-fix issues

### Complete Setup
- `npm run setup` - One command to start Docker, run migrations for both databases

## Project Structure

```

.
├── migrations/ # Database migration files
│ ├── sqls/ # SQL up/down scripts
│ └── _.js # Migration configurations
├── spec/ # Test files
│ ├── endpoints/ # E2E endpoint tests
│ ├── helpers/ # Test utilities
│ └── _.spec.ts # Model unit tests
├── src/
│ ├── handlers/ # Route handlers (controllers)
│ │ ├── userHandler.ts
│ │ ├── productHandler.ts
│ │ └── orderHandler.ts
│ ├── middleware/ # Express middleware
│ │ └── auth.ts # JWT authentication
│ ├── models/ # Database models
│ │ ├── db.ts # PostgreSQL connection pool
│ │ ├── types.ts # TypeScript interfaces
│ │ ├── userModel.ts # User CRUD operations
│ │ ├── productModel.ts # Product CRUD operations
│ │ ├── orderModel.ts # Order CRUD operations
│ │ └── orderProductModel.ts
│ └── server.ts # Express app entry point
├── .env # Environment variables
├── database.json # db-migrate configuration
├── docker-compose.yml # Docker PostgreSQL setup
├── package.json
├── tsconfig.json # TypeScript configuration
├── README.md # This file
└── REQUIREMENTS.md # Project requirements

````

## Security Features

- ✅ **Password Hashing:** bcrypt with pepper and configurable salt rounds
- ✅ **JWT Authentication:** Secure token-based auth with expiration
- ✅ **SQL Injection Protection:** Parameterized queries via pg library
- ✅ **Environment Variables:** Sensitive data in `.env`, not committed to git
- ✅ **Input Validation:** Basic validation in handlers
- ✅ **CORS Ready:** Can be enabled via middleware if needed

## Troubleshooting

### Database Connection Issues

**Problem:** `password authentication failed for user "store_user"`

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps

# Recreate databases and user
docker exec -it storefront_pg psql -U postgres -c "DROP DATABASE IF EXISTS store_dev;"
docker exec -it storefront_pg psql -U postgres -c "DROP DATABASE IF EXISTS store_test;"
docker exec -it storefront_pg psql -U postgres -c "CREATE DATABASE store_dev OWNER store_user;"
docker exec -it storefront_pg psql -U postgres -c "CREATE DATABASE store_test OWNER store_user;"
````

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE :::3000`

**Solution:**

```bash
# Find and kill process using port 3000
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or change PORT in .env
PORT=3001
```

### Migration Errors

**Problem:** `Error: Migration table is missing`

**Solution:**

```bash
# Reset migrations
npm run migrate:reset:dev
npm run migrate:reset:test
```

## License

ISC

## Author

Udacity Student Project

---

**Last Updated:** October 29, 2025

```

---

```
