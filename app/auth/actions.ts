"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getUserByEmail, createUser } from "@/lib/db";
import { SignJWT, jwtVerify } from "jose";

// JWT secret key
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Set JWT token in cookies
async function setAuthCookie(
  userId: number,
  name: string,
  email: string,
  isAdmin: boolean
) {
  const cookiesStore = await cookies();
  const token = await new SignJWT({
    id: userId,
    name,
    email,
    isAdmin,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  cookiesStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// Register a new user
export async function register(formData: FormData) {
  try {
    // Validate form data
    const validatedFields = registerSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const { name, email, password } = validatedFields;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await createUser(name, email, hashedPassword);

    // Set auth cookie
    await setAuthCookie(user.id, user.name, user.email, user.is_admin);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}

// Login user
export async function login(formData: FormData) {
  try {
    // Validate form data
    const validatedFields = loginSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const { email, password } = validatedFields;

    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return { success: false, error: "Invalid email or password" };
    }

    // Set auth cookie
    await setAuthCookie(user.id, user.name, user.email, user.is_admin);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Login error:", error);
    return { success: false, error: "Login failed. Please try again." };
  }
}

// Logout user
export async function logout() {
  const cookiesStore = await cookies();
  cookiesStore.delete("auth_token");
  redirect("/");
}

// Get current user from JWT token
export async function getCurrentUser() {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return {
      id: payload.id as number,
      name: payload.name as string,
      email: payload.email as string,
      isAdmin: payload.isAdmin as boolean,
    };
  } catch (error) {
    // Invalid token
    console.error("JWT verification error:", error);
    cookiesStore.delete("auth_token");
    return null;
  }
}
