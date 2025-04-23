// hooks/useVerifyAdmin.ts

import { useState } from 'react'

interface VerifyAdminParams {
  token: string
  username: string
  password: string
}

interface VerifyAdminResponse {
  status: "success" | "error"
  message: string
}

export const useVerifyAdmin = () => {
  const [isLoading, setIsLoading] = useState(false)

  const verifyAdminToken = async (params: VerifyAdminParams): Promise<VerifyAdminResponse> => {
    setIsLoading(true)
    
    try {
      // Create FormData object to match API expectations
      const formData = new FormData()
      formData.append('token', params.token)
      formData.append('username', params.username)
      formData.append('password', params.password)
      
      // Make the API request
      const response = await fetch('http://localhost:8000/verify-admin-token', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to verify token: ${response.status}`)
      }
      
      const data = await response.json()
      return data as VerifyAdminResponse
      
    } catch (error) {
      console.error('Error verifying admin token:', error)
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    verifyAdminToken,
    isLoading
  }
}