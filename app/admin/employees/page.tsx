"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, UserRound, Loader2, Search, Plus, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useBranches } from "@/hooks/useGetBranches"
import { useEmployees } from "@/hooks/useGetEmployees"
import { useEnrollEmployee } from "@/hooks/useEnrollEmployee"

export default function EmployeesPage() {
  // Use hooks
  const { branches = [], isLoading: loadingBranches = false, error: branchesError = null } = useBranches() || {} as { branches: Array<{ branch_id?: string; id?: string; branch_name?: string; name?: string }> }
  const { employees, isLoading: loadingEmployees, error: employeesError, fetchEmployees } = useEmployees()
  const { enrollEmployee, isSubmitting, statusMessage, setStatusMessage } = useEnrollEmployee()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [newEmployee, setNewEmployee] = useState({ entityId: "", name: "", branchId: "" })
  const [photo, setPhoto] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  
  // Camera references and states
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.branch.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  interface InputChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

  const handleInputChange = (e: InputChangeEvent): void => {
    const { name, value } = e.target
    setNewEmployee((prev) => ({ ...prev, [name]: value }))
  }

  const handleBranchChange = (value: string): void => {
    setNewEmployee((prev) => ({ ...prev, branchId: value }))
  }

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setStatusMessage({
        type: "error",
        message: "Could not access camera. Please ensure you've granted permission."
      })
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks()
      tracks.forEach(track => track.stop())
      streamRef.current = null
    }
  }

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      // Match canvas dimensions to video
      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight
      
      // Draw the current video frame onto the canvas
      if (context) {
        context.drawImage(videoRef.current, 0, 0)
      }
      
      // Convert to data URL
      const photoDataUrl = canvasRef.current.toDataURL('image/jpeg')
      setPhoto(photoDataUrl)
      
      // Close camera dialog
      stopCamera()
      setShowCamera(false)
    }
  }

  // Effect to start camera when dialog opens
  useEffect(() => {
    if (showCamera) {
      startCamera()
    } else {
      stopCamera()
    }
    
    // Cleanup when component unmounts
    return () => {
      stopCamera()
    }
  }, [showCamera])

  interface SubmitEvent extends React.FormEvent<HTMLFormElement> {}

  const handleSubmit = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault()

    // Validate inputs
    if (!newEmployee.entityId || !newEmployee.name || !newEmployee.branchId) {
      setStatusMessage({
        type: "error",
        message: "All fields are required",
      })
      return
    }

    if (!photo) {
      setStatusMessage({
        type: "error",
        message: "Employee photo is required",
      })
      return
    }

    // Use the enrollEmployee hook
    const result = await enrollEmployee({
      entityId: newEmployee.entityId,
      name: newEmployee.name,
      branchId: newEmployee.branchId,
      photo: photo
    })

    if (result.status === "success") {
      fetchEmployees()
      
      setNewEmployee({ entityId: "", name: "", branchId: "" })
      setPhoto(null)
    }
  }

  // Add this style to hide scrollbars
  useEffect(() => {
    // Apply to both the main page and HTML/body elements
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    
    // Cleanup when component unmounts
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="p-6 h-screen overflow-hidden">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
        {/* <p className="text-muted-foreground">Enroll and manage employees in the facial recognition system.</p> */}
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Employee List</TabsTrigger>
          <TabsTrigger value="enroll">Enroll Employee</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 overflow-auto max-h-[calc(100vh-220px)]">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search employees..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Employees</CardTitle>
              {/* <CardDescription>Manage your enrolled employees</CardDescription> */}
            </CardHeader>
            <CardContent>
              {employeesError ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{employeesError}</AlertDescription>
                </Alert>
              ) : loadingEmployees ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading employees...</span>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[calc(100vh-380px)] pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f8fafc' }}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky top-0 bg-background z-10">ID</TableHead>
                        <TableHead className="sticky top-0 bg-background z-10">Name</TableHead>
                        <TableHead className="sticky top-0 bg-background z-10">Branch</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell className="font-medium">{employee.id}</TableCell>
                            <TableCell>{employee.name}</TableCell>
                            <TableCell>{employee.branch}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            No employees found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enroll" className="overflow-y-auto max-h-[calc(100vh-210px)] pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f8fafc' }}>
          <Card>
            <CardHeader>
              <CardTitle>Enroll New Employee</CardTitle>
              {/* <CardDescription>Add a new employee to the facial recognition system</CardDescription> */}
            </CardHeader>
            <CardContent>
              {branchesError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{branchesError}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="entityId">Employee ID</Label>
                    <Input
                      id="entityId"
                      name="entityId"
                      placeholder="e.g., EMP006"
                      value={newEmployee.entityId}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., John Doe"
                      value={newEmployee.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branchId">Assigned Branch</Label>
                  <Select 
                    value={newEmployee.branchId} 
                    onValueChange={handleBranchChange}
                    disabled={loadingBranches}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingBranches ? "Loading branches..." : "Select a branch"} />
                    </SelectTrigger>
                    <SelectContent>
                      {branches && branches.length > 0 ? (
                        branches
                          .filter((branch: { branch_id?: string; id?: string; branch_name?: string; name?: string }) => branch && (branch.branch_id || branch.id))
                          .map((branch: { branch_id?: string; id?: string; branch_name?: string; name?: string }) => {
                            const id = branch.branch_id || branch.id;
                            const name = branch.branch_name || branch.name;
                            
                            return (
                              <SelectItem 
                                key={id} 
                                value={String(id)}
                              >
                                {name}
                              </SelectItem>
                            );
                          })
                      ) : (
                        <SelectItem value="no-branches" disabled>
                          {loadingBranches ? "Loading branches..." : "No branches available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Employee Photo</Label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      {photo ? (
                        <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-md border">
                          <img
                            src={photo}
                            alt="Employee"
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute right-2 top-2"
                            onClick={() => setPhoto(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex aspect-square w-full max-w-[200px] flex-col items-center justify-center rounded-md border border-dashed">
                          <UserRound className="h-8 w-8 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">No photo selected</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-center space-y-2">
                      <Button type="button" variant="outline" onClick={() => setShowCamera(true)}>
                        <Camera className="mr-2 h-4 w-4" />
                        Capture Photo
                      </Button>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting || loadingBranches}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Enroll Employee
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Capture Employee Photo</DialogTitle>
            <DialogDescription>
              Position the employee's face within the frame and take a photo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-full overflow-hidden rounded-md bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-auto w-full"
              ></video>
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                type="button"
                onClick={capturePhoto}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCamera(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}