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
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [requestData, setRequestData] = useState({ email: "" })
  
  const { loginAdmin, isLoggingIn, loginError } = useAdminLogin()
  const { requestAdminCredentials, isSubmitting, response } = useAdminCredentialsRequest()

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
    
    const success = await loginAdmin({
      username: loginData.username,
      password: loginData.password
    })
    
    if (success) {
      router.push("/admin/dashboard")
    }
  }

  const handleRequestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRequestData(prev => ({ ...prev, [name]: value }))
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const success = await requestAdminCredentials(requestData.email)
    
    if (success) {
      // Clear the form
      setRequestData({ email: "" })
      
      // Close the dialog after 3 seconds
      setTimeout(() => {
        setShowRequestDialog(false)
      }, 3000)
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

          <div className="mt-4 pt-4 border-t">
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

            {response && (
              <Alert variant={response.status === "error" ? "destructive" : "default"} className="py-2">
                <AlertDescription>{response.message}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRequestDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || response?.status === "success"}>
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}