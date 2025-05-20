"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createCheckoutSession, completeOrder } from "@/app/actions"
import { formatCurrency } from "@/lib/utils"
import { CreditCard, Banknote, AlertCircle } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

// Initialize Stripe
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

const formSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  postalCode: z.string().min(3, { message: "Postal code is required" }),
  country: z.string().min(2, { message: "Country is required" }),
  phone: z.string().min(5, { message: "Phone number is required" }),
  paymentMethod: z.enum(["card", "cash"]),
})

interface CheckoutFormProps {
  total: number
  user?: {
    id: number
    name: string
    email: string
    isAdmin: boolean
  } | null
}

export function CheckoutForm({ total, user }: CheckoutFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState<any>(null)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [stripeUnavailable, setStripeUnavailable] = useState<boolean>(false)

  // Check if Stripe is available
  const isStripeAvailable = !!stripePromise

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
      paymentMethod: isStripeAvailable ? "card" : "cash",
    },
  })

  // Update form values when user changes
  useEffect(() => {
    if (user) {
      form.setValue("name", user.name)
      form.setValue("email", user.email)
    }
  }, [user, form])

  // If Stripe is not available, force cash payment
  useEffect(() => {
    if (!isStripeAvailable) {
      form.setValue("paymentMethod", "cash")
      setStripeUnavailable(true)
    }
  }, [isStripeAvailable, form])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      setErrorMessage(null)

      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value)
      })

      const result = await createCheckoutSession(formData)

      if (result.success) {
        if (result.paymentMethod === "card" && result.clientSecret) {
          setPaymentIntent({
            clientSecret: result.clientSecret,
          })
          setOrderId(result.orderId)
        } else if (result.paymentMethod === "cash") {
          // Redirect to order confirmation for cash
          await completeOrder(result.orderId)
        }

        // If there's a message (like when falling back to cash payment), show it
        if (result.message) {
          if (result.stripeNotAvailable) {
            setStripeUnavailable(true)
            await completeOrder(result.orderId)
          } else {
            setErrorMessage(result.message)
          }
        }
      } else {
        // Handle error
        setErrorMessage(result.error || "An error occurred during checkout")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      setErrorMessage("An unexpected error occurred during checkout")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {stripeUnavailable && (
        <Alert className="mb-6" variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Credit card payment is currently unavailable. Cash on delivery will be used instead.
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {paymentIntent && stripePromise ? (
        <Elements stripe={stripePromise} options={{ clientSecret: paymentIntent.clientSecret }}>
          <StripePaymentForm orderId={orderId} />
        </Elements>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Contact Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...form.register("name")} placeholder="John Doe" />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register("email")} placeholder="john@example.com" />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Shipping Address</h2>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" {...form.register("address")} placeholder="123 Main St, Apt 4B" />
              {form.formState.errors.address && (
                <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...form.register("city")} placeholder="New York" />
                {form.formState.errors.city && (
                  <p className="text-xs text-destructive">{form.formState.errors.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input id="state" {...form.register("state")} placeholder="NY" />
                {form.formState.errors.state && (
                  <p className="text-xs text-destructive">{form.formState.errors.state.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" {...form.register("postalCode")} placeholder="10001" />
                {form.formState.errors.postalCode && (
                  <p className="text-xs text-destructive">{form.formState.errors.postalCode.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...form.register("country")} placeholder="United States" />
                {form.formState.errors.country && (
                  <p className="text-xs text-destructive">{form.formState.errors.country.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...form.register("phone")} placeholder="+1 (555) 123-4567" />
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>

          {!stripeUnavailable && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Payment Method</h2>
              <RadioGroup
                defaultValue={isStripeAvailable ? "card" : "cash"}
                {...form.register("paymentMethod")}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="card" id="card" className="peer sr-only" disabled={!isStripeAvailable} />
                  <Label
                    htmlFor="card"
                    className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${!isStripeAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <CreditCard className="mb-3 h-6 w-6" />
                    Credit Card
                    {!isStripeAvailable && <span className="mt-1 text-xs text-muted-foreground">Unavailable</span>}
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
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
          )}

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : `Complete Order - ${formatCurrency(total)}`}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

function StripePaymentForm({ orderId }: { orderId: number | null }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || !orderId) {
      return
    }

    setIsProcessing(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation/${orderId}`,
        },
      })

      if (error) {
        setErrorMessage(error.message || "An error occurred during payment.")
      }
    } catch (error) {
      console.error("Payment error:", error)
      setErrorMessage("An unexpected error occurred.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
        <form onSubmit={handleSubmit}>
          <PaymentElement />
          {errorMessage && <div className="mt-4 text-destructive text-sm">{errorMessage}</div>}
          <Button type="submit" className="w-full mt-6" disabled={!stripe || isProcessing}>
            {isProcessing ? "Processing..." : "Pay Now"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
