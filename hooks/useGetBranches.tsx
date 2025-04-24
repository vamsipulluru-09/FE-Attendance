"use client"

import { useState, useEffect } from "react"

export function useBranches() {
  const [branches, setBranches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBranches = async () => {
    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND
      const response = await fetch(`${apiUrl}/branches`)
      const data = await response.json()

      if (data.status === "success") {
        setBranches(data.branches)
        setError(null)
      } else {
        setError(data.message || "Failed to fetch branches")
      }
    } catch (error) {
      console.error("Error fetching branches:", error)
      setError("Failed to load branches. Please refresh the page.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  return { branches, isLoading, error, fetchBranches }
}