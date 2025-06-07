import { getFeaturedProducts } from "@/lib/db"
import { NextResponse } from "next/server"


export async function GET(request: Request) {
  try {
    const featured = await getFeaturedProducts()
    return NextResponse.json(featured)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch featured products" }, { status: 401 })
  }
}