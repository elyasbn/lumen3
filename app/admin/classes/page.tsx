"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Users,
  Clock,
  Calendar,
  MoreHorizontal,
  Upload,
  ImageIcon,
  DollarSign,
  Save,
  X,
} from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"

interface ClassData {
  id: number
  name: string
  description: string | null
  instructor: string
  instructorId: number
  schedule: string | null
  duration: number | null
  capacity: number | null
  enrolled: number | null
  price: number | null
  status: string
  level: string | null
  image: string | null
  createdAt: string
  updatedAt: string
}

// Generate slug from name
const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function ClassesManagement() {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [classToDelete, setClassToDelete] = useState<number | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [classDialogTab, setClassDialogTab] = useState("basic")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructor: "",
    instructorId: 1,
    level: "",
    schedule: "",
    duration: "",
    capacity: "",
    price: "",
  })

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/classes')
        if (!response.ok) {
          throw new Error('Failed to fetch classes')
        }
        const classesData: ClassData[] = await response.json()
        setClasses(classesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        toast({
          title: "Error",
          description: "Failed to load classes. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  const filteredClasses = classes.filter(
    (classItem) =>
      (selectedStatus === "all" || classItem.status === selectedStatus) &&
      (classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.instructor.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        toast({
          title: "Image uploaded",
          description: "Class image has been uploaded successfully.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateClass = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "Class name is required",
          variant: "destructive",
        })
        return
      }

      if (!formData.instructor.trim()) {
        toast({
          title: "Error",
          description: "Instructor is required",
          variant: "destructive",
        })
        return
      }


      const classData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        instructor: formData.instructor.trim(),
        instructorId: parseInt(formData.instructorId.toString()),
        schedule: formData.schedule?.trim() || null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        enrolled: 0,
        price: formData.price ? parseFloat(formData.price) : null,
        status: "active",
        level: formData.level?.trim() || null,
        image: uploadedImage || null,
      }

      console.log("Sending class data:", classData)

      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        throw new Error(errorData.error || 'Failed to create class')
      }

      const newClass = await response.json()
      setClasses([newClass, ...classes])
      setIsAddDialogOpen(false)
      resetForm()
      toast({
        title: "Class created",
        description: "New dance class has been created successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create class",
        variant: "destructive",
      })
    }
  }

  const handleEditClass = async () => {
    if (!selectedClass) return

    try {
      const classData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        instructor: formData.instructor.trim(),
        instructorId: parseInt(formData.instructorId.toString()),
        schedule: formData.schedule?.trim() || null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        price: formData.price ? parseFloat(formData.price) : null,
        status: selectedClass.status,
        level: formData.level?.trim() || null,
        image: uploadedImage || selectedClass.image,
      }

      console.log("Updating class with data:", classData)

      const response = await fetch(`/api/classes/${selectedClass.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        throw new Error(errorData.error || 'Failed to update class')
      }

      const updatedClass = await response.json()
      setClasses(classes.map((cls) => (cls.id === selectedClass.id ? updatedClass : cls)))
      setIsEditDialogOpen(false)
      setSelectedClass(null)
      resetForm()
      toast({
        title: "Class updated",
        description: "Dance class has been updated successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update class",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClass = async () => {
    if (!classToDelete) return

    try {
      const response = await fetch(`/api/classes/${classToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete class')
      }

      setClasses(classes.filter((cls) => cls.id !== classToDelete))
      setDeleteDialogOpen(false)
      setClassToDelete(null)
      toast({
        title: "Class deleted",
        description: "The dance class has been deleted successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete class",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (classItem: ClassData) => {
    setSelectedClass(classItem)
    setFormData({
      name: classItem.name,
      description: classItem.description || "",
      instructor: classItem.instructor,
      instructorId: classItem.instructorId,
      level: classItem.level || "",
      schedule: classItem.schedule || "",
      duration: classItem.duration?.toString() || "",
      capacity: classItem.capacity?.toString() || "",
      price: classItem.price?.toString() || "",
    })
    setUploadedImage(classItem.image || "")
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      instructor: "",
      instructorId: 1,
      level: "",
      schedule: "",
      duration: "",
      capacity: "",
      price: "",
    })
    setUploadedImage("")
  }

  const toggleClassStatus = async (classId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update class status')
      }

      setClasses(classes.map((cls) => (cls.id === classId ? { ...cls, status: newStatus } : cls)))
      toast({
        title: "Status updated",
        description: `Class status changed to ${newStatus}.`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update class status",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "full":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Full</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "Beginner":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Beginner
          </Badge>
        )
      case "Intermediate":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Intermediate
          </Badge>
        )
      case "Advanced":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Advanced
          </Badge>
        )
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  const renderClassDialog = (isEdit: boolean = false) => (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl">{isEdit ? "Edit Dance Class" : "Create New Dance Class"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update the class details and settings."
            : "Set up a new dance class with all the necessary details and scheduling information."}
        </DialogDescription>
      </DialogHeader>

      <Tabs value={classDialogTab} onValueChange={setClassDialogTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="schedule">Schedule & Pricing</TabsTrigger>
          <TabsTrigger value="media">Media & Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-base font-medium">
                Class Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Belly Dance Fundamentals"
                className="mt-2 h-12 text-lg"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what students will learn in this class..."
                className="mt-2 min-h-[120px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instructor" className="text-base font-medium">
                  Instructor
                </Label>
                <Select
                  value={formData.instructor}
                  onValueChange={(value) => setFormData({ ...formData, instructor: value })}
                >
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maria Rodriguez">Maria Rodriguez</SelectItem>
                    <SelectItem value="Fatima Al-Zahra">Fatima Al-Zahra</SelectItem>
                    <SelectItem value="Carlos Mendez">Carlos Mendez</SelectItem>
                    <SelectItem value="Elena Petrov">Elena Petrov</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="instructorId" className="text-base font-medium">
                  Instructor ID
                </Label>
                <Input
                  id="instructorId"
                  type="number"
                  value={formData.instructorId}
                  onChange={(e) => setFormData({ ...formData, instructorId: parseInt(e.target.value) || 1 })}
                  placeholder="Enter instructor ID"
                  className="mt-2 h-12"
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="level" className="text-base font-medium">
                Skill Level
              </Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                <SelectTrigger className="mt-2 h-12">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="All Levels">All Levels</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schedule" className="text-base font-medium">
                  Schedule
                </Label>
                <Input
                  id="schedule"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="e.g., Mon, Wed 7:00 PM"
                  className="mt-2 h-12"
                />
              </div>
              <div>
                <Label htmlFor="duration" className="text-base font-medium">
                  Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="60"
                  className="mt-2 h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity" className="text-base font-medium">
                  Class Capacity
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="20"
                  className="mt-2 h-12"
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-base font-medium">
                  Monthly Price ($)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="80"
                  className="mt-2 h-12"
                />
              </div>
            </div>

          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Class Image</Label>
              <div className="mt-2">
                {uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Class"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setUploadedImage("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Upload class image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                    </div>
                    <div className="mt-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="class-image-upload"
                      />
                      <Button variant="outline" className="bg-transparent" asChild>
                        <label htmlFor="class-image-upload" className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Choose File
                        </label>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="gap-2 pt-6">
        <Button variant="outline" onClick={() => console.log("Form data:", formData)}>
          Debug Form
        </Button>
        <Button variant="outline" onClick={() => (isEdit ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false))}>
          Cancel
        </Button>
        <Button onClick={() => (isEdit ? handleEditClass() : handleCreateClass())}>
          <Save className="mr-2 h-4 w-4" />
          {isEdit ? "Update Class" : "Create Class"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Classes Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Classes Management</h1>
            <p className="text-muted-foreground mt-2">Manage your dance classes, schedules, and enrollments</p>
            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-11" onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Class
              </Button>
            </DialogTrigger>
            {renderClassDialog(false)}
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classes or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48 h-11">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-11 bg-transparent">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">All Classes</CardTitle>
                <CardDescription className="mt-1">Manage your dance class schedule and enrollment</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {filteredClasses.length} classes
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading classes...</p>
                </div>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No classes found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedStatus !== "all" 
                      ? "Try adjusting your search or filter criteria." 
                      : "Get started by creating your first dance class."}
                  </p>
                  {!searchTerm && selectedStatus === "all" && (
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Class
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-t">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-semibold">Class Details</TableHead>
                    <TableHead className="font-semibold">Instructor</TableHead>
                    <TableHead className="font-semibold">Schedule</TableHead>
                    <TableHead className="font-semibold">Enrollment</TableHead>
                    <TableHead className="font-semibold">Pricing</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((classItem) => (
                  <TableRow key={classItem.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {classItem.image ? (
                          <img
                            src={classItem.image}
                            alt={classItem.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base">{classItem.name}</h3>
                          {classItem.level && getLevelBadge(classItem.level)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {classItem.description || "No description available"}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{classItem.duration || "N/A"} minutes</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{classItem.instructor}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{classItem.schedule || "Not scheduled"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {classItem.enrolled || 0}/{classItem.capacity || 0}
                          </span>
                        </div>
                        {classItem.capacity && classItem.capacity > 0 && (
                          <Progress value={((classItem.enrolled || 0) / classItem.capacity) * 100} className="w-20 h-2" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{classItem.price || "N/A"}</span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="cursor-pointer">{getStatusBadge(classItem.status)}</div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => toggleClassStatus(classItem.id, "active")}>
                            Active
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleClassStatus(classItem.id, "inactive")}>
                            Inactive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(classItem)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Class
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            View Students
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setClassToDelete(classItem.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Class
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          {renderClassDialog(true)}
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the dance class and remove all enrolled
                students.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteClass} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
