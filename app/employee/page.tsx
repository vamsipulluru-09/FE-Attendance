"use client"

import { useState, useEffect, useRef } from "react"
import { Camera, CheckCircle, XCircle, MapPin, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useAttendanceApi } from "@/hooks/useAttendance"
import { useLocation } from "@/hooks/useLocation"

export default function AttendancePage() {
  const router = useRouter()
  const [photo, setPhoto] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const { latitude, longitude, accuracy, address, error: locationError, isLoading: isLocationLoading, refreshLocation } = useLocation()

  const { checkIn, checkOut, isSubmitting, response } = useAttendanceApi()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (showCamera) {
      startCamera()
    } else {
      stopCamera()
    }
    
    return () => {
      stopCamera()
    }
  }, [showCamera])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks()
      tracks.forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight
      
      if (context) {
        context.drawImage(videoRef.current, 0, 0)
      }
      
      const photoDataUrl = canvasRef.current.toDataURL('image/jpeg')
      setPhoto(photoDataUrl)
      
      stopCamera()
      setShowCamera(false)
    }
  }

  const handleSubmit = async (action: 'checkin' | 'checkout') => {
    if (!latitude || !longitude) {
      return
    }

    if (!photo) {
      return
    }

    const coordinates = {
      latitude,
      longitude,
      accuracy: accuracy || 0
    }

    if (action === 'checkin') {
      await checkIn(photo, coordinates)
    } else {
      await checkOut(photo, coordinates)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-9 left-9 z-10">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-2 bg-white bg-opacity-80 hover:bg-opacity-100 shadow-md rounded-full"
          onClick={() => router.push("/role-select")}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden md:inline">Back to Roles</span>
        </Button>
      </div>

      <div className="container max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-6">Mark Attendance</h1>

        <Card>
          <CardHeader>
            <CardTitle>Employee Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-medium">Location</h2>

              {locationError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">{locationError}</AlertDescription>
                  <Button variant="outline" size="sm" className="ml-auto" onClick={refreshLocation}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                </Alert>
              ) : isLocationLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Detecting location...</span>
                </div>
              ) : latitude && longitude ? (
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium">Location detected</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {address}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                    {accuracy && ` (±${Math.round(accuracy)}m)`}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={refreshLocation}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh Location
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-medium">Photo</h2>

              <div className="space-y-4">
                {photo ? (
                  <div className="relative">
                    <img
                      src={photo}
                      alt="Captured"
                      className="w-full h-64 object-cover rounded-md"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setPhoto(null)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
                    <p className="text-muted-foreground mb-4">No photo captured</p>
                  </div>
                )}

                <Button variant="outline" className="w-full" onClick={() => setShowCamera(true)}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button
                size="lg"
                className="h-16 text-lg"
                onClick={() => handleSubmit('checkin')}
                disabled={isSubmitting || !latitude || !longitude || !photo}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Check-In
              </Button>
              <Button
                size="lg"
                className="h-16 text-lg"
                onClick={() => handleSubmit('checkout')}
                disabled={isSubmitting || !latitude || !longitude || !photo}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Check-Out
              </Button>
            </div>

            {response && (
              <Alert 
                variant={response.status === "success" ? "default" : "destructive"} 
                className="mt-6"
              >
                {response.status === "success" && (
                  <AlertTitle>Success</AlertTitle>
                )}
                <AlertDescription>{response.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Capture Photo</DialogTitle>
            <DialogDescription>
              Position your face in the frame and click capture when ready.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
            <Button
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
              onClick={capturePhoto}
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}