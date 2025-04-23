"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Camera, Upload, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import CameraCapture from "@/components/camera-capture"
import LocationStatus from "@/components/location-status"

type Coordinates = {
  latitude: number
  longitude: number
  accuracy: number
}

type StatusMessage = {
  type: "success" | "error"
  message: string
}

export default function AttendanceForm() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Request location permission on component mount
    requestGeolocation()
  }, [])

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

  const handleCameraCapture = (imageSrc: string) => {
    setPhoto(imageSrc)
    setShowCamera(false)
  }

  const handleSubmit = async (endpoint: string) => {
    if (!coordinates) {
      setStatusMessage({
        type: "error",
        message: "Location data is required. Please enable location services.",
      })
      return
    }

    if (!photo) {
      setStatusMessage({
        type: "error",
        message: "Please capture or upload a photo before checking in/out.",
      })
      return
    }

    setIsSubmitting(true)
    setStatusMessage(null)

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photo,
          location: coordinates,
          timestamp: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "An error occurred")
      }

      setStatusMessage({
        type: "success",
        message: data.message || `Successfully processed ${endpoint.includes("checkin") ? "check-in" : "check-out"}`,
      })
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      {/* Location Status */}
      <LocationStatus coordinates={coordinates} error={locationError} onRetry={requestGeolocation} />

      {/* Photo Capture Section */}
      <div className="my-6">
        <h2 className="text-lg font-medium mb-3">Photo</h2>

        {showCamera ? (
          <CameraCapture onCapture={handleCameraCapture} onCancel={() => setShowCamera(false)} />
        ) : (
          <div className="space-y-4">
            {photo ? (
              <div className="relative">
                <img src={photo || "/placeholder.svg"} alt="Captured" className="w-full h-64 object-cover rounded-md" />
                <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => setPhoto(null)}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
                <p className="text-muted-foreground mb-4">No photo captured</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCamera(true)}>
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>

            </div>
          </div>
        )}
      </div>

      {/* Check-in/Check-out Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Button
          size="lg"
          className="h-16 text-lg"
          onClick={() => handleSubmit("/process-checkin")}
          disabled={isSubmitting || !coordinates || !photo}
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Check-In
        </Button>

        <Button
          size="lg"
          variant="secondary"
          className="h-16 text-lg"
          onClick={() => handleSubmit("/process-checkout")}
          disabled={isSubmitting || !coordinates || !photo}
        >
          <XCircle className="h-5 w-5 mr-2" />
          Check-Out
        </Button>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <Alert variant={statusMessage.type === "error" ? "destructive" : "default"} className="mt-6">
          <AlertTitle>{statusMessage.type === "success" ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{statusMessage.message}</AlertDescription>
        </Alert>
      )}
    </Card>
  )
}
