# API Requirements

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed upon.

## API Endpoints

### Users

#### Public Endpoints

- **Create User:** `POST /users`

  - Request Body: `{ firstname: string, lastname: string, email: string, password: string }`
  - Response: `{ user: { id, firstname, lastname, email }, token: string }`
  - Description: Creates a new user account and returns a JWT token for immediate authentication

- **Authenticate User:** `POST /users/authenticate`
  - Request Body: `{ email: string, password: string }`
  - Response: `{ user: { id, firstname, lastname, email }, token: string }`
  - Description: Authenticates existing user credentials and returns a JWT token

#### Protected Endpoints (Require JWT Token)

- **Index:** `GET /users` [token required]

  - Response: Array of users (password_digest excluded)
  - Description: Returns all users in the system

- **Show:** `GET /users/:id` [token required]

  - Response: Single user object (password_digest excluded)
  - Description: Returns details of a specific user by ID

- **Delete:** `DELETE /users/:id` [token required]
  - Response: 204 No Content
  - Description: Deletes a user account

### Products

#### Public Endpoints

- **Index:** `GET /products`

  - Response: Array of all products
  - Description: Returns all products available in the store

- **Show:** `GET /products/:id`
  - Response: Single product object
  - Description: Returns details of a specific product by ID

#### Protected Endpoints (Require JWT Token)

- **Create:** `POST /products` [token required]

  - Request Body: `{ name: string, price: number, category?: string }`
  - Response: Created product object
  - Description: Adds a new product to the catalog

- **Delete:** `DELETE /products/:id` [token required]
  - Response: 204 No Content
  - Description: Removes a product from the catalog

### Orders

#### Protected Endpoints (All require JWT Token)

- **Index:** `GET /orders` [token required]

  - Response: Array of all orders
  - Description: Returns all orders in the system

- **Show:** `GET /orders/:id` [token required]

  - Response: Single order object
  - Description: Returns details of a specific order by ID

- **Create:** `POST /orders` [token required]

  - Request Body: `{ user_id: number, status?: 'active' | 'complete' }`
  - Response: Created order object
  - Description: Creates a new order (defaults to 'active' status)

- **Current Order by User:** `GET /users/:user_id/orders/current` [token required]

  - Response: `{ order: Order }`
  - Description: Returns the current active order for a specific user

- **Add Product to Order:** `POST /orders/:id/products` [token required]
  - Request Body: `{ product_id: number, quantity: number }`
  - Response: OrderProduct object with `{ id, order_id, product_id, quantity }`
  - Description: Adds a product with specified quantity to an order

## Data Shapes

### User

```typescript
{
  id?: number;              // Auto-generated primary key
  firstname: string;        // User's first name
  lastname: string;         // User's last name
  email: string;            // Unique email address
  password_digest?: string; // Hashed password (never returned in API responses)
  created_at?: string;      // Timestamp of account creation
}
```

### Product

```typescript
{
  id?: number;          // Auto-generated primary key
  name: string;         // Product name
  price: number;        // Product price (decimal)
  category?: string;    // Optional product category
  created_at?: string;  // Timestamp of product creation
}
```

### Order

```typescript
{
  id?: number;                        // Auto-generated primary key
  user_id: number;                    // Foreign key to users table
  status?: 'active' | 'complete';     // Order status (defaults to 'active')
  created_at?: string;                // Timestamp of order creation
}
```

### OrderProduct (Junction Table)

```typescript
{
  id?: number;         // Auto-generated primary key
  order_id: number;    // Foreign key to orders table
  product_id: number;  // Foreign key to products table
  quantity: number;    // Quantity of product in order (must be > 0)
}
```

## Database Schema

### Table: `users`

| Column          | Type         | Constraints      |
| --------------- | ------------ | ---------------- |
| id              | SERIAL       | PRIMARY KEY      |
| firstname       | VARCHAR(100) | NOT NULL         |
| lastname        | VARCHAR(100) | NOT NULL         |
| email           | VARCHAR(200) | UNIQUE, NOT NULL |
| password_digest | VARCHAR(200) | NOT NULL         |
| created_at      | TIMESTAMPTZ  | DEFAULT NOW()    |

### Table: `products`

| Column     | Type          | Constraints   |
| ---------- | ------------- | ------------- |
| id         | SERIAL        | PRIMARY KEY   |
| name       | VARCHAR(200)  | NOT NULL      |
| price      | NUMERIC(10,2) | NOT NULL      |
| category   | VARCHAR(100)  | NULL          |
| created_at | TIMESTAMPTZ   | DEFAULT NOW() |

### Table: `orders`

| Column     | Type                | Constraints                                         |
| ---------- | ------------------- | --------------------------------------------------- |
| id         | SERIAL              | PRIMARY KEY                                         |
| user_id    | INTEGER             | NOT NULL, FOREIGN KEY → users(id) ON DELETE CASCADE |
| status     | order_status (ENUM) | NOT NULL, DEFAULT 'active'                          |
| created_at | TIMESTAMPTZ         | DEFAULT NOW()                                       |

