"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Mail,
  Phone,
  MoreHorizontal,
  Star,
  Users,
  Upload,
  X,
  Save,
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
import { toast } from "@/hooks/use-toast"

interface CoachData {
  id: number
  name: string
  email: string
  phone: string | null
  specialties: string[] | null
  experience: string | null
  rating: number | null
  students: number | null
  status: string
  avatar: string | null
  bio: string | null
  certifications: string[] | null
  joinedAt: string
  socialMedia: any
}

// Generate slug from name
const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function CoachesManagement() {
  const [coaches, setCoaches] = useState<CoachData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCoach, setSelectedCoach] = useState<CoachData | null>(null)
  const [coachToDelete, setCoachToDelete] = useState<number | null>(null)
  const [uploadedAvatar, setUploadedAvatar] = useState<string>("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialties: "",
    experience: "",
    bio: "",
    certifications: "",
    instagram: "",
    facebook: "",
    youtube: "",
  })

  // Fetch coaches from API
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/coaches')
        if (!response.ok) {
          throw new Error('Failed to fetch coaches')
        }
        const coachesData: CoachData[] = await response.json()
        setCoaches(coachesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        toast({
          title: "Error",
          description: "Failed to load coaches. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCoaches()
  }, [])

  const filteredCoaches = coaches.filter(
    (coach) =>
      (selectedStatus === "all" || coach.status === selectedStatus) &&
      (coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (coach.specialties && coach.specialties.some((specialty) => specialty.toLowerCase().includes(searchTerm.toLowerCase())))),
  )

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedAvatar(e.target?.result as string)
        toast({
          title: "Avatar uploaded",
          description: "Coach avatar has been uploaded successfully.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateCoach = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "Name is required",
          variant: "destructive",
        })
        return
      }

      if (!formData.email.trim()) {
        toast({
          title: "Error",
          description: "Email is required",
          variant: "destructive",
        })
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        })
        return
      }

      const coachData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        specialties: formData.specialties ? formData.specialties.split(",").map((s) => s.trim()).filter(s => s.length > 0) : null,
        experience: formData.experience?.trim() || null,
        rating: null as any,
        students: null as any,
        status: "active",
        avatar: uploadedAvatar || null,
        bio: formData.bio?.trim() || null,
        certifications: formData.certifications ? formData.certifications.split(",").map((c) => c.trim()).filter(c => c.length > 0) : null,
        joinedAt: new Date().toISOString(),
        socialMedia: {
          instagram: formData.instagram?.trim() || null,
          facebook: formData.facebook?.trim() || null,
          youtube: formData.youtube?.trim() || null,
        },
      }

      console.log("Sending coach data:", coachData)

      const response = await fetch('/api/coaches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coachData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        throw new Error(errorData.error || 'Failed to create coach')
      }

      const newCoach = await response.json()
      setCoaches([newCoach, ...coaches])
      setIsAddDialogOpen(false)
      resetForm()
      toast({
        title: "Coach added",
        description: "New coach has been added successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create coach",
        variant: "destructive",
      })
    }
  }

  const handleEditCoach = async () => {
    if (!selectedCoach) return

    try {
      const coachData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        specialties: formData.specialties ? formData.specialties.split(",").map((s) => s.trim()).filter(s => s.length > 0) : null,
        experience: formData.experience?.trim() || null,
        rating: selectedCoach.rating,
        students: selectedCoach.students,
        status: selectedCoach.status,
        avatar: uploadedAvatar || selectedCoach.avatar,
        bio: formData.bio?.trim() || null,
        certifications: formData.certifications ? formData.certifications.split(",").map((c) => c.trim()).filter(c => c.length > 0) : null,
        joinedAt: selectedCoach.joinedAt,
        socialMedia: {
          instagram: formData.instagram?.trim() || null,
          facebook: formData.facebook?.trim() || null,
          youtube: formData.youtube?.trim() || null,
        },
      }

      console.log("Updating coach with data:", coachData)

      const response = await fetch(`/api/coaches/${selectedCoach.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coachData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        throw new Error(errorData.error || 'Failed to update coach')
      }

      const updatedCoach = await response.json()
      setCoaches(coaches.map((coach) => (coach.id === selectedCoach.id ? updatedCoach : coach)))
      setIsEditDialogOpen(false)
      setSelectedCoach(null)
      resetForm()
      toast({
        title: "Coach updated",
        description: "Coach profile has been updated successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update coach",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCoach = async () => {
    if (!coachToDelete) return

    try {
      const response = await fetch(`/api/coaches/${coachToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete coach')
      }

      setCoaches(coaches.filter((coach) => coach.id !== coachToDelete))
      setDeleteDialogOpen(false)
      setCoachToDelete(null)
      toast({
        title: "Coach removed",
        description: "The coach has been removed successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete coach",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (coach: CoachData) => {
    setSelectedCoach(coach)
    setFormData({
      name: coach.name,
      email: coach.email,
      phone: coach.phone || "",
      specialties: coach.specialties ? coach.specialties.join(", ") : "",
      experience: coach.experience || "",
      bio: coach.bio || "",
      certifications: coach.certifications ? coach.certifications.join(", ") : "",
      instagram: coach.socialMedia?.instagram || "",
      facebook: coach.socialMedia?.facebook || "",
      youtube: coach.socialMedia?.youtube || "",
    })
    setUploadedAvatar(coach.avatar || "")
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialties: "",
      experience: "",
      bio: "",
      certifications: "",
      instagram: "",
      facebook: "",
      youtube: "",
    })
    setUploadedAvatar("")
  }

  const toggleCoachStatus = async (coachId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/coaches/${coachId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update coach status')
      }

      setCoaches(coaches.map((coach) => (coach.id === coachId ? { ...coach, status: newStatus } : coach)))
      toast({
        title: "Status updated",
        description: `Coach status changed to ${newStatus}.`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update coach status",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "on-leave":
        return <Badge variant="outline">On Leave</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const CoachDialog = ({ isEdit = false }: { isEdit?: boolean }) => (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl">{isEdit ? "Edit Coach Profile" : "Add New Coach"}</DialogTitle>
        <DialogDescription>
          {isEdit ? "Update the coach's profile information." : "Add a new dance instructor to your team."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={uploadedAvatar || "/placeholder-user.jpg"} />
              <AvatarFallback className="text-lg">
                {formData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("") || "CN"}
              </AvatarFallback>
            </Avatar>
            {uploadedAvatar && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={() => setUploadedAvatar("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div>
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" id="avatar-upload" />
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </label>
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-base font-medium">
              Full Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-base font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-base font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialties" className="text-base font-medium">
                Specialties
              </Label>
              <Input
                id="specialties"
                value={formData.specialties}
                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                placeholder="Belly Dance, Salsa, etc."
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="experience" className="text-base font-medium">
                Experience
              </Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="5 years"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio" className="text-base font-medium">
              Biography
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Brief biography and teaching philosophy..."
              className="mt-2 min-h-[100px] resize-none"
            />
          </div>

          <div>
            <Label htmlFor="certifications" className="text-base font-medium">
              Certifications
            </Label>
            <Input
              id="certifications"
              value={formData.certifications}
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
              placeholder="Certification 1, Certification 2, etc."
              className="mt-2"
            />
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Social Media (Optional)</Label>
            <div className="grid grid-cols-1 gap-3">
              <Input
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="Instagram handle"
              />
              <Input
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="Facebook profile"
              />
              <Input
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                placeholder="YouTube channel"
              />
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 pt-6">
        <Button variant="outline" onClick={() => console.log("Form data:", formData)}>
          Debug Form
        </Button>
        <Button variant="outline" onClick={() => (isEdit ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false))}>
          Cancel
        </Button>
        <Button onClick={() => (isEdit ? handleEditCoach() : handleCreateCoach())}>
          <Save className="mr-2 h-4 w-4" />
          {isEdit ? "Update Coach" : "Add Coach"}
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
                <BreadcrumbPage>Coaches Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Coaches Management</h1>
            <p className="text-muted-foreground mt-2">Manage your dance instructors and their profiles</p>
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
                Add New Coach
              </Button>
            </DialogTrigger>
            <CoachDialog />
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coaches or specialties..."
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
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on-leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-11 bg-transparent">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading coaches...</p>
            </div>
          </div>
        ) : filteredCoaches.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No coaches found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedStatus !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "Get started by adding your first dance instructor."}
              </p>
              {!searchTerm && selectedStatus === "all" && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Coach
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCoaches.map((coach) => (
            <Card key={coach.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={coach.avatar || "/placeholder.svg"} alt={coach.name} />
                      <AvatarFallback>
                        {coach.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{coach.name}</CardTitle>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{coach.rating || "N/A"}</span>
                        <span className="text-sm text-muted-foreground">({coach.students || 0} students)</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openEditDialog(coach)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        View Classes
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setCoachToDelete(coach.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{coach.email}</span>
                  </div>
                  {coach.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{coach.phone}</span>
                    </div>
                  )}
                </div>

                {coach.specialties && coach.specialties.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-1">
                      {coach.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {coach.experience && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium">{coach.experience}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="cursor-pointer">{getStatusBadge(coach.status)}</div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => toggleCoachStatus(coach.id, "active")}>Active</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleCoachStatus(coach.id, "inactive")}>
                        Inactive
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleCoachStatus(coach.id, "on-leave")}>
                        On Leave
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{coach.students || 0} students</span>
                  </div>
                </div>

                {coach.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{coach.bio}</p>
                )}
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <CoachDialog isEdit={true} />
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove the coach from your team.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCoach} className="bg-red-600 hover:bg-red-700">
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
