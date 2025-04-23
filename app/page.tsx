"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function RoleDetectionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real application, this would be a proper role detection mechanism
    // For this demo, we'll use localStorage to simulate role detection
    const detectRole = async () => {
      try {
        // Simulate API call to detect role
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const storedRole = localStorage.getItem("userRole")

        if (storedRole === "admin") {
          router.push("/admin/dashboard")
        } else if (storedRole === "employee") {
          router.push("/employee")
        } else {
          // For demo purposes, default to role selection
          router.push("/role-select")
        }
      } catch (error) {
        console.error("Error detecting role:", error)
        router.push("/role-select")
      }
    }

    detectRole()
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-2xl font-bold">Detecting user role...</h1>
        <p className="text-muted-foreground">Please wait while we set up your dashboard</p>
      </div>
    </div>
  )
}
