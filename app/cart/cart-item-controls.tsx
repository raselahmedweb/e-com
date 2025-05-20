"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2 } from "lucide-react"
import { updateCartItemQuantity, removeFromCart } from "@/app/actions"

interface CartItemControlsProps {
  cartItem: {
    id: number
    quantity: number
  }
}

export function CartItemControls({ cartItem }: CartItemControlsProps) {
  const [quantity, setQuantity] = useState(cartItem.quantity)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number.parseInt(e.target.value)
    if (newQuantity > 0) {
      setQuantity(newQuantity)
    }
  }

  const handleUpdateQuantity = async () => {
    if (quantity !== cartItem.quantity) {
      setIsUpdating(true)
      await updateCartItemQuantity(cartItem.id, quantity)
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    await removeFromCart(cartItem.id)
    setIsRemoving(false)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
      updateCartItemQuantity(cartItem.id, quantity - 1)
    }
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
    updateCartItemQuantity(cartItem.id, quantity + 1)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={decreaseQuantity}
          disabled={quantity <= 1 || isUpdating}
          className="h-8 w-8 rounded-r-none"
        >
          <Minus className="h-3 w-3" />
          <span className="sr-only">Decrease quantity</span>
        </Button>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={handleQuantityChange}
          onBlur={handleUpdateQuantity}
          disabled={isUpdating}
          className="h-8 w-12 rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={increaseQuantity}
          disabled={isUpdating}
          className="h-8 w-8 rounded-l-none"
        >
          <Plus className="h-3 w-3" />
          <span className="sr-only">Increase quantity</span>
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRemove}
        disabled={isRemoving}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Remove</span>
      </Button>
    </div>
  )
}
