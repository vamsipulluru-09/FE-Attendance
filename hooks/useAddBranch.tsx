"use client"

import { useState } from "react"

interface BranchData {
    branch_name: string
    latitude: string
    longitude: string
}

interface StatusMessage {
    type: "success" | "error"
    message: string
}

type OnBranchAddedCallback = () => void

export function useAddBranch(onBranchAdded?: OnBranchAddedCallback) {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

    const validateBranchData = (branchData: BranchData): boolean => {
        if (!branchData.branch_name || !branchData.latitude || !branchData.longitude) {
            setStatusMessage({
                type: "error",
                message: "All fields are required",
            })
            return false
        }

        // Validate latitude and longitude
        const lat = Number.parseFloat(branchData.latitude)
        const lng = Number.parseFloat(branchData.longitude)

        if (isNaN(lat) || lat < -90 || lat > 90) {
            setStatusMessage({
                type: "error",
                message: "Latitude must be a number between -90 and 90",
            })
            return false
        }

        if (isNaN(lng) || lng < -180 || lng > 180) {
            setStatusMessage({
                type: "error",
                message: "Longitude must be a number between -180 and 180",
            })
            return false
        }

        return true
    }

    const addBranch = async (branchData: BranchData): Promise<boolean> => {
      if (!validateBranchData(branchData)) {
        return false
      }

      try {
        // Create form data to match the backend's expected format
        const formData = new FormData()
        formData.append("branch_name", branchData.branch_name)
        formData.append("latitude", parseFloat(branchData.latitude).toString())
        formData.append("longitude", parseFloat(branchData.longitude).toString())

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND
      const response = await fetch(`${apiUrl}/branch/add`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.status === "success") {
        setStatusMessage({
          type: "success",
          message: data.message || "Branch added successfully",
        })
        
        // Call the callback to refresh branches
        if (onBranchAdded) {
          onBranchAdded()
        }
        
        return true
      } else {
        setStatusMessage({
          type: "error",
          message: data.message || "Failed to add branch",
        })
        return false
      }
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: "Failed to add branch. Please try again.",
      })
      console.error("Error adding branch:", error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { addBranch, isSubmitting, statusMessage }
}