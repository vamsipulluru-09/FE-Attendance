"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserRound, Users, Mail, Lock, Send, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAdminLogin } from "@/hooks/useAdminLogin"
import { useAdminCredentialsRequest } from "@/hooks/useAdminCredentialsRequest"

export default function RoleSelectPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [showForgotDialog, setShowForgotDialog] = useState(false)
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [requestData, setRequestData] = useState({ email: "" })
  const [forgotData, setForgotData] = useState({ username: "", newPassword: "", confirmNewPassword: "" })
  const [forgotStatus, setForgotStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false)
  const [loginError, setLoginError] = useState("")
  
  const { loginAdmin } = useAdminLogin()
  const { requestAdminCredentials } = useAdminCredentialsRequest()

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)
  }

  const handleContinue = () => {
    if (selectedRole) {
      localStorage.setItem("userRole", selectedRole)

      if (selectedRole === "admin") {
        setShowLoginDialog(true)
      } else {
        router.push("/employee")
      }
    }
  }

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError("")
    
    try {
      const success = await loginAdmin({
        username: loginData.username,
        password: loginData.password
      })
      
      if (success) {
        router.push("/admin/dashboard")
      }
    } catch (error) {
      setLoginError("Invalid username or password.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleRequestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRequestData(prev => ({ ...prev, [name]: value }))
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const success = await requestAdminCredentials(requestData.email)
    
    if (success) {
      // Clear the form
      setRequestData({ email: "" })
      
      // Close the dialog after 3 seconds
      setTimeout(() => {
        setShowRequestDialog(false)
      }, 3000)
    }
    
    setIsSubmitting(false)
  }

  const handleForgotInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForgotData(prev => ({ ...prev, [name]: value }))
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotStatus(null)
    setIsForgotSubmitting(true)

    try {
      if (!forgotData.username.trim() || !forgotData.newPassword.trim() || !forgotData.confirmNewPassword.trim()) {
        setForgotStatus({ type: "error", message: "All fields are required." })
        setIsForgotSubmitting(false)
        return
      }
      if (forgotData.newPassword !== forgotData.confirmNewPassword) {
        setForgotStatus({ type: "error", message: "Passwords do not match." })
        setIsForgotSubmitting(false)
        return
      }
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND
      const formData = new FormData()
      formData.append("username", forgotData.username)
      formData.append("new_password", forgotData.newPassword)
      const response = await fetch(`${apiUrl}/forgot-password`, {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (data.status === "success") {
        setForgotStatus({ type: "success", message: data.message || "Password updated successfully." })
        setTimeout(() => {
          setShowForgotDialog(false)
          setForgotData({ username: "", newPassword: "", confirmNewPassword: "" })
        }, 2000)
      } else {
        setForgotStatus({ type: "error", message: data.message || "Failed to update password." })
      }
    } catch (error) {
      setForgotStatus({ type: "error", message: "Failed to update password. Please try again." })
    } finally {
      setIsForgotSubmitting(false)
    }
  }

  const handleDownloadApp = () => {
    window.open('/app-release.apk', '_blank')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Select Your Role</CardTitle>
          <CardDescription>Choose your role to access the appropriate dashboard</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button
            variant={selectedRole === "admin" ? "default" : "outline"}
            className={`h-24 flex flex-col items-center justify-center gap-2 ${
              selectedRole === "admin" ? "border-2 border-primary" : ""
            }`}
            onClick={() => handleRoleSelect("admin")}
          >
            <Users className="h-8 w-8" />
            <span className="text-lg font-medium">Admin</span>
          </Button>

          <Button
            variant={selectedRole === "employee" ? "default" : "outline"}
            className={`h-24 flex flex-col items-center justify-center gap-2 ${
              selectedRole === "employee" ? "border-2 border-primary" : ""
            }`}
            onClick={() => handleRoleSelect("employee")}
          >
            <UserRound className="h-8 w-8" />
            <span className="text-lg font-medium">Employee</span>
          </Button>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg" disabled={!selectedRole} onClick={handleContinue}>
            Continue
          </Button>
        </CardFooter>
      </Card>

      {/* Download App Button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg flex items-center justify-center"
        onClick={handleDownloadApp}
        title="Download App"
      >
        <Download className="h-6 w-6" />
      </Button>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
            <DialogDescription>
              Enter your credentials to access the admin dashboard
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="admin_username"
                  className="pl-10"
                  value={loginData.username}
                  onChange={handleLoginInputChange}
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
                  value={loginData.password}
                  onChange={handleLoginInputChange}
                  required
                />
              </div>
            </div>

            {loginError && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLoginDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoggingIn}>
                {isLoggingIn ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t flex flex-col gap-2">
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => {
                setShowLoginDialog(false)
                setShowRequestDialog(true)
              }}
            >
              Request Admin Access
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => {
                setShowLoginDialog(false)
                setShowForgotDialog(true)
              }}
            >
              Forgot Password?
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Admin Access</DialogTitle>
            <DialogDescription>
              Enter your email to request admin access. A super admin will review your request.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleRequestSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="pl-10"
                  value={requestData.email}
                  onChange={handleRequestInputChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRequestDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Admin Password</DialogTitle>
            <DialogDescription>
              Enter your username and new password to reset your admin password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-username">Username</Label>
              <Input
                id="forgot-username"
                name="username"
                type="text"
                placeholder="admin_username"
                value={forgotData.username}
                onChange={handleForgotInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forgot-new-password">New Password</Label>
              <Input
                id="forgot-new-password"
                name="newPassword"
                type="password"
                placeholder="••••••••"
                value={forgotData.newPassword}
                onChange={handleForgotInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forgot-confirm-new-password">Confirm New Password</Label>
              <Input
                id="forgot-confirm-new-password"
                name="confirmNewPassword"
                type="password"
                placeholder="••••••••"
                value={forgotData.confirmNewPassword}
                onChange={handleForgotInputChange}
                required
              />
            </div>
            {forgotStatus && (
              <Alert variant={forgotStatus.type === "error" ? "destructive" : "default"} className="py-2">
                <AlertDescription>{forgotStatus.message}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isForgotSubmitting || forgotStatus?.type === "success"}>
                {isForgotSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}