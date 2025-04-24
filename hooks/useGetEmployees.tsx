"use client"

import { useState, useEffect } from "react"

// Define type for employee
export interface Employee {
  id: string;
  entity_id?: string;
  name: string;
  branch: string;
  branch_name?: string;
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = async () => {
    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND
      const response = await fetch(`${apiUrl}/employees`)
      const data = await response.json()

      if (data.status === "success") {
        // Map the data to match our interface
        const formattedEmployees = (data.employees || []).map((emp: any) => ({
          id: emp.entity_id,
          name: emp.name,
          branch: emp.branch_name || "Unassigned",
        }))
        
        setEmployees(formattedEmployees)
        setError(null)
      } else {
        setError(data.message || "Failed to fetch employees")
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
      setError("Failed to load employees. Please refresh the page.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  return { employees, isLoading, error, fetchEmployees }
}