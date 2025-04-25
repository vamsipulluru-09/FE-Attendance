"use client"

import type React from "react"
import type { Metadata } from "next"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { useAdminLogin } from "@/hooks/useAdminLogin"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard | Attendance System",
  description: "Admin dashboard for the facial recognition attendance system",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { logoutAdmin } = useAdminLogin()

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b flex items-center justify-end px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={logoutAdmin}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
