"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Minus, Plus } from "lucide-react"
import { addToCart } from "@/app/actions"

interface AddToCartButtonProps {
  productId: number
  disabled?: boolean
}

export function AddToCartButton({ productId, disabled = false }: AddToCartButtonProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  const handleAddToCart = async () => {
    try {
      setIsLoading(true)
      await addToCart(productId, quantity)
      router.refresh()
      // Show success message or open cart drawer
    } catch (error) {
      console.error("Failed to add to cart:", error)
      // Show error message
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={decreaseQuantity}
          disabled={quantity <= 1 || disabled}
          className="h-10 w-10 rounded-r-none"
        >
          <Minus className="h-4 w-4" />
          <span className="sr-only">Decrease quantity</span>
        </Button>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
          className="h-10 w-16 rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={increaseQuantity}
          disabled={disabled}
          className="h-10 w-10 rounded-l-none"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Increase quantity</span>
        </Button>
      </div>
      <Button onClick={handleAddToCart} disabled={disabled || isLoading} className="w-full">
        <ShoppingCart className="mr-2 h-4 w-4" />
        {isLoading ? "Adding..." : "Add to Cart"}
      </Button>
    </div>
  )
}
