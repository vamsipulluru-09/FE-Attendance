"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, Calendar, LayoutDashboard, LogOut, UserRound, Users, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()

    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    router.push("/role-select")
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Branches",
      href: "/admin/branches",
      icon: Building2,
    },
    {
      name: "Employees",
      href: "/admin/employees",
      icon: Users,
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: Calendar,
    },
  ]

  const SidebarContent = () => (
    <>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <UserRound className="h-6 w-6" />
          <span>Admin</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setIsOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <>
        <div className="flex h-20 items-center justify-between border-b px-1 md:hidden">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          </Link>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col">
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </>
    )
  }

  return (
    <div className="hidden h-screen w-64 flex-col border-r bg-background md:flex">
      <SidebarContent />
    </div>
  )
}