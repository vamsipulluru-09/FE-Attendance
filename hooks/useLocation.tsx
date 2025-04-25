"use client"

import { useState, useEffect } from 'react'

interface LocationData {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  address: string | null
  error: string | null
  isLoading: boolean
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    accuracy: null,
    address: null,
    error: null,
    isLoading: true
  })

  useEffect(() => {
    const getLocation = async () => {
      try {
        // First try to get precise location using browser's geolocation
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          })
        })

        const { latitude, longitude, accuracy } = position.coords

        // Get address using reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        )
        const data = await response.json()
        const address = data.display_name

        setLocation({
          latitude,
          longitude,
          accuracy,
          address,
          error: null,
          isLoading: false
        })
      } catch (error) {
        // If geolocation fails, try IP-based location as fallback
        try {
          const ipResponse = await fetch('https://ipapi.co/json/')
          const ipData = await ipResponse.json()

          setLocation({
            latitude: ipData.latitude,
            longitude: ipData.longitude,
            accuracy: null, // IP-based location doesn't provide accuracy
            address: `${ipData.city}, ${ipData.region}, ${ipData.country_name}`,
            error: null,
            isLoading: false
          })
        } catch (ipError) {
          setLocation(prev => ({
            ...prev,
            error: 'Failed to detect location. Please enable location services or check your connection.',
            isLoading: false
          }))
        }
      }
    }

    getLocation()
  }, [])

  const refreshLocation = () => {
    setLocation(prev => ({ ...prev, isLoading: true, error: null }))
    // Trigger the useEffect again
    window.location.reload()
  }

  return {
    ...location,
    refreshLocation
  }
} 