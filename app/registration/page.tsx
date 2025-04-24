"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { UserRound, Lock, UserPlus, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useVerifyAdmin } from "@/hooks/useRegistration"

// Create a component that uses useSearchParams
function RegistrationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState("")
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { verifyAdminToken, isLoading } = useVerifyAdmin()

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    } else {
      setError("No verification token found in URL. Please use the link from your invitation email.")
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!token.trim()) {
      setError("Verification token is missing")
      return false
    }
    
    if (!formData.username.trim()) {
      setError("Username is required")
      return false
    }

    if (!formData.password.trim()) {
      setError("Password is required")
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await verifyAdminToken({
        token,
        username: formData.username,
        password: formData.password
      })
      
      if (result.status === "success") {
        setSuccess(true)
        
        setFormData({
          username: "",
          password: "",
          confirmPassword: ""
        })
        
        setTimeout(() => {
          router.push("/role-select")
        }, 2000)
      } else {
        setError(result.message || "Failed to create account")
      }
      
    } catch (error) {
      setError("Failed to create account. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <UserPlus className="h-12 w-12 mx-auto mb-2 text-primary" />
          <CardTitle className="text-2xl">Complete Admin Registration</CardTitle>
          <CardDescription>Set up your admin account credentials</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Account created successfully! Redirecting to login...
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  placeholder="johndoe"
                  className="pl-10"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={isSubmitting || isLoading || success || !token}
            >
              {isSubmitting || isLoading ? "Creating Account..." : "Complete Registration"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

// Main component with Suspense boundary
export default function RegistrationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <RegistrationForm />
    </Suspense>
  )
}