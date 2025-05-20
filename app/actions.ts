"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  getSessionId,
  getCart,
  addToCart as dbAddToCart,
  getCartItems,
  updateCartItem,
  removeCartItem,
  createOrder,
  addOrderItems,
} from "@/lib/db"
import { createPaymentIntent } from "@/lib/stripe"
import { getCurrentUser } from "@/app/auth/actions"

// Add to cart
export async function addToCart(productId: number, quantity: number) {
  try {
    const sessionId = getSessionId()
    const cart = await getCart(sessionId)
    await dbAddToCart(cart.id, productId, quantity)
    revalidatePath("/cart")
    return { success: true }
  } catch (error) {
    console.error("Error adding to cart:", error)
    return { success: false, error: "Failed to add item to cart" }
  }
}

// Update cart item
export async function updateCartItemQuantity(cartItemId: number, quantity: number) {
  try {
    await updateCartItem(cartItemId, quantity)
    revalidatePath("/cart")
    return { success: true }
  } catch (error) {
    console.error("Error updating cart item:", error)
    return { success: false, error: "Failed to update cart item" }
  }
}

// Remove cart item
export async function removeFromCart(cartItemId: number) {
  try {
    await removeCartItem(cartItemId)
    revalidatePath("/cart")
    return { success: true }
  } catch (error) {
    console.error("Error removing from cart:", error)
    return { success: false, error: "Failed to remove item from cart" }
  }
}

// Create checkout session
export async function createCheckoutSession(formData: FormData) {
  try {
    const sessionId = getSessionId()
    const cart = await getCart(sessionId)
    const cartItems = await getCartItems(cart.id)
    const user = await getCurrentUser()

    if (cartItems.length === 0) {
      return { success: false, error: "Your cart is empty" }
    }

    const paymentMethod = formData.get("paymentMethod") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const postalCode = formData.get("postalCode") as string
    const country = formData.get("country") as string
    const phone = formData.get("phone") as string

    const shippingAddress = `${address}, ${city}, ${state} ${postalCode}, ${country}`

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)

    // Create order
    const order = await createOrder(
      user?.id || null, // Use user ID if logged in
      totalAmount,
      paymentMethod,
      shippingAddress,
      phone,
    )

    // Add order items
    await addOrderItems(order.id, cartItems)

    if (paymentMethod === "card") {
      try {
        // Create Stripe payment intent
        const paymentIntent = await createPaymentIntent(totalAmount)

        // Store payment intent ID with order
        // This would typically be saved to the database

        return {
          success: true,
          paymentMethod: "card",
          clientSecret: paymentIntent.client_secret,
          orderId: order.id,
        }
      } catch (error) {
        console.error("Stripe payment error:", error)

        // Check if this is a Stripe initialization error
        const isStripeNotInitialized = error instanceof Error && error.message === "STRIPE_NOT_INITIALIZED"

        // Fall back to cash payment if Stripe is not available
        return {
          success: true,
          paymentMethod: "cash",
          orderId: order.id,
          stripeNotAvailable: true,
          message: isStripeNotInitialized
            ? "Card payment is currently unavailable. Proceeding with cash on delivery."
            : "There was an error processing your card payment. Proceeding with cash on delivery.",
        }
      }
    } else {
      // Cash on delivery
      return {
        success: true,
        paymentMethod: "cash",
        orderId: order.id,
      }
    }
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return { success: false, error: "Failed to create checkout session" }
  }
}

// Complete order
export async function completeOrder(orderId: number) {
  // Clear cart after successful order
  const sessionId = getSessionId()
  const cart = await getCart(sessionId)
  const cartItems = await getCartItems(cart.id)

  for (const item of cartItems) {
    await removeCartItem(item.id)
  }

  revalidatePath("/cart")
  redirect(`/order-confirmation/${orderId}`)
}
