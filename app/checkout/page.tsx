"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Banknote } from "lucide-react";
import { useEffect, useState } from "react";
// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        // Parse cart from cookie
        const existingCart = document.cookie
          .split("; ")
          .find((row) => row.startsWith("cart="))
          ?.split("=")[1];
        if (!existingCart) {
          console.log("No cart found in cookies");
          return;
        }
        const items = JSON.parse(existingCart).items;
        if (!items || !items.length) {
          console.log("No items in cart");
          return;
        }

        // Build query parameters
        const params = new URLSearchParams();
        items.forEach((item) => {
          params.append("product_id", item.product_id.toString());
        });

        // Fetch products from API
        const res = await (
          await fetch(`/api/product?${params.toString()}`)
        ).json();

        // Merge quantity from items into res based on product_id and id
        const mergedItems = res.map((product) => ({
          ...product,
          quantity:
            items.find((item) => item.product_id === product.id)?.quantity || 0,
        }));

        // Update state with merged items
        setCartItems(mergedItems);
      } catch (error) {
        console.error("Error fetching or processing cart items:", error);
      }
    }

    fetchProduct();
  }, []);
  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + (item.sale_price ? item.sale_price : item.price) * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const orderData = {
    user_id: 1, // Replace with authenticated user ID
    payment_method: FormData.paymentMethod,
    shipping_address: `${FormData.address}, ${FormData.city}, ${FormData.state} ${FormData.postalCode}, ${FormData.country}`,
    contact_phone: FormData.phone,
    cartItems: cartItems.map((item) => ({
      product_id: item.id, // Ensure this matches your product ID
      quantity: item.quantity,
      price: item.sale_price || item.price,
    })),
  };

  try {
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      const data = await response.json();
      alert(`Order ${data.orderId} placed successfully!`);
      // Clear cart or redirect
    } else {
      throw new Error('Order placement failed');
    }
  } catch (error) {
    console.error('Error submitting order:', error);
    alert('Failed to place order. Please try again.');
  }
};
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <form className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Contact Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="123 Main St, Apt 4B" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="New York" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input id="state" placeholder="NY" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" placeholder="10001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="United States" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Payment Method</h2>
              <RadioGroup
                defaultValue="card"
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="card"
                    id="card"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="card"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <CreditCard className="mb-3 h-6 w-6" />
                    Credit Card
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="cash"
                    id="cash"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="cash"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Banknote className="mb-3 h-6 w-6" />
                    Cash on Delivery
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full">
                {`Pay ${formatCurrency(total)}`}
              </Button>
            </div>
          </form>
        </div>

        <div>
          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="mt-4 divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex py-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium">{item.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(subtotal)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Shipping</p>
                  <p className="text-sm font-medium">
                    {shipping === 0 ? "Free" : formatCurrency(shipping)}
                  </p>
                </div>
                <div className="flex justify-between border-t pt-4">
                  <p className="font-semibold">Total</p>
                  <p className="font-semibold">{formatCurrency(total)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
