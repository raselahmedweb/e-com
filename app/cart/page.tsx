import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react"

// Mock cart data for preview
const cartItems = [
  {
    id: 1,
    name: "Wireless Headphones",
    slug: "wireless-headphones",
    price: 79.99,
    quantity: 1,
    image_url: "/placeholder.svg?height=96&width=96&text=Headphones",
  },
  {
    id: 2,
    name: "Smart Watch",
    slug: "smart-watch",
    price: 199.99,
    quantity: 1,
    image_url: "/placeholder.svg?height=96&width=96&text=Watch",
  },
]

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export default function CartPage() {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal + shipping

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>

      {cartItems.length > 0 ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg border shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold">Items ({cartItems.length})</h2>
                <div className="mt-4 divide-y">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex py-4">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-sm font-medium">
                              <Link href={`/products/${item.slug}`} className="hover:underline">
                                {item.name}
                              </Link>
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
                          </div>
                          <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                        <div className="mt-auto flex items-end justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-r-none">
                                <Minus className="h-3 w-3" />
                                <span className="sr-only">Decrease quantity</span>
                              </Button>
                              <div className="h-8 w-12 rounded-none border-x-0 text-center flex items-center justify-center">
                                {item.quantity}
                              </div>
                              <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-l-none">
                                <Plus className="h-3 w-3" />
                                <span className="sr-only">Increase quantity</span>
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-lg border shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                    <p className="text-sm font-medium">{formatCurrency(subtotal)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">Shipping</p>
                    <p className="text-sm font-medium">{shipping === 0 ? "Free" : formatCurrency(shipping)}</p>
                  </div>
                  <div className="flex justify-between border-t pt-4">
                    <p className="font-semibold">Total</p>
                    <p className="font-semibold">{formatCurrency(total)}</p>
                  </div>
                  <Link href="/checkout" className="block w-full">
                    <Button className="w-full">Proceed to Checkout</Button>
                  </Link>
                  <Link href="/" className="block w-full">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/" className="mt-8">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
