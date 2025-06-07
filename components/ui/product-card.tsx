import Image from "next/image"
import Link from "next/link"

interface ProductCardProps {
  product: {
    id: number
    name: string
    slug?: string
    price: number
    sale_price?: number | null
    image_url?: string
    category_name?: string
    category_slug?: string
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { name, slug, price, sale_price, image_url, category_name, category_slug } = product
  const discountPercentage = sale_price ? Math.round((1 - sale_price / price) * 100) : 0

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md">
      <Link href={`/products/${slug}`} className="block h-full w-full">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={image_url || "/placeholder.svg?height=300&width=300"}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {sale_price && (
            <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
              {discountPercentage}% OFF
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-1 text-sm text-muted-foreground">
            <Link href={`/categories/${category_slug}`} className="hover:underline">
              {category_name}
            </Link>
          </div>
          <h3 className="line-clamp-1 text-base font-medium">{name}</h3>
          <div className="mt-2 flex items-center gap-2">
            {sale_price ? (
              <>
                <span className="font-medium text-primary">{formatCurrency(sale_price)}</span>
                <span className="text-sm text-muted-foreground line-through">{formatCurrency(price)}</span>
              </>
            ) : (
              <span className="font-medium text-primary">{formatCurrency(price)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
