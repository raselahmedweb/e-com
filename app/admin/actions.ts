import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Initialize the SQL client
const sql = neon("postgresql://neondb_owner:npg_ZqpQHz4oj8vs@ep-royal-hill-a5xfsste-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require");
export const db = drizzle(sql);
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/auth/actions";

// Admin middleware
async function checkAdmin() {
  const user = await getCurrentUser();

  if (!user || !user.isAdmin) {
    redirect("/login");
  }

  return user;
}

// Product actions
export async function createProduct(data: any) {
  await checkAdmin();

  await sql`
    INSERT INTO products (
      name, slug, description, price, sale_price, stock_quantity, 
      category_id, image_url, featured, created_at, updated_at
    )
    VALUES (
      ${data.name}, ${data.slug}, ${data.description}, ${data.price}, 
      ${data.sale_price}, ${data.stock_quantity}, ${data.category_id}, 
      ${data.image_url}, ${data.featured}, NOW(), NOW()
    )
  `;

  // revalidatePath("/admin/products");
  // revalidatePath("/");
  // revalidatePath("/categories");
  // revalidatePath("/products");
}

export async function updateProduct(id: number, data: any) {
  await checkAdmin();

  await sql`
    UPDATE products
    SET 
      name = ${data.name},
      slug = ${data.slug},
      description = ${data.description},
      price = ${data.price},
      sale_price = ${data.sale_price},
      stock_quantity = ${data.stock_quantity},
      category_id = ${data.category_id},
      image_url = ${data.image_url},
      featured = ${data.featured},
      updated_at = NOW()
    WHERE id = ${id}
  `;

  // revalidatePath("/admin/products");
  // revalidatePath("/");
  // revalidatePath("/categories");
  // revalidatePath(`/products/${data.slug}`);
}

export async function deleteProduct(id: number) {
  await checkAdmin();

  await sql`DELETE FROM products WHERE id = ${id}`;

  // revalidatePath("/admin/products");
  // revalidatePath("/");
  // revalidatePath("/categories");
  // revalidatePath("/products");
}

// Category actions

export async function getCategories() {
  return sql`SELECT * FROM categories ORDER BY name`
}
export async function createCategory(data: any) {
  await checkAdmin();

  await sql`
    INSERT INTO categories (name, slug, description, image_url, created_at, updated_at)
    VALUES (${data.name}, ${data.slug}, ${data.description}, ${data.image_url}, NOW(), NOW())
  `;

  // revalidatePath("/admin/categories");
  // revalidatePath("/");
  // revalidatePath("/categories");
}

export async function updateCategory(id: number, data: any) {
  await checkAdmin();

  await sql`
    UPDATE categories
    SET 
      name = ${data.name},
      slug = ${data.slug},
      description = ${data.description},
      image_url = ${data.image_url},
      updated_at = NOW()
    WHERE id = ${id}
  `;

  // revalidatePath("/admin/categories");
  // revalidatePath("/");
  // revalidatePath("/categories");
  // revalidatePath(`/categories/${data.slug}`);
}

export async function deleteCategory(id: number) {
  await checkAdmin();

  // Check if category has products
  const products =
    await sql`SELECT COUNT(*) FROM products WHERE category_id = ${id}`;

  if (Number.parseInt(products[0].count) > 0) {
    throw new Error("Cannot delete category with products");
  }

  await sql`DELETE FROM categories WHERE id = ${id}`;

  // revalidatePath("/admin/categories");
  // revalidatePath("/");
  // revalidatePath("/categories");
}

// Order actions
export async function updateOrderStatus(id: number, status: string) {
  await checkAdmin();

  await sql`
    UPDATE orders
    SET 
      status = ${status},
      updated_at = NOW()
    WHERE id = ${id}
  `;

  // revalidatePath("/admin/orders");
  // revalidatePath(`/admin/orders/${id}`);
}

export async function updatePaymentStatus(id: number, status: string) {
  await checkAdmin();

  await sql`
    UPDATE orders
    SET 
      payment_status = ${status},
      updated_at = NOW()
    WHERE id = ${id}
  `;

  // revalidatePath("/admin/orders");
  // revalidatePath(`/admin/orders/${id}`);
}
