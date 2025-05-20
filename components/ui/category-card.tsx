import Image from "next/image"
import Link from "next/link"

interface CategoryCardProps {
  category: {
    id: number
    name: string
    slug: string
    image_url: string
    description?: string
  }
}

export function CategoryCard({ category }: CategoryCardProps) {
  const { name, slug, image_url, description } = category

  return (
    <Link
      href={`/categories/${slug}`}
      className="group relative overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image_url || "/placeholder.svg?height=300&width=400"}
          alt={name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-xl font-semibold">{name}</h3>
          {description && <p className="mt-1 line-clamp-2 text-sm text-gray-200">{description}</p>}
        </div>
      </div>
    </Link>
  )
}
