"use client"

import { useState, useEffect } from "react"

export function useBranches() {
  const [branches, setBranches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBranches = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8000/branches")
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