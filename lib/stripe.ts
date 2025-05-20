import { Stripe } from "stripe"

// Check if we're in a server context and have the API key
const hasStripeKey = typeof process.env.STRIPE_SECRET_KEY === "string" && process.env.STRIPE_SECRET_KEY.length > 0

// Initialize Stripe only if we have a key
let stripeInstance: Stripe | null = null

try {
  if (hasStripeKey) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    })
  }
} catch (error) {
  console.error("Failed to initialize Stripe:", error)
  stripeInstance = null
}

export const stripe = stripeInstance

// Create a payment intent
export async function createPaymentIntent(amount: number, currency = "usd") {
  if (!stripe) {
    console.error("Stripe is not initialized. Missing STRIPE_SECRET_KEY.")
    throw new Error("STRIPE_NOT_INITIALIZED")
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return paymentIntent
  } catch (error) {
    console.error("Error creating payment intent:", error)
    throw error
  }
}

// Confirm payment intent
export async function confirmPaymentIntent(paymentIntentId: string) {
  if (!stripe) {
    console.error("Stripe is not initialized. Missing STRIPE_SECRET_KEY.")
    throw new Error("STRIPE_NOT_INITIALIZED")
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error("Error confirming payment intent:", error)
    throw error
  }
}
