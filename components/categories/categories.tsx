"use client";

import { useEffect, useState } from "react";
import { CategoryCard } from "../ui/category-card";
import { Category } from "@/lib/types";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(()=>{
    async function cate() {
      try {
        const res = (await fetch("/api/categories"))
        const data = res.json();
        const currentCategories = await data;
        setCategories(currentCategories)
      } catch (error) {
        console.error("Can't fetch categories", error);
      }
    }
    cate();
  },[])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
      {categories &&
        categories.map((category) => (
          <CategoryCard key={category?.id} category={category} />
        ))}
    </div>
  );
}