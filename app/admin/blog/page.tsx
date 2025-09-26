"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Eye,
  Calendar,
  MoreHorizontal,
  FileText,
  Upload,
  ImageIcon,
  Bold,
  Italic,
  Link2,
  List,
  AlignLeft,
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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  author: string
  authorId: number
  publishedAt: string
  updatedAt: string
  status: string
  category: string | null
  tags: string[] | null
  readTime: string | null
  views: number
  featured: boolean
  image: string | null
  seo: any
}

// Generate slug from title
const generateSlug = (title: string) => {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function BlogManagement() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [postToDelete, setPostToDelete] = useState<number | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [postDialogTab, setPostDialogTab] = useState("content")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    author: "",
    authorId: 1,
    featured: false,
    tags: "",
    publishDate: "",
  })

  // Fetch blog posts from API
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/blog')
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts')
        }
        const posts: BlogPost[] = await response.json()
        setBlogPosts(posts)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        toast({
          title: "Error",
          description: "Failed to load blog posts. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  const filteredPosts = blogPosts.filter(
    (post) =>
      (selectedCategory === "all" || post.category === selectedCategory) &&
      (post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase()))),
  )

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        toast({
          title: "Image uploaded",
          description: "Your image has been uploaded successfully.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreatePost = async (status: "draft" | "published") => {
    try {
      console.log("Creating post with status:", status)
      console.log("Current form data:", formData)
      
      // Validate required fields
      if (!formData.title.trim()) {
        toast({
          title: "Error",
          description: "Title is required",
          variant: "destructive",
        })
        return
      }

      if (!formData.author.trim()) {
        toast({
          title: "Error",
          description: "Author is required",
          variant: "destructive",
        })
        return
      }

      if (!formData.authorId || formData.authorId <= 0) {
        toast({
          title: "Error",
          description: "Author ID must be a positive number",
          variant: "destructive",
        })
        return
      }

      const postData = {
        title: formData.title.trim(),
        slug: generateSlug(formData.title),
        excerpt: formData.excerpt?.trim() || null,
        content: formData.content?.trim() || null,
        author: formData.author.trim(),
        authorId: parseInt(formData.authorId.toString()),
        publishedAt: formData.publishDate ? new Date(formData.publishDate) : new Date(),
        status: status,
        category: formData.category?.trim() || null,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()).filter(tag => tag.length > 0) : null,
        readTime: formData.content ? `${Math.ceil(formData.content.split(" ").length / 200)} min read` : null,
        featured: formData.featured,
        image: uploadedImage || null,
        seo: null as any
      }

      console.log("Sending blog post data:", postData)
      console.log("Form data before processing:", formData)
      
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        throw new Error(errorData.error || errorData.details || 'Failed to create blog post')
      }

      const newPost = await response.json()
      setBlogPosts([newPost, ...blogPosts])
      setIsAddDialogOpen(false)
      resetForm()
      toast({
        title: status === "published" ? "Post published" : "Draft saved",
        description: `Your blog post has been ${status === "published" ? "published" : "saved as draft"} successfully.`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create blog post",
        variant: "destructive",
      })
    }
  }

  const handleEditPost = async () => {
    if (!selectedPost) return

    try {
      const postData = {
        title: formData.title,
        slug: generateSlug(formData.title),
        excerpt: formData.excerpt || null,
        content: formData.content || null,
        author: formData.author,
        authorId: formData.authorId,
        publishedAt: formData.publishDate || selectedPost.publishedAt,
        status: selectedPost.status,
        category: formData.category || null,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : null,
        readTime: formData.content ? `${Math.ceil(formData.content.split(" ").length / 200)} min read` : null,
        featured: formData.featured,
        image: uploadedImage || selectedPost.image,
        seo: selectedPost.seo
      }

      const response = await fetch(`/api/blog/${selectedPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update blog post')
      }

      const updatedPost = await response.json()
      setBlogPosts(blogPosts.map((post) => (post.id === selectedPost.id ? updatedPost : post)))
      setIsEditDialogOpen(false)
      setSelectedPost(null)
      resetForm()
      toast({
        title: "Post updated",
        description: "Your blog post has been updated successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update blog post",
        variant: "destructive",
      })
    }
  }

  const handleDeletePost = async () => {
    if (!postToDelete) return

    try {
      const response = await fetch(`/api/blog/${postToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete blog post')
      }

      setBlogPosts(blogPosts.filter((post) => post.id !== postToDelete))
      setDeleteDialogOpen(false)
      setPostToDelete(null)
      toast({
        title: "Post deleted",
        description: "The blog post has been deleted successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete blog post",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (post: BlogPost) => {
    setSelectedPost(post)
    setFormData({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content || "",
      category: post.category || "",
      author: post.author,
      authorId: post.authorId,
      featured: post.featured,
      tags: post.tags ? post.tags.join(", ") : "",
      publishDate: post.publishedAt.split('T')[0],
    })
    setUploadedImage(post.image || "")
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      author: "",
      authorId: 1,
      featured: false,
      tags: "",
      publishDate: new Date().toISOString().split('T')[0], // Default to today
    })
    setUploadedImage("")
  }

  const togglePostStatus = async (postId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/blog/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update post status')
      }

      setBlogPosts(blogPosts.map((post) => (post.id === postId ? { ...post, status: newStatus } : post)))
      toast({
        title: "Status updated",
        description: `Post status changed to ${newStatus}.`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update post status",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>
      case "archived":
        return <Badge variant="outline">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      "Health & Wellness": "bg-emerald-50 text-emerald-700 border-emerald-200",
      Culture: "bg-purple-50 text-purple-700 border-purple-200",
      "Beginner Guide": "bg-blue-50 text-blue-700 border-blue-200",
      Technique: "bg-orange-50 text-orange-700 border-orange-200",
      Fitness: "bg-red-50 text-red-700 border-red-200",
    }
    return (
      <Badge variant="outline" className={colors[category as keyof typeof colors] || ""}>
        {category}
      </Badge>
    )
  }

  const renderPostDialog = (isEdit: boolean = false) => (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl">{isEdit ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update your blog post content and settings."
            : "Create engaging content for your dance studio blog with our professional editor."}
        </DialogDescription>
      </DialogHeader>

      <Tabs value={postDialogTab} onValueChange={setPostDialogTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media & SEO</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-base font-medium">
                Post Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter an engaging title for your post"
                className="mt-2 h-12 text-lg"
              />
            </div>

            <div>
              <Label htmlFor="excerpt" className="text-base font-medium">
                Excerpt
              </Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Write a compelling excerpt that will appear in previews..."
                className="mt-2 min-h-[80px] resize-none"
              />
            </div>

            <div>
              <Label className="text-base font-medium">Content Editor</Label>
              <div className="mt-2 border rounded-lg">
                <div className="flex items-center gap-1 p-3 border-b bg-muted/30">
                  <Button variant="ghost" size="sm">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6 mx-1" />
                  <Button variant="ghost" size="sm">
                    <Link2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6 mx-1" />
                  <Button variant="ghost" size="sm">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Start writing your blog post content here. Use the toolbar above to format your text..."
                  className="min-h-[300px] border-0 resize-none focus-visible:ring-0 text-base leading-relaxed"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Featured Image</Label>
              <div className="mt-2">
                {uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Featured"
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
                      <p className="text-sm font-medium">Upload featured image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <div className="mt-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button variant="outline" className="bg-transparent" asChild>
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Choose File
                        </label>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>


            <div>
              <Label htmlFor="tags" className="text-base font-medium">
                Tags
              </Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Enter tags separated by commas (e.g., dance, health, beginner)"
                className="mt-2"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-base font-medium">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                    <SelectItem value="Culture">Culture</SelectItem>
                    <SelectItem value="Beginner Guide">Beginner Guide</SelectItem>
                    <SelectItem value="Technique">Technique</SelectItem>
                    <SelectItem value="Fitness">Fitness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            <div>
              <Label htmlFor="author" className="text-base font-medium">
                Author
              </Label>
              <Select value={formData.author} onValueChange={(value) => setFormData({ ...formData, author: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select author" />
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
              <Label htmlFor="authorId" className="text-base font-medium">
                Author ID
              </Label>
              <Input
                id="authorId"
                type="number"
                value={formData.authorId}
                onChange={(e) => setFormData({ ...formData, authorId: parseInt(e.target.value) || 1 })}
                placeholder="Enter author ID"
                className="mt-2"
                min="1"
              />
            </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label className="text-base font-medium">Featured Post</Label>
                <p className="text-sm text-muted-foreground">Display this post prominently on the homepage</p>
              </div>
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
            </div>


            <div>
              <Label htmlFor="publish-date" className="text-base font-medium">
                Publish Date
              </Label>
              <Input
                id="publish-date"
                type="date"
                value={formData.publishDate}
                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="gap-2 pt-6">
        <Button variant="outline" onClick={() => console.log("Form data:", formData)}>
          Debug Form
        </Button>
        <Button variant="outline" onClick={() => (isEdit ? handleEditPost() : handleCreatePost("draft"))}>
          <Save className="mr-2 h-4 w-4" />
          Save as Draft
        </Button>
        <Button onClick={() => (isEdit ? handleEditPost() : handleCreatePost("published"))}>
          {isEdit ? "Update Post" : "Publish Post"}
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
                <BreadcrumbPage>Blog Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
            <p className="text-muted-foreground mt-2">Create, edit, and manage your blog posts and articles</p>
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
                Create New Post
              </Button>
            </DialogTrigger>
            {renderPostDialog(false)}
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts, authors, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 h-11">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
              <SelectItem value="Culture">Culture</SelectItem>
              <SelectItem value="Beginner Guide">Beginner Guide</SelectItem>
              <SelectItem value="Technique">Technique</SelectItem>
              <SelectItem value="Fitness">Fitness</SelectItem>
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
                <CardTitle className="text-xl">All Blog Posts</CardTitle>
                <CardDescription className="mt-1">Manage and organize your blog content</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {filteredPosts.length} posts
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading blog posts...</p>
                </div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No blog posts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedCategory !== "all" 
                      ? "Try adjusting your search or filter criteria." 
                      : "Get started by creating your first blog post."}
                  </p>
                  {!searchTerm && selectedCategory === "all" && (
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Post
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-t">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-semibold">Post Details</TableHead>
                    <TableHead className="font-semibold">Author</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Performance</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                  <TableRow key={post.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {post.image ? (
                          <img
                            src={post.image}
                            alt={post.title}
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
                          <h3 className="font-semibold text-base leading-tight">{post.title}</h3>
                          {post.featured && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{post.excerpt || "No excerpt available"}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>{post.readTime || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder-user.jpg" />
                          <AvatarFallback className="text-xs">
                            {post.author
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{post.author}</span>
                      </div>
                    </TableCell>
                    <TableCell>{post.category ? getCategoryBadge(post.category) : <Badge variant="outline">No Category</Badge>}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{post.views.toLocaleString()}</span>
                          <span className="text-muted-foreground">views</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="cursor-pointer">{getStatusBadge(post.status)}</div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => togglePostStatus(post.id, "published")}>
                            Published
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePostStatus(post.id, "draft")}>Draft</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePostStatus(post.id, "archived")}>
                            Archived
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
                            Preview Post
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(post)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Post
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setPostToDelete(post.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Post
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
          {renderPostDialog(true)}
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the blog post.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePost} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
