import Link from "next/link"
import { notFound } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { sql } from "@vercel/postgres"

interface OrderConfirmationPageProps {
  params: {
    id: string
  }
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const orderId = Number.parseInt(params.id)

  if (isNaN(orderId)) {
    notFound()
  }

  // Get order details
  const orderResult = await sql`
    SELECT * FROM orders WHERE id = ${orderId}
  `

  if (orderResult.length === 0) {
    notFound()
  }

  const order = orderResult[0]

  // Get order items
  const orderItems = await sql`
    SELECT oi.*, p.name, p.slug, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ${orderId}
  `

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary/10 p-3">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Order Confirmed!</h1>
        <p className="mt-4 text-muted-foreground">
          Thank you for your order. We've received your order and will begin processing it right away.
        </p>
        <p className="mt-2 text-muted-foreground">Order #{orderId}</p>
      </div>

      <div className="mx-auto mt-12 max-w-2xl">
        <div className="rounded-lg border shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="mt-4 divide-y">
              {orderItems.map((item) => (
                <div key={item.id} className="flex py-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between border-t pt-4">
                <p className="font-semibold">Total</p>
                <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold">Order Details</h2>
            <dl className="mt-4 space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Order Status</dt>
                <dd className="text-sm font-medium">{order.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Payment Method</dt>
                <dd className="text-sm font-medium capitalize">{order.payment_method}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Payment Status</dt>
                <dd className="text-sm font-medium">{order.payment_status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Shipping Address</dt>
                <dd className="text-sm font-medium">{order.shipping_address}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
