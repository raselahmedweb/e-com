import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { sql } from "@neondatabase/serverless"
import { UpdateOrderStatusForm } from "./update-order-status-form"

async function getOrder(id: number) {
  const result = await sql`
    SELECT o.*, u.name as customer_name, u.email as customer_email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.id = ${id}
  `
  return result[0] || null
}

async function getOrderItems(orderId: number) {
  return sql`
    SELECT oi.*, p.name, p.slug, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ${orderId}
  `
}

interface OrderDetailPageProps {
  params: {
    id: string
  }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const orderId = Number.parseInt(params.id)

  if (isNaN(orderId)) {
    notFound()
  }

  const [order, orderItems] = await Promise.all([getOrder(orderId), getOrderItems(orderId)])

  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
          <p className="text-muted-foreground">
            Placed on {new Date(order.created_at).toLocaleDateString()} at{" "}
            {new Date(order.created_at).toLocaleTimeString()}
          </p>
        </div>
        <Link href="/admin/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Customer</h3>
                <p>{order.customer_name || "Guest"}</p>
                {order.customer_email && <p className="text-sm text-muted-foreground">{order.customer_email}</p>}
              </div>
              <div>
                <h3 className="font-semibold">Contact</h3>
                <p>{order.contact_phone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Shipping Address</h3>
              <p className="whitespace-pre-line">{order.shipping_address}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Payment Method</h3>
                <p className="capitalize">{order.payment_method}</p>
              </div>
              <div>
                <h3 className="font-semibold">Payment Status</h3>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    order.payment_status === "paid"
                      ? "bg-green-100 text-green-800"
                      : order.payment_status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.payment_status}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Order Status</h3>
              <div className="mt-2">
                <UpdateOrderStatusForm orderId={order.id} currentStatus={order.status} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>Items included in this order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                    <img
                      src={item.image_url || "/placeholder.svg?height=64&width=64"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right font-medium">{formatCurrency(item.price * item.quantity)}</div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
