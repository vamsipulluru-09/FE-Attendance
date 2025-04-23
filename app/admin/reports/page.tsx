"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Search, Download, Filter } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

// Mock data for attendance records
const mockAttendanceRecords = [
  {
    id: 1,
    employeeId: "EMP001",
    name: "John Doe",
    branch: "Main Office",
    date: "2023-04-22",
    checkIn: "09:05:23",
    checkOut: "17:30:45",
  },
  {
    id: 2,
    employeeId: "EMP002",
    name: "Jane Smith",
    branch: "Downtown Branch",
    date: "2023-04-22",
    checkIn: "08:55:12",
    checkOut: "17:15:33",
  },
  {
    id: 3,
    employeeId: "EMP003",
    name: "Michael Johnson",
    branch: "West Side Office",
    date: "2023-04-22",
    checkIn: "09:10:05",
    checkOut: "18:05:22",
  },
  {
    id: 4,
    employeeId: "EMP004",
    name: "Emily Davis",
    branch: "East End Branch",
    date: "2023-04-22",
    checkIn: "08:45:30",
    checkOut: "17:00:15",
  },
  {
    id: 5,
    employeeId: "EMP005",
    name: "Robert Wilson",
    branch: "Main Office",
    date: "2023-04-22",
    checkIn: "09:02:18",
    checkOut: "17:45:10",
  },
]

// Mock data for branches
const mockBranches = [
  { id: 1, name: "All Branches" },
  { id: 2, name: "Main Office" },
  { id: 3, name: "Downtown Branch" },
  { id: 4, name: "West Side Office" },
  { id: 5, name: "East End Branch" },
]

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("All Branches")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [view, setView] = useState<"daily" | "weekly">("daily")

  const filteredRecords = mockAttendanceRecords.filter(
    (record) =>
      (selectedBranch === "All Branches" || record.branch === selectedBranch) &&
      (record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Reports</h1>
        <p className="text-muted-foreground">View and analyze employee attendance records.</p>
      </div>

      <Tabs defaultValue="daily" onValueChange={(value) => setView(value as "daily" | "weekly")}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="daily">Daily View</TabsTrigger>
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>

            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or ID..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="branch-filter" className="text-sm">
              Filter by Branch:
            </Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger id="branch-filter" className="w-[180px]">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {mockBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.name}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="daily" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Report</CardTitle>
              <CardDescription>
                {date ? format(date, "EEEE, MMMM d, yyyy") : "Today's"} attendance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Check-In</TableHead>
                    <TableHead>Check-Out</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => {
                      // Calculate duration
                      const checkIn = new Date(`${record.date}T${record.checkIn}`)
                      const checkOut = new Date(`${record.date}T${record.checkOut}`)
                      const durationMs = checkOut.getTime() - checkIn.getTime()
                      const hours = Math.floor(durationMs / (1000 * 60 * 60))
                      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
                      const duration = `${hours}h ${minutes}m`

                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.employeeId}</TableCell>
                          <TableCell>{record.name}</TableCell>
                          <TableCell>{record.branch}</TableCell>
                          <TableCell>{record.checkIn}</TableCell>
                          <TableCell>{record.checkOut}</TableCell>
                          <TableCell>{duration}</TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No attendance records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Attendance Report</CardTitle>
              <CardDescription>Weekly attendance summary for the selected date range</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Weekly report view would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
