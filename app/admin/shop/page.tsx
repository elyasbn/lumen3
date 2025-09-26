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
  Package,
  DollarSign,
  Eye,
  MoreHorizontal,
  Star,
  Upload,
  X,
  Save,
  ImageIcon,
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
import { toast } from "@/hooks/use-toast"

interface ProductData {
  id: number
  name: string
  slug: string
  category?: string
  price: number
  originalPrice?: number
  stock: number
  sold?: number
  rating?: number
  reviewCount?: number
  status: string
  featured: boolean
  badge?: string
  image?: string
  images?: any
  description?: string
  features?: any
  sizes?: any
  colors?: any
  tags?: any
}


export default function ShopManagement() {
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string>("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    price: "",
    originalPrice: "",
    stock: "",
    description: "",
    badge: "",
    featured: false,
    features: "",
    sizes: "",
    colors: "",
    tags: "",
  })

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const productsData: ProductData[] = await response.json()
        setProducts(productsData)
      } catch (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === "all" || product.category === selectedCategory) &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))),
  )

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        toast({
          title: "Image uploaded",
          description: "Product image has been uploaded successfully.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateProduct = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.stock) {
        toast({
          title: "Validation Error",
          description: "Name, price, and stock are required fields.",
          variant: "destructive",
        })
        return
      }

      // Generate slug from name
      const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      const productData = {
        name: formData.name,
        slug: slug,
        category: formData.category || null,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock),
        sold: 0,
        rating: null as number | null,
        reviewCount: null as number | null,
        status: "active",
        featured: formData.featured,
        badge: formData.badge || null,
        image: uploadedImage || null,
        images: null as any,
        description: formData.description || null,
        features: formData.features ? formData.features.split(',').map(s => s.trim()) : null,
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : null,
        colors: formData.colors ? formData.colors.split(',').map(s => s.trim()) : null,
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()) : null,
      }

      console.log("Creating product with data:", productData)

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create product')
      }

      const newProduct = await response.json()
      setProducts([newProduct, ...products])
      setIsAddDialogOpen(false)
      resetForm()
      toast({
        title: "Product created",
        description: "New product has been created successfully.",
      })
    } catch (error) {
      console.error('Error creating product:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = async () => {
    if (!selectedProduct) return

    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.stock) {
        toast({
          title: "Validation Error",
          description: "Name, price, and stock are required fields.",
          variant: "destructive",
        })
        return
      }

      const productData = {
        name: formData.name,
        slug: formData.slug || selectedProduct.slug,
        category: formData.category || null,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock),
        sold: selectedProduct.sold,
        rating: selectedProduct.rating,
        reviewCount: selectedProduct.reviewCount,
        status: selectedProduct.status,
        featured: formData.featured,
        badge: formData.badge || null,
        image: uploadedImage || selectedProduct.image,
        images: selectedProduct.images,
        description: formData.description || null,
        features: formData.features ? formData.features.split(',').map(s => s.trim()) : null,
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : null,
        colors: formData.colors ? formData.colors.split(',').map(s => s.trim()) : null,
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()) : null,
      }

      console.log("Updating product with data:", productData)

      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update product')
      }

      const updatedProduct = await response.json()
      setProducts(products.map((product) => (product.id === selectedProduct.id ? updatedProduct : product)))
      setIsEditDialogOpen(false)
      setSelectedProduct(null)
      resetForm()
      toast({
        title: "Product updated",
        description: "Product has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    try {
      const response = await fetch(`/api/products/${productToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete product')
      }

      setProducts(products.filter((product) => product.id !== productToDelete))
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (product: ProductData) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      category: product.category || "",
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      stock: product.stock.toString(),
      description: product.description || "",
      badge: product.badge || "",
      featured: product.featured,
      features: product.features ? (Array.isArray(product.features) ? product.features.join(', ') : product.features) : "",
      sizes: product.sizes ? (Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes) : "",
      colors: product.colors ? (Array.isArray(product.colors) ? product.colors.join(', ') : product.colors) : "",
      tags: product.tags ? (Array.isArray(product.tags) ? product.tags.join(', ') : product.tags) : "",
    })
    setUploadedImage(product.image || "")
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      category: "",
      price: "",
      originalPrice: "",
      stock: "",
      description: "",
      badge: "",
      featured: false,
      features: "",
      sizes: "",
      colors: "",
      tags: "",
    })
    setUploadedImage("")
  }

  const toggleProductStatus = (productId: number, newStatus: ProductData["status"]) => {
    setProducts(products.map((product) => (product.id === productId ? { ...product, status: newStatus } : product)))
    toast({
      title: "Status updated",
      description: `Product status changed to ${newStatus}.`,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "low-stock":
        return <Badge variant="secondary">Low Stock</Badge>
      case "out-of-stock":
        return <Badge variant="destructive">Out of Stock</Badge>
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      Costumes: "bg-purple-50 text-purple-700 border-purple-200",
      Footwear: "bg-blue-50 text-blue-700 border-blue-200",
      Activewear: "bg-green-50 text-green-700 border-green-200",
      Dancewear: "bg-pink-50 text-pink-700 border-pink-200",
      Accessories: "bg-orange-50 text-orange-700 border-orange-200",
    }
    return (
      <Badge variant="outline" className={colors[category as keyof typeof colors] || ""}>
        {category}
      </Badge>
    )
  }

  const renderProductDialog = (isEdit: boolean = false) => (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl">{isEdit ? "Edit Product" : "Add New Product"}</DialogTitle>
        <DialogDescription>
          {isEdit ? "Update the product details." : "Add a new product to your dance studio shop."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-base font-medium">
              Product Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
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
              placeholder="product-slug"
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
              placeholder="Describe the product..."
              className="mt-2 min-h-[100px] resize-none"
            />
          </div>

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
                  <SelectItem value="Costumes">Costumes</SelectItem>
                  <SelectItem value="Footwear">Footwear</SelectItem>
                  <SelectItem value="Activewear">Activewear</SelectItem>
                  <SelectItem value="Dancewear">Dancewear</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="badge" className="text-base font-medium">
                Badge (Optional)
              </Label>
              <Input
                id="badge"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="Sale, New, etc."
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price" className="text-base font-medium">
                Price ($)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="29.99"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="originalPrice" className="text-base font-medium">
                Original Price ($)
              </Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                placeholder="39.99"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="stock" className="text-base font-medium">
                Stock Quantity
              </Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="50"
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="features" className="text-base font-medium">
                Features (comma-separated)
              </Label>
              <Input
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Feature 1, Feature 2"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="sizes" className="text-base font-medium">
                Sizes (comma-separated)
              </Label>
              <Input
                id="sizes"
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                placeholder="S, M, L, XL"
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="colors" className="text-base font-medium">
                Colors (comma-separated)
              </Label>
              <Input
                id="colors"
                value={formData.colors}
                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                placeholder="Red, Blue, Green"
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
                placeholder="dance, costume, professional"
                className="mt-2"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-base font-medium">Product Image</Label>
            <div className="mt-2">
              {uploadedImage ? (
                <div className="relative">
                  <img
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Product"
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
                    <p className="text-sm font-medium">Upload product image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                  <div className="mt-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="product-image-upload"
                    />
                    <Button variant="outline" className="bg-transparent" asChild>
                      <label htmlFor="product-image-upload" className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </label>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">Featured Product</Label>
              <p className="text-sm text-muted-foreground">Display this product prominently in the shop</p>
            </div>
            <Switch
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
            />
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 pt-6">
        <Button variant="outline" onClick={() => (isEdit ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false))}>
          Cancel
        </Button>
        <Button onClick={() => (isEdit ? handleEditProduct() : handleCreateProduct())}>
          <Save className="mr-2 h-4 w-4" />
          {isEdit ? "Update Product" : "Add Product"}
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
                <BreadcrumbPage>Shop Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shop Management</h1>
            <p className="text-muted-foreground mt-2">Manage your dance products and inventory</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-11" onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </DialogTrigger>
            {renderProductDialog(false)}
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
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
              <SelectItem value="Costumes">Costumes</SelectItem>
              <SelectItem value="Footwear">Footwear</SelectItem>
              <SelectItem value="Activewear">Activewear</SelectItem>
              <SelectItem value="Dancewear">Dancewear</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
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
                <CardTitle className="text-xl">All Products</CardTitle>
                <CardDescription className="mt-1">Manage your shop inventory and product listings</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {filteredProducts.length} products
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-t">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-semibold">Product Details</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Stock</TableHead>
                  <TableHead className="font-semibold">Sold</TableHead>
                  <TableHead className="font-semibold">Rating</TableHead>
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
                        <span className="ml-2">Loading products...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-red-600">{error}</div>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-muted-foreground">No products found</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base">{product.name}</h3>
                            {product.featured && (
                              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                Featured
                              </Badge>
                            )}
                            {product.badge && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {product.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{product.category ? getCategoryBadge(product.category) : <Badge variant="outline">Uncategorized</Badge>}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="font-semibold">${product.price.toFixed(2)}</span>
                            {product.originalPrice && (
                              <span className="text-xs text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{product.stock}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{product.sold || 0}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{product.rating ? product.rating.toFixed(1) : "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="cursor-pointer">{getStatusBadge(product.status)}</div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => toggleProductStatus(product.id, "active")}>
                              Active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleProductStatus(product.id, "inactive")}>
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Product
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setProductToDelete(product.id)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Product
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
          {renderProductDialog(true)}
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product from your inventory.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
