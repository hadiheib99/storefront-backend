import express from "express";
import userRouter from "./handlers/userHandler";
import productRouter from "./handlers/productHandler";
import orderRouter from "./handlers/orderHandler";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Storefront API is running",
    endpoints: {
      users: "/users",
      products: "/products",
      orders: "/orders",
    },
  });
});
userRouter(app);
productRouter(app);
orderRouter(app);

if (process.env.ENV !== "test" && process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

export default app;
