import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { getUserByEmail, createUser } from "./db"

// Generate a unique session ID
export function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Get the current session ID from cookies or create a new one
export async function getSessionId() {
  const cookieStore = await cookies()
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

// Hash password
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

// Register a new user
export async function registerUser(name: string, email: string, password: string) {
  // Check if user already exists
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    throw new Error("User already exists")
  }

  // Hash password and create user
  const hashedPassword = await hashPassword(password)
  return createUser(name, email, hashedPassword)
}

// Login user
export async function loginUser(email: string, password: string) {
  const user = await getUserByEmail(email)
  if (!user) {
    throw new Error("Invalid credentials")
  }

  const isPasswordValid = await verifyPassword(password, user.password_hash)
  if (!isPasswordValid) {
    throw new Error("Invalid credentials")
  }

  return user
}
