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
  Calendar,
  MapPin,
  Users,
  Clock,
  MoreHorizontal,
  Eye,
  Save,
  X,
  Upload,
  ImageIcon,
  DollarSign,
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
import { toast } from "@/hooks/use-toast"

interface EventData {
  id: number
  title: string
  slug: string
  date: string
  time?: string
  endTime?: string
  location?: string
  address?: string
  type?: string
  capacity?: number
  registered?: number
  price?: number
  status: string
  featured: boolean
  description?: string
  image?: string
  instructors?: any
  tags?: any
}


export default function EventsManagement() {
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
  const [eventToDelete, setEventToDelete] = useState<number | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string>("")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    date: "",
    time: "",
    endTime: "",
    location: "",
    address: "",
    type: "",
    capacity: "",
    price: "",
    description: "",
    featured: false,
    instructors: "",
    tags: "",
  })

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/events')
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        const eventsData: EventData[] = await response.json()
        setEvents(eventsData)
      } catch (error) {
        console.error('Error fetching events:', error)
        setError('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const filteredEvents = events.filter(
    (event) =>
      (selectedStatus === "all" || event.status === selectedStatus) &&
      (event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.type && event.type.toLowerCase().includes(searchTerm.toLowerCase()))),
  )

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        toast({
          title: "Image uploaded",
          description: "Event image has been uploaded successfully.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateEvent = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.date) {
        toast({
          title: "Validation Error",
          description: "Title and date are required fields.",
          variant: "destructive",
        })
        return
      }

      // Generate slug from title
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      const eventData = {
        title: formData.title,
        slug: slug,
        date: formData.date,
        time: formData.time || null,
        endTime: formData.endTime || null,
        location: formData.location || null,
        address: formData.address || null,
        type: formData.type || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        registered: 0,
        price: formData.price ? parseFloat(formData.price) : null,
        status: "upcoming",
        featured: formData.featured,
        description: formData.description || null,
        image: uploadedImage || null,
        instructors: formData.instructors ? formData.instructors.split(',').map(s => s.trim()) : null,
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()) : null,
      }

      console.log("Creating event with data:", eventData)

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create event')
      }

      const newEvent = await response.json()
      setEvents([newEvent, ...events])
      setIsAddDialogOpen(false)
      resetForm()
      toast({
        title: "Event created",
        description: "New event has been created successfully.",
      })
    } catch (error) {
      console.error('Error creating event:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      })
    }
  }

  const handleEditEvent = async () => {
    if (!selectedEvent) return

    try {
      // Validate required fields
      if (!formData.title || !formData.date) {
        toast({
          title: "Validation Error",
          description: "Title and date are required fields.",
          variant: "destructive",
        })
        return
      }

      const eventData = {
        title: formData.title,
        slug: formData.slug || selectedEvent.slug,
        date: formData.date,
        time: formData.time || null,
        endTime: formData.endTime || null,
        location: formData.location || null,
        address: formData.address || null,
        type: formData.type || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        price: formData.price ? parseFloat(formData.price) : null,
        status: selectedEvent.status,
        featured: formData.featured,
        description: formData.description || null,
        image: uploadedImage || selectedEvent.image,
        instructors: formData.instructors ? formData.instructors.split(',').map(s => s.trim()) : null,
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()) : null,
      }

      console.log("Updating event with data:", eventData)

      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update event')
      }

      const updatedEvent = await response.json()
      setEvents(events.map((event) => (event.id === selectedEvent.id ? updatedEvent : event)))
      setIsEditDialogOpen(false)
      setSelectedEvent(null)
      resetForm()
      toast({
        title: "Event updated",
        description: "Event has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating event:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update event",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return

    try {
      const response = await fetch(`/api/events/${eventToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete event')
      }

      setEvents(events.filter((event) => event.id !== eventToDelete))
      setDeleteDialogOpen(false)
      setEventToDelete(null)
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting event:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (event: EventData) => {
    setSelectedEvent(event)
    setFormData({
      title: event.title,
      slug: event.slug,
      date: event.date,
      time: event.time || "",
      endTime: event.endTime || "",
      location: event.location || "",
      address: event.address || "",
      type: event.type || "",
      capacity: event.capacity?.toString() || "",
      price: event.price?.toString() || "",
      description: event.description || "",
      featured: event.featured,
      instructors: event.instructors ? (Array.isArray(event.instructors) ? event.instructors.join(', ') : event.instructors) : "",
      tags: event.tags ? (Array.isArray(event.tags) ? event.tags.join(', ') : event.tags) : "",
    })
    setUploadedImage(event.image || "")
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      date: "",
      time: "",
      endTime: "",
      location: "",
      address: "",
      type: "",
      capacity: "",
      price: "",
      description: "",
      featured: false,
      instructors: "",
      tags: "",
    })
    setUploadedImage("")
  }

  const toggleEventStatus = (eventId: number, newStatus: EventData["status"]) => {
    setEvents(events.map((event) => (event.id === eventId ? { ...event, status: newStatus } : event)))
    toast({
      title: "Status updated",
      description: `Event status changed to ${newStatus}.`,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Upcoming</Badge>
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      Performance: "bg-purple-50 text-purple-700 border-purple-200",
      Workshop: "bg-blue-50 text-blue-700 border-blue-200",
      Social: "bg-green-50 text-green-700 border-green-200",
      Competition: "bg-red-50 text-red-700 border-red-200",
      "Master Class": "bg-orange-50 text-orange-700 border-orange-200",
    }
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || ""}>
        {type}
      </Badge>
    )
  }

  const renderEventDialog = (isEdit: boolean = false) => (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl">{isEdit ? "Edit Event" : "Create New Event"}</DialogTitle>
        <DialogDescription>
          {isEdit ? "Update the event details." : "Create a new event, workshop, or performance."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-base font-medium">
              Event Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title"
              className="mt-2 h-12 text-lg"
            />
          </div>

          <div>
            <Label htmlFor="slug" className="text-base font-medium">
              Slug (URL-friendly name)
            </Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="event-slug"
              className="mt-2"
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
              placeholder="Describe the event..."
              className="mt-2 min-h-[100px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-base font-medium">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="time" className="text-base font-medium">
                Start Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="endTime" className="text-base font-medium">
              End Time (Optional)
            </Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="text-base font-medium">
                Location
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main Studio">Main Studio</SelectItem>
                  <SelectItem value="Studio A">Studio A</SelectItem>
                  <SelectItem value="Studio B">Studio B</SelectItem>
                  <SelectItem value="Studio C">Studio C</SelectItem>
                  <SelectItem value="Outdoor Space">Outdoor Space</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type" className="text-base font-medium">
                Event Type
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Performance">Performance</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Competition">Competition</SelectItem>
                  <SelectItem value="Master Class">Master Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="text-base font-medium">
              Address (Optional)
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City, State"
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacity" className="text-base font-medium">
                Capacity
              </Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="50"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="price" className="text-base font-medium">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="25.00"
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instructors" className="text-base font-medium">
                Instructors (comma-separated)
              </Label>
              <Input
                id="instructors"
                value={formData.instructors}
                onChange={(e) => setFormData({ ...formData, instructors: e.target.value })}
                placeholder="John Doe, Jane Smith"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="tags" className="text-base font-medium">
                Tags (comma-separated)
              </Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="dance, workshop, beginner"
                className="mt-2"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-base font-medium">Event Image</Label>
            <div className="mt-2">
              {uploadedImage ? (
                <div className="relative">
                  <img
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Event"
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
                    <p className="text-sm font-medium">Upload event image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                  <div className="mt-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="event-image-upload"
                    />
                    <Button variant="outline" className="bg-transparent" asChild>
                      <label htmlFor="event-image-upload" className="cursor-pointer">
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
      </div>

      <DialogFooter className="gap-2 pt-6">
        <Button variant="outline" onClick={() => (isEdit ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false))}>
          Cancel
        </Button>
        <Button onClick={() => (isEdit ? handleEditEvent() : handleCreateEvent())}>
          <Save className="mr-2 h-4 w-4" />
          {isEdit ? "Update Event" : "Create Event"}
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
                <BreadcrumbPage>Events Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events Management</h1>
            <p className="text-muted-foreground mt-2">Manage workshops, performances, and special events</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-11" onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Event
              </Button>
            </DialogTrigger>
            {renderEventDialog(false)}
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
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
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
                <CardTitle className="text-xl">All Events</CardTitle>
                <CardDescription className="mt-1">Manage all your studio events and activities</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {filteredEvents.length} events
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-t">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-semibold">Event Details</TableHead>
                  <TableHead className="font-semibold">Date & Time</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Registration</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading events...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-red-600">{error}</div>
                    </TableCell>
                  </TableRow>
                ) : filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-muted-foreground">No events found</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {event.image ? (
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-base">{event.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{event.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          {event.time && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{event.time}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{event.location || "TBD"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{event.type ? getTypeBadge(event.type) : <Badge variant="outline">TBD</Badge>}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {event.registered || 0}/{event.capacity || "∞"}
                            </span>
                          </div>
                          {event.capacity && (
                            <Progress value={((event.registered || 0) / event.capacity) * 100} className="w-20 h-2" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {event.price ? `$${event.price.toFixed(2)}` : "Free"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="cursor-pointer">{getStatusBadge(event.status)}</div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => toggleEventStatus(event.id, "upcoming")}>
                              Upcoming
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleEventStatus(event.id, "completed")}>
                              Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleEventStatus(event.id, "cancelled")}>
                              Cancelled
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(event)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Event
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              View Registrations
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setEventToDelete(event.id)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          {renderEventDialog(true)}
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the event and all registration data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteEvent} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
