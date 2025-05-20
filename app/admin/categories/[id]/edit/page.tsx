import { notFound } from "next/navigation";
import { CategoryForm } from "../../category-form";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Initialize the SQL client
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

async function getCategory(id: number) {
  const result = await sql`SELECT * FROM categories WHERE id = ${id}`;
  return result[0] || null;
}

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const categoryId = Number.parseInt(params.id);

  if (isNaN(categoryId)) {
    notFound();
  }

  const category = await getCategory(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
        <p className="text-muted-foreground">Update category information</p>
      </div>

      <CategoryForm category={category} />
    </div>
  );
}
