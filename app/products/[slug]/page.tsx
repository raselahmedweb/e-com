import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { addToCart } from "@/lib/db"

// Mock product data for preview
const product = {
  id: 1,
  name: "Wireless Headphones",
  slug: "wireless-headphones",
  description:
    "High-quality wireless headphones with noise cancellation technology. Experience crystal-clear sound and comfort for extended listening sessions. Features Bluetooth 5.0 connectivity, 30-hour battery life, and premium memory foam ear cushions.",
  price: 99.99,
  sale_price: 79.99,
  stock_quantity: 15,
  image_url: "/placeholder.svg?height=600&width=600&text=Headphones",
  category_name: "Electronics",
  category_slug: "electronics",
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export default function ProductPage() {
  const { name, description, price, sale_price, stock_quantity, image_url, category_name, category_slug } = product
  const discountPercentage = sale_price ? Math.round((1 - sale_price / price) * 100) : 0

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-4">
        <Link href={`/categories/${category_slug}`} className="text-sm text-muted-foreground hover:text-primary">
          {category_name}
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <Image
            src={image_url || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold">{name}</h1>
            <div className="mt-4 flex items-baseline gap-2">
              {sale_price ? (
                <>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(sale_price)}</span>
                  <span className="text-lg text-muted-foreground line-through">{formatCurrency(price)}</span>
                  <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                    {discountPercentage}% OFF
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-primary">{formatCurrency(price)}</span>
              )}
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${stock_quantity > 0 ? "bg-green-500" : "bg-red-500"}`}></span>
              <span className="text-sm font-medium">{stock_quantity > 0 ? "In Stock" : "Out of Stock"}</span>
            </div>
          </div>

          <div className="mt-4 prose max-w-none">
            <p>{description}</p>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <Button className="w-full" onClick={()=> addToCart()} disabled={stock_quantity <= 0}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline">Add to Wishlist</Button>
              <Button variant="outline">Share</Button>
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium">Shipping & Returns</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>Free shipping on orders over $50</li>
              <li>Standard shipping: 3-5 business days</li>
              <li>Express shipping: 1-2 business days</li>
              <li>30-day return policy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
