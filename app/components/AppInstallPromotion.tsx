"use client"

import { useState, useEffect } from "react"
import { X, Download, Smartphone, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function AppInstallPromotion() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop' | null>(null)

  useEffect(() => {
    // Check if the app is already installed (running in standalone mode)
    const checkStandalone = () => {
      // Check if user is on mobile
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setDeviceType(isMobileDevice ? 'mobile' : 'desktop')
      
      // Check if promotion was dismissed
      const dismissed = localStorage.getItem('appPromotionDismissed')
      setIsDismissed(!!dismissed)
      
      // Show promotion if not dismissed
      if (!dismissed) {
        // Show immediately instead of with delay
        setIsVisible(true)
      }
    }
    
    checkStandalone()
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('appPromotionDismissed', 'true')
    setIsDismissed(true)
  }

  const handleDownload = () => {
    // Direct to APK download
    window.open('/app-release.apk', '_blank')
  }

  if (!isVisible || isDismissed) {
    return null
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-primary text-primary-foreground border-primary/20 shadow-lg z-50 animate-in slide-in-from-bottom duration-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            {deviceType === 'mobile' ? (
              <Smartphone className="h-5 w-5" />
            ) : (
              <Laptop className="h-5 w-5" />
            )}
            Download Our App
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" 
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm">
          {deviceType === 'mobile' 
            ? "Get our mobile app for a better experience! Install it on your device for quick access and offline features."
            : "Download our mobile app for the best experience! Available for Android devices."}
        </p>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90" 
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          Download APK
        </Button>
      </CardFooter>
    </Card>
  )
} 