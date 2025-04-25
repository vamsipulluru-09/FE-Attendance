"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { useAdminLogin } from "@/hooks/useAdminLogin"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import Cookies from 'js-cookie'

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { logoutAdmin } = useAdminLogin()

  useEffect(() => {
    const adminUsername = Cookies.get('admin_username')
    if (!adminUsername) {
      router.push('/role-select')
    }
  }, [router])

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