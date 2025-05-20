import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/auth/actions"
import { AdminSidebar } from "./components/admin-sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check if user is admin
  const user = await getCurrentUser()

  if (!user || !user.isAdmin) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container py-6">{children}</div>
      </div>
    </div>
  )
}
