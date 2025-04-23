"use client"

import React from "react"
import { Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AddBranchForm from "./addBranchForm"
import BranchList from "./getBranches"
import { useBranches } from "@/hooks/useGetBranches"

export default function BranchesPage() {
  const { branches, isLoading, fetchBranches } = useBranches()

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Branch Management</h1>
        {/* <p className="text-muted-foreground">Add and manage branch locations for your organization.</p> */}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Branch</CardTitle>
            {/* <CardDescription>Enter the details of the new branch location</CardDescription> */}
          </CardHeader>
          <CardContent>
            <AddBranchForm onBranchAdded={fetchBranches} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branch Locations</CardTitle>
            {/* <CardDescription>View all branch locations in your organization</CardDescription> */}
          </CardHeader>
          <CardContent className="p-0">
            <BranchList branches={branches} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}