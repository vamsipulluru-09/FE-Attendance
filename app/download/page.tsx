"use client"

import { Download, Smartphone, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DownloadPage() {
  const handleDownload = () => {
    window.open('/app-release.apk', '_blank')
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Download Our Mobile App</h1>
        <p className="text-muted-foreground">
          Get the best experience with our native mobile application
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Mobile Experience
            </CardTitle>
            <CardDescription>
              Optimized for mobile devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Faster performance
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Enhanced security
              </li>
              <li className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" />
                Native features
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Installation Guide
            </CardTitle>
            <CardDescription>
              Follow these steps to install
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-decimal list-inside">
              <li>Download the APK file</li>
              <li>Open the downloaded file</li>
              <li>Allow installation from unknown sources if prompted</li>
              <li>Follow the installation prompts</li>
              <li>Open the app and enjoy!</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button size="lg" onClick={handleDownload}>
          <Download className="mr-2 h-5 w-5" />
          Download APK
        </Button>
      </div>
    </div>
  )
} 