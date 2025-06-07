"use client"

import { FeaturedProduct } from "@/lib/types";
import { useEffect, useState } from "react";
import { ProductCard } from "../ui/product-card";

export default function Featured() {
    const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
      useEffect(()=>{
        async function cate() {
          try {
            const res = (await fetch("/api/featured"))
            const data = res.json();
            const currentFeatured = await data;
            setFeatured(currentFeatured)
          } catch (error) {
            console.error("Can't fetch categories", error);
          }
        }
        cate();
      },[])
    
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
  )
}
