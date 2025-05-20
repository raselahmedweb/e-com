import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { DeleteCategoryButton } from "./delete-category-button"

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Initialize the SQL client
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

async function getCategories() {
  return sql`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    GROUP BY c.id
    ORDER BY c.name
  `
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage product categories</p>
        </div>
        <Link href="/admin/categories/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">Image</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Slug</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Products</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {categories.map((category) => (
                <tr key={category.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <Image
                        src={category.image_url || "/placeholder.svg?height=40&width=40"}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4 align-middle font-medium">{category.name}</td>
                  <td className="p-4 align-middle">{category.slug}</td>
                  <td className="p-4 align-middle">{category.product_count}</td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/categories/${category.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <DeleteCategoryButton
                        id={category.id}
                        name={category.name}
                        productCount={category.product_count}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
