"use client"

import { useState, useEffect } from 'react'

interface LocationData {
  latitude: number | null
  longitude: number | null
  error: string | null
  isLoading: boolean
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: true
  })

  const getLocation = () => {
    setLocation(prev => ({ ...prev, isLoading: true, error: null }))
    
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        isLoading: false
      }))
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({
          latitude,
          longitude,
          error: null,
          isLoading: false
        })
      },
      (error) => {
        setLocation(prev => ({
          ...prev,
          error: `Error: ${error.message}`,
          isLoading: false
        }))
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 10000 
      }
    )
  }

  useEffect(() => {
    getLocation()
  }, [])

  const refreshLocation = () => {
    getLocation()
  }

  return {
    ...location,
    refreshLocation
  }
} 