import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ui/product-card";
import { getProduct } from "@/lib/db";

export default async function ProductPage() {
  const products = await getProduct();

  if (!products) {
    notFound();
  }

  return (
    <div className="w-screen max-w-[1536px] px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>

        <p className="text-muted-foreground">Shop now</p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-semibold">No products found</h2>
          <p className="mt-2 text-muted-foreground">
            We couldn't find any products in this category.
          </p>
        </div>
      )}
    </div>
  );
}
