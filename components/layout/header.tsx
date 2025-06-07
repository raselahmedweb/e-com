"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, User, Menu, Search, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getCurrentUser } from "@/app/auth/actions";
import { Category, UserT } from "@/lib/types";


export function Header() {
  const [user, setUser] = useState<UserT | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const cartItemsCount = 2; // Mock cart count

  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      }
    }
    fetchUser();
  }, []);

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
    <header className="sticky top-0 z-40 w-full bg-background shadow-sm">
      <div className="container px-4 md:px-6 flex h-16 items-center justify-between py-4 mx-auto">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">ShopEase</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            {categories && categories.map((category : Category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isSearchOpen ? (
            <div className="flex items-center w-full md:w-auto">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full md:w-[200px] lg:w-[300px]"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="ml-2"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close search</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartItemsCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>

          {user ? (
            <Link href={user.isAdmin ? "/admin" : "/account"}>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <LogIn className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Button>
            </Link>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="grid gap-6 py-6">
                <Link
                  href="/"
                  className="text-base font-medium transition-colors hover:text-primary"
                >
                  Home
                </Link>
                {categories && categories.map((category: Category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="text-base font-medium transition-colors hover:text-primary"
                  >
                    {category.name}
                  </Link>
                ))}
                <div className="pt-4">
                  <Input type="search" placeholder="Search products..." />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
