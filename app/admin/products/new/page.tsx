import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Initialize the SQL client
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
import { ProductForm } from "../product-form";

async function getCategories() {
  return sql`SELECT id, name FROM categories ORDER BY name`;
}

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
        <p className="text-muted-foreground">
          Create a new product in your store
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
