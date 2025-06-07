import { createCategory, deleteCategory, getCategories, updateCategory } from "@/lib/db"
import { NextResponse } from "next/server"


export async function GET(request: Request) {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 401 })
  }
}

export async function PUT(request:Request) {
  try {
    const {data, id} = await request.json();
     if (!data || !id) {
      return NextResponse.json({ error: "Data and id are required" }, { status: 400 })
    }
    const updateC = await updateCategory(id,data);
    return NextResponse.json(updateC)
  } catch (error) {
    return NextResponse.json({ error }, { status: 401 })
  }
}

export async function POST(request:Request) {
  try {
    const {data} = await request.json();
     if (!data) {
      return NextResponse.json({ error: "Data is required" }, { status: 400 })
    }
    const createC = await createCategory(data);
    return NextResponse.json(createC)
  } catch (error) {
    return NextResponse.json({ error }, { status: 401 })
  }
}

export async function DELETE(request:Request) {
  try {
    const {id} = await request.json();
     if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 })
    }
    const deleteC = await deleteCategory(id);
    return NextResponse.json(deleteC)
  } catch (error) {
    return NextResponse.json({ error }, { status: 401 })
  }
}
