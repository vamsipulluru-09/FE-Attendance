"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, X, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Webcam from "react-webcam"

type CameraCaptureProps = {
  onCapture: (imageSrc: string) => void
  onCancel: () => void
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [isLoading, setIsLoading] = useState(true)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  // Check if device is mobile on component mount
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileDevice = typeof navigator !== "undefined" && 
        (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768)
      setIsMobile(isMobileDevice)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  // Clear the timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  // Handle webcam errors
  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error("Webcam error:", error)
    setError("Could not access camera. Please ensure you've granted camera permissions.")
    setIsLoading(false)
  }, [])

  // Handle when webcam is ready
  const handleUserMedia = useCallback(() => {
    setIsLoading(false)
    setError(null)
    
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
  }, [timeoutId])

  // Switch between front and rear cameras on mobile
  const switchCamera = useCallback(() => {
    setIsLoading(true)
    setFacingMode(prevMode => prevMode === "user" ? "environment" : "user")
    
    // Set a timeout to detect if camera switching fails
    const id = setTimeout(() => {
      if (isLoading) {
        setError("Camera switching failed. Please try again.")
        setIsLoading(false)
      }
    }, 8000)
    
    setTimeoutId(id)
  }, [isLoading])

  // Reset the webcam connection
  const resetWebcam = useCallback(() => {
    setIsLoading(true)
    setError(null)
    
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    const id = setTimeout(() => {
      if (isLoading) {
        setError("Camera connection timeout. Please try again.")
        setIsLoading(false)
      }
    }, 10000)
    
    setTimeoutId(id)
  }, [isLoading, timeoutId])

  // Capture photo from webcam
  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) return

    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      onCapture(imageSrc)
    } else {
      setError("Failed to capture image. Please try again.")
    }
  }, [onCapture])

  const videoConstraints = {
    width: { min: 480, ideal: 1280, max: 1920 },
    height: { min: 360, ideal: 720, max: 1080 },
    aspectRatio: 4/3,
    facingMode
  }

  return (
    <div className="relative bg-black rounded-md overflow-hidden">
      {error ? (
        <div className="p-6 text-center text-white h-64 flex flex-col items-center justify-center">
          <p className="mb-4">{error}</p>
          <Button 
            onClick={resetWebcam} 
            variant="secondary"
            disabled={isLoading}
          >
            {isLoading ? "Connecting..." : "Retry"}
          </Button>
        </div>
      ) : (
        <>
          <div className="relative h-64">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.92}
              videoConstraints={videoConstraints}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              className="absolute inset-0 w-full h-full object-cover"
              mirrored={facingMode === "user"}
              forceScreenshotSourceSize
              imageSmoothing={true}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center bg-gradient-to-t from-black/70 to-transparent">
            {isMobile && (
              <Button 
                onClick={switchCamera} 
                variant="outline" 
                size="icon" 
                className="rounded-full h-10 w-10 p-0 absolute left-4 bottom-4 bg-black/50 border-white/20 text-white hover:bg-black/70"
                disabled={isLoading}
              >
                <RefreshCcw className="h-5 w-5" />
              </Button>
            )}
            
            <Button 
              onClick={capturePhoto} 
              size="lg" 
              className="rounded-full h-14 w-14 p-0 mx-2"
              disabled={isLoading || error !== null}
            >
              <Camera className="h-6 w-6" />
            </Button>

            <Button
              onClick={onCancel}
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 p-0 absolute right-4 top-4 bg-black/50 border-white/20 text-white hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}