import { notFound } from "next/navigation"
import { sql } from "@neondatabase/serverless"
import { ProductForm } from "../../product-form"

async function getProduct(id: number) {
  const result = await sql`SELECT * FROM products WHERE id = ${id}`
  return result[0] || null
}

async function getCategories() {
  return sql`SELECT id, name FROM categories ORDER BY name`
}

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const productId = Number.parseInt(params.id)

  if (isNaN(productId)) {
    notFound()
  }

  const [product, categories] = await Promise.all([getProduct(productId), getCategories()])

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">Update product information</p>
      </div>

      <ProductForm categories={categories} product={product} />
    </div>
  )
}
