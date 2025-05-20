import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { cookies } from "next/headers"

// Initialize the SQL client
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

// Replace the executeQuery function with this updated version
export async function executeQuery(query: string, params: any[] = []) {
  try {
    // Convert the query and params to a tagged template string
    // This is a workaround since we can't directly use tagged templates with dynamic queries
    let preparedQuery = query
    const values = [...params]

    // Replace $1, $2, etc. with ? for the sql tagged template
    for (let i = 0; i < values.length; i++) {
      preparedQuery = preparedQuery.replace(`$${i + 1}`, "?")
    }

    // Use the sql tagged template function
    return await sql.unsafe(preparedQuery, values)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Alternatively, we can use the direct approach for specific queries
// For example, replace getCategories with:
export async function getCategories() {
  return sql`SELECT * FROM categories ORDER BY name`
}

export async function getCategoryBySlug(slug: string) {
  return sql`SELECT * FROM categories WHERE slug = ${slug}`.then((results) => results[0] || null)
}

// Products
export async function getFeaturedProducts() {
  return sql`
    SELECT p.*, c.name as category_name, c.slug as category_slug 
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.featured = true
    ORDER BY p.created_at DESC
    LIMIT 8
  `
}

export async function getProductsByCategory(categoryId: number) {
  return sql`
    SELECT p.*, c.name as category_name, c.slug as category_slug 
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.category_id = ${categoryId}
    ORDER BY p.name
  `
}

export async function getProductBySlug(slug: string) {
  return sql`
    SELECT p.*, c.name as category_name, c.slug as category_slug 
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ${slug}
  `.then((results) => results[0] || null)
}

// Cart
export async function getCart(sessionId: string) {
  const cart = await sql`
    SELECT * FROM cart WHERE session_id = ${sessionId}
  `

  if (cart.length === 0) {
    // Create a new cart if it doesn't exist
    const newCart = await sql`
      INSERT INTO cart (session_id, created_at, updated_at)
      VALUES (${sessionId}, NOW(), NOW())
      RETURNING *
    `
    return newCart[0]
  }

  return cart[0]
}

export async function getCartItems(cartId: number) {
  return sql`
    SELECT ci.*, p.name, p.price, p.image_url, p.slug
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = ${cartId}
  `
}

export async function addToCart(cartId: number, productId: number, quantity: number) {
  // Check if item already exists in cart
  const existingItem = await sql`
    SELECT * FROM cart_items WHERE cart_id = ${cartId} AND product_id = ${productId}
  `

  if (existingItem.length > 0) {
    // Update quantity if item exists
    return sql`
      UPDATE cart_items 
      SET quantity = quantity + ${quantity}, updated_at = NOW()
      WHERE cart_id = ${cartId} AND product_id = ${productId}
      RETURNING *
    `
  } else {
    // Add new item if it doesn't exist
    return sql`
      INSERT INTO cart_items (cart_id, product_id, quantity, created_at, updated_at)
      VALUES (${cartId}, ${productId}, ${quantity}, NOW(), NOW())
      RETURNING *
    `
  }
}

export async function updateCartItem(cartItemId: number, quantity: number) {
  return sql`
    UPDATE cart_items
    SET quantity = ${quantity}, updated_at = NOW()
    WHERE id = ${cartItemId}
    RETURNING *
  `
}

export async function removeCartItem(cartItemId: number) {
  return sql`
    DELETE FROM cart_items
    WHERE id = ${cartItemId}
  `
}

// Orders
export async function createOrder(
  userId: number | null,
  totalAmount: number,
  paymentMethod: string,
  shippingAddress: string,
  contactPhone: string,
) {
  const order = await sql`
    INSERT INTO orders (
      user_id, total_amount, payment_method, payment_status,
      shipping_address, contact_phone, status, created_at, updated_at
    )
    VALUES (
      ${userId}, 
      ${totalAmount}, 
      ${paymentMethod}, 
      ${paymentMethod === "cash" ? "pending" : "processing"}, 
      ${shippingAddress}, 
      ${contactPhone}, 
      ${"pending"}, 
      NOW(), 
      NOW()
    )
    RETURNING *
  `

  return order[0]
}

export async function addOrderItems(orderId: number, cartItems: any[]) {
  const promises = cartItems.map((item) => {
    return sql`
      INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
      VALUES (${orderId}, ${item.product_id}, ${item.quantity}, ${item.price}, NOW())
    `
  })

  await Promise.all(promises)
}

export async function updateOrderStatus(orderId: number, status: string) {
  return sql`
    UPDATE orders
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${orderId}
    RETURNING *
  `
}

export async function updatePaymentStatus(orderId: number, status: string) {
  return sql`
    UPDATE orders
    SET payment_status = ${status}, updated_at = NOW()
    WHERE id = ${orderId}
    RETURNING *
  `
}

// Users
export async function getUserByEmail(email: string) {
  const results = await sql`SELECT * FROM users WHERE email = ${email}`
  return results[0] || null
}

export async function createUser(name: string, email: string, passwordHash: string) {
  const user = await sql`
    INSERT INTO users (name, email, password_hash, created_at, updated_at)
    VALUES (${name}, ${email}, ${passwordHash}, NOW(), NOW())
    RETURNING *
  `

  return user[0]
}

// Get user orders
export async function getUserOrders(userId: number) {
  try {
    return await sql`
      SELECT * FROM orders 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
  } catch (error) {
    console.error("Error fetching user orders:", error)
    return []
  }
}

// Update user profile
export async function updateUserProfile(userId: number, name: string, email: string) {
  return sql`
    UPDATE users
    SET name = ${name}, email = ${email}, updated_at = NOW()
    WHERE id = ${userId}
    RETURNING *
  `
}

// Add user address
export async function addUserAddress(
  userId: number,
  address: string,
  city: string,
  state: string,
  postalCode: string,
  country: string,
  isDefault: boolean,
) {
  // This would require a new addresses table in your database
  // For now, we'll just update the user's address field
  return sql`
    UPDATE users
    SET address = ${address}, updated_at = NOW()
    WHERE id = ${userId}
    RETURNING *
  `
}

// Generate a unique session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Get the current session ID from cookies or create a new one
export function getSessionId() {
  const cookieStore = cookies()
  let sessionId = cookieStore.get("sessionId")?.value

  if (!sessionId) {
    sessionId = generateSessionId()
    cookieStore.set("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })
  }

  return sessionId
}
