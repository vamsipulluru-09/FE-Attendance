"use client"

import { RefreshCw, MapPin, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Coordinates = {
  latitude: number
  longitude: number
  accuracy: number
}

type LocationStatusProps = {
  coordinates: Coordinates | null
  error: string | null
  onRetry: () => void
}

export default function LocationStatus({ coordinates, error, onRetry }: LocationStatusProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium">Location</h2>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{error}</AlertDescription>
          <Button variant="outline" size="sm" className="ml-auto" onClick={onRetry}>
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
  )
}
