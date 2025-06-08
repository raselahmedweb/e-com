import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.getAll("product_id");
  const numericIds = ids.map(Number);
  try {
    const products = await getProductById(numericIds);
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 401 }
    );
  }
}