**Custom Type:** `order_status` ENUM with values: `'active'`, `'complete'`

### Table: `order_products`

| Column     | Type    | Constraints                                            |
| ---------- | ------- | ------------------------------------------------------ |
| id         | SERIAL  | PRIMARY KEY                                            |
| order_id   | INTEGER | NOT NULL, FOREIGN KEY → orders(id) ON DELETE CASCADE   |
| product_id | INTEGER | NOT NULL, FOREIGN KEY → products(id) ON DELETE CASCADE |
| quantity   | INTEGER | NOT NULL, CHECK (quantity > 0)                         |

### Relationships

- **users → orders:** One-to-Many (one user can have many orders)
- **orders → order_products:** One-to-Many (one order can have many order_products)
- **products → order_products:** One-to-Many (one product can be in many order_products)
- **orders ↔ products:** Many-to-Many (through order_products junction table)

## Authentication & Security

### JWT Token Authentication

- **Token Generation:** Users receive a JWT token upon successful registration or login
- **Token Format:** `Bearer <token>`
- **Token Header:** Include in `Authorization` header for protected endpoints
- **Token Expiration:** 1 hour from generation
- **Token Secret:** Configured via `JWT_SECRET` environment variable

### Password Security

- **Hashing Algorithm:** bcrypt
- **Salt Rounds:** Configurable via `SALT_ROUNDS` environment variable (default: 10)
- **Pepper:** Additional secret string via `BCRYPT_PASSWORD` environment variable
- **Storage:** Only `password_digest` (hashed password) is stored in database
- **API Response:** `password_digest` is NEVER included in API responses

### Protected vs Public Routes

**Public Routes (No Authentication Required):**

- Create user account
- User login/authentication
- View all products
- View single product

**Protected Routes (JWT Token Required):**

- All user management operations (list, show, delete)
- Product management (create, delete)
- All order operations (list, show, create, add products)

## Error Handling

All endpoints should return appropriate HTTP status codes:

- **200 OK:** Successful GET requests
- **201 Created:** Successful POST requests that create resources
- **204 No Content:** Successful DELETE requests
- **400 Bad Request:** Invalid request body or parameters
- **401 Unauthorized:** Missing or invalid authentication token
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server-side errors

Error responses should include an error message:

```json
{
  "error": "Description of the error"
}
```

## Data Validation Requirements

### User Validation

- `firstname` and `lastname`: Required, non-empty strings
- `email`: Required, must be valid email format, must be unique
- `password`: Required, minimum length recommended (not enforced in current implementation)

### Product Validation

- `name`: Required, non-empty string
- `price`: Required, must be a positive number
- `category`: Optional string

### Order Validation

- `user_id`: Required, must reference existing user
- `status`: Optional, must be either 'active' or 'complete'

### OrderProduct Validation

- `order_id`: Required, must reference existing order
- `product_id`: Required, must reference existing product
- `quantity`: Required, must be a positive integer (> 0)

## Testing Requirements

All endpoints and model methods must have:

- Unit tests for model CRUD operations
- Integration tests for API endpoints
- Authentication flow tests
- Database cleanup between test runs

Current test suite includes:

- 29 passing specs
- Model tests for UserStore, ProductStore, OrderStore
- E2E tests for all endpoints
- Authentication and authorization tests

## Environment Configuration

Required environment variables (see `.env` file):

```env
# PostgreSQL Configuration
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5433
POSTGRES_DB=store_dev
POSTGRES_DB_TEST=store_test
POSTGRES_USER=store_user
POSTGRES_PASSWORD=store_pass

# Application Environment
ENV=dev                    # or 'test'
PORT=3000

# Authentication
JWT_SECRET=supersecret

# Password Hashing
BCRYPT_PASSWORD=pepper_string
SALT_ROUNDS=10
```

## Implementation Notes

### Models Location

- **UserStore:** `src/models/userModel.ts`
- **ProductStore:** `src/models/productModel.ts`
- **OrderStore:** `src/models/orderModel.ts`
- **OrderProductStore:** `src/models/orderProductModel.ts`

### Handlers/Controllers Location

- **User Routes:** `src/handlers/userHandler.ts`
- **Product Routes:** `src/handlers/productHandler.ts`
- **Order Routes:** `src/handlers/orderHandler.ts`

### Middleware

- **JWT Authentication:** `src/middleware/auth.ts`

### Database Migrations

- All migrations are in `migrations/` directory
- SQL files in `migrations/sqls/` directory
- Run with: `npm run migrate:dev` or `npm run migrate:test`

---

**Project Status:** ✅ All requirements implemented and tested

**Last Updated:** October 29, 2025
