import { ProductStore } from "../src/models/productModel";
import { resetDatabase } from "./helpers/database";

const products = new ProductStore();

describe("Product Model", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("should have index/show/create/destroy methods", () => {
    expect(products.index).toBeDefined();
    expect(products.show).toBeDefined();
    expect(products.create).toBeDefined();
    expect(products.destroy).toBeDefined();
  });

  it("create should add a product", async () => {
    const p = await products.create({
      name: "Spec Widget",
      price: 42.5,
      category: "spec",
    });
    expect(p.id).toBeDefined();
    expect(p.name).toBe("Spec Widget");
    expect(p.price).toBe(42.5);
    expect(p.category).toBe("spec");
  });

  it("index should list products", async () => {
    // Create a product first
    const p = await products.create({
      name: "Spec Widget",
      price: 42.5,
      category: "spec",
    });

    const list = await products.index();
    expect(Array.isArray(list)).toBeTrue();
    expect(list.find((x) => x.id === p.id)).toBeDefined();
  });

  it("show should fetch by id", async () => {
    // Create a product first
    const p = await products.create({
      name: "Spec Widget",
      price: 42.5,
      category: "spec",
    });

    const fetched = await products.show(p.id as number);
    expect(fetched.id).toBe(p.id);
    expect(fetched.name).toBe("Spec Widget");
  });

  it("destroy should delete the product without throwing", async () => {
    // Create a product first
    const p = await products.create({
      name: "Spec Widget",
      price: 42.5,
      category: "spec",
    });

    await expectAsync(products.destroy(p.id as number)).toBeResolved();
  });
});
