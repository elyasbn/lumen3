"use client"
import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/admin/protected-route"
import { usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isPublicAdminRoute = pathname === "/admin/login" || pathname === "/admin/signup"

  return (
    <ProtectedRoute>
      {isPublicAdminRoute ? (
        <>{children}</>
      ) : (
        <SidebarProvider>
          <AdminSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      )}
    </ProtectedRoute>
  )
}
