"use client"

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, Loader2 } from "lucide-react"

interface Branch {
  branch_id: string;
  branch_name: string;
  latitude: number;
  longitude: number;
}

interface BranchListProps {
  branches: Branch[];
  isLoading: boolean;
}

export default function BranchList({ branches, isLoading }: BranchListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!branches || branches.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        No branches found
      </div>
    )
  }

  return (
    <div className="max-h-64 overflow-y-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-1/2">Name</TableHead>
            <TableHead>Latitude</TableHead>
            <TableHead>Longitude</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.map((branch) => (
            <TableRow key={branch.branch_id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  {branch.branch_name}
                </div>
              </TableCell>
              <TableCell>{branch.latitude}</TableCell>
              <TableCell>{branch.longitude}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}