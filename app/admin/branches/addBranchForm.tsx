"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Plus } from "lucide-react"
import { useAddBranch } from "@/hooks/useAddBranch"

interface AddBranchFormProps {
  onBranchAdded: () => void;
}

export default function AddBranchForm({ onBranchAdded }: AddBranchFormProps) {
  const { addBranch, isSubmitting, statusMessage } = useAddBranch(onBranchAdded)
  const [newBranch, setNewBranch] = useState({ branch_name: "", latitude: "", longitude: "" })

interface InputChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

const handleInputChange = (e: InputChangeEvent) => {
    const { name, value } = e.target
    setNewBranch((prev) => ({ ...prev, [name]: value }))
}

interface Branch {
    branch_name: string;
    latitude: string;
    longitude: string;
}

interface SubmitEvent extends React.FormEvent<HTMLFormElement> {}

const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    if (await addBranch(newBranch)) {
        setNewBranch({ branch_name: "", latitude: "", longitude: "" })
    }
}

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="branch_name">Branch Name</Label>
        <Input
          id="branch_name"
          name="branch_name"
          placeholder="e.g., Main Office"
          value={newBranch.branch_name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="latitude">Latitude</Label>
        <Input
          id="latitude"
          name="latitude"
          placeholder="e.g., 40.7128"
          value={newBranch.latitude}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="longitude">Longitude</Label>
        <Input
          id="longitude"
          name="longitude"
          placeholder="e.g., -74.0060"
          value={newBranch.longitude}
          onChange={handleInputChange}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add Branch
          </>
        )}
      </Button>

      {statusMessage && (
        <Alert variant={statusMessage.type === "error" ? "destructive" : "default"} className="mt-4">
          <AlertTitle>{statusMessage.type === "success" ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{statusMessage.message}</AlertDescription>
        </Alert>
      )}
    </form>
  )
}