"use client"

import { useState, useEffect, useRef } from "react"
import { Camera, CheckCircle, XCircle, MapPin, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useAttendanceApi } from "@/hooks/useAttendance"

type Coordinates = {
  latitude: number
  longitude: number
  accuracy: number
}

export default function AttendancePage() {
  const router = useRouter()
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)

  const { checkIn, checkOut, isSubmitting, response } = useAttendanceApi()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    requestGeolocation()

    return () => {
      stopCamera()
    }
  }, [])

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

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
        setLocationError(null)
      },
      (error) => {
        let errorMessage = "Unknown error occurred while retrieving location"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location services."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out."
            break
        }

        setLocationError(errorMessage)
        setCoordinates(null)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

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
      setLocationError("Could not access camera. Please ensure you've granted permission.")
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
    if (!coordinates) {
      setLocationError("Location data is required. Please enable location services.")
      return
    }

    if (!photo) {
      setLocationError("Please capture a photo before checking in/out.")
      return
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
                  <Button variant="outline" size="sm" className="ml-auto" onClick={requestGeolocation}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                </Alert>
              ) : coordinates ? (
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium">Location captured</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Lat: {coordinates.latitude.toFixed(6)}, Lng: {coordinates.longitude.toFixed(6)}
                    {coordinates.accuracy && ` (±${Math.round(coordinates.accuracy)}m)`}
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="animate-spin mr-2">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Requesting location...</span>
                </div>
              )}
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
                disabled={isSubmitting || !coordinates || !photo}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Check-In
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="h-16 text-lg"
                onClick={() => handleSubmit('checkout')}
                disabled={isSubmitting || !coordinates || !photo}
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
              Position your face within the frame and take a photo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-full overflow-hidden rounded-md bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-auto w-full"
              ></video>
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                type="button"
                onClick={capturePhoto}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCamera(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}