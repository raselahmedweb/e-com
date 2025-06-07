"use client";

import { fetchCategories } from "@/lib/utils";
import { useEffect, useState } from "react";
import { CategoryCard } from "../ui/category-card";

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at?: Date;
  updated_at?: Date;
};
export default function Categories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    async function cate() {
      try {
        const currentCategories = await fetchCategories();
        console.log(currentCategories)
        setCategories(currentCategories);
      } catch (error) {
        console.error("Cant fetch categories", error)
        setCategories([])
      }
    }
    cate();
  }, []);
  return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {categories &&
            categories.map((category) => (
              <CategoryCard key={category?.id} category={category} />
            ))}
        </div>;
}
