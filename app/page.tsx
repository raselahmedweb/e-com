import { Button } from "@/components/ui/button";
import Link from "next/link";
import Categories from "@/components/categories/categories";
import Featured from "@/components/featured/featured";

export default function Home() {
  return (
    <div className="flex flex-col gap-10 py-8">
      {/* Hero Section */}
      <section className="bg-muted/40 py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Shop with Confidence
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Discover quality products at competitive prices. Fast
                  shipping, secure payments, and excellent customer service.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/categories">
                  <Button size="lg">Shop Now</Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative h-[300px] w-full md:h-[400px] lg:h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-80"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white text-center p-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      Summer Sale
                    </h2>
                    <p className="text-lg md:text-xl mb-6">
                      Up to 50% off on selected items
                    </p>
                    <Link href="/sale">
                      <Button variant="secondary" size="lg">
                        View Offers
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container px-4 md:px-6 py-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Shop by Category
          </h2>
          <p className="text-muted-foreground">
            Browse our wide selection of products by category
          </p>
        </div>
        <Categories/>
      </section>

      {/* Featured Products Section */}
      <section className="container px-4 md:px-6 py-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Featured Products
          </h2>
          <p className="text-muted-foreground">
            Discover our most popular products
          </p>
        </div>
        <Featured/>
        <div className="flex justify-center mt-10">
          <Link href="/products">
            <Button variant="outline" size="lg">
              View All Products
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-2 p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Free Shipping</h3>
              <p className="text-muted-foreground">
                Free shipping on all orders over $50
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2 p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Secure Payments</h3>
              <p className="text-muted-foreground">
                We use secure payment methods for your peace of mind
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2 p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Easy Returns</h3>
              <p className="text-muted-foreground">
                30-day return policy for all products
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
