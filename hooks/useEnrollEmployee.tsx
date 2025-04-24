"use client"

import { useState } from "react"

interface EnrollEmployeeParams {
  entityId: string;
  name: string;
  branchId: string | number;
  photo: string;
}

interface EnrollEmployeeResult {
  status: "success" | "error";
  message: string;
}

export function useEnrollEmployee() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "error" | "success"; message: string } | null>(null)

  const enrollEmployee = async ({ entityId, name, branchId, photo }: EnrollEmployeeParams): Promise<EnrollEmployeeResult> => {
    setIsSubmitting(true)
    setStatusMessage(null)

    try {
      // Create FormData for file upload to match backend API
      const formData = new FormData()
      formData.append("entity_id", entityId.trim())
      formData.append("name", name.trim())
      formData.append("branch_id", String(branchId))
      
      // Convert data URL to Blob for file upload
      if (photo.startsWith('data:image')) {
        const res = await fetch(photo)
        const blob = await res.blob()
        formData.append("photo", blob, `${entityId}.jpg`)
      }

      // Send data to the API endpoint
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND
      const response = await fetch(`${apiUrl}/enroll-employee`, {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()

      if (result.status === "success") {
        setStatusMessage({
          type: "success",
          message: result.message || "Employee enrolled successfully"
        })
        return { status: "success", message: result.message || "Employee enrolled successfully" }
      } else {
        setStatusMessage({
          type: "error",
          message: result.message || "Failed to enroll employee"
        })
        return { status: "error", message: result.message || "Failed to enroll employee" }
      }
    } catch (error) {
      const errorMessage = "Failed to enroll employee. Please try again."
      setStatusMessage({
        type: "error",
        message: errorMessage
      })
      console.error("Error enrolling employee:", error)
      return { status: "error", message: errorMessage }
    } finally {
      setIsSubmitting(false)
    }
  }

  return { enrollEmployee, isSubmitting, statusMessage, setStatusMessage }
}