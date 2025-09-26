import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Calendar,
  FileText,
  ShoppingBag,
  BarChart3,
  Shield,
  Zap,
  Globe,
} from "lucide-react"
import Link from "next/link"

export default function AdminAccess() {
  const features = [
    {
      icon: LayoutDashboard,
      title: "Dashboard Overview",
      description: "Real-time analytics and studio performance metrics",
    },
    {
      icon: GraduationCap,
      title: "Classes Management",
      description: "Schedule, manage, and track all dance classes",
    },
    {
      icon: Users,
      title: "Coaches Management",
      description: "Manage instructor profiles and assignments",
    },
    {
      icon: Calendar,
      title: "Events & Workshops",
      description: "Create and manage special events and workshops",
    },
    {
      icon: FileText,
      title: "Blog Management",
      description: "Create and publish blog posts and articles",
    },
    {
      icon: ShoppingBag,
      title: "Shop Management",
      description: "Manage products, inventory, and orders",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Detailed insights and performance reports",
    },
    {
      icon: Shield,
      title: "Secure Access",
      description: "Role-based permissions and secure authentication",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#949f7d] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#949f7d]">Lumen Studio</h1>
                <p className="text-sm text-gray-600">Admin Dashboard</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline">
                <Globe className="mr-2 h-4 w-4" />
                Back to Website
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Zap className="mr-1 h-3 w-3" />
              Admin Portal
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome to Your
              <span className="text-[#949f7d] block">Studio Dashboard</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Manage your dance studio with powerful tools designed to streamline operations, engage students, and grow
              your business.
            </p>
            <Link href="/admin">
              <Button size="lg" className="bg-[#949f7d] hover:bg-[#949f7d]/90 text-white px-8 py-4 text-lg">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Access Dashboard
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#949f7d]/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-[#949f7d]" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Studio Overview</CardTitle>
              <CardDescription>Current studio statistics and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#949f7d] mb-1">2,847</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#949f7d] mb-1">24</div>
                  <div className="text-sm text-gray-600">Active Classes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#949f7d] mb-1">$45K</div>
                  <div className="text-sm text-gray-600">Monthly Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#949f7d] mb-1">127</div>
                  <div className="text-sm text-gray-600">Blog Posts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-[#949f7d] to-[#e5d5bc] rounded-2xl p-8 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Manage Your Studio?</h2>
            <p className="text-lg mb-6 opacity-90">
              Access your comprehensive dashboard and take control of your dance studio operations.
            </p>
            <Link href="/admin">
              <Button size="lg" variant="secondary" className="bg-white text-[#949f7d] hover:bg-gray-100">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Enter Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025  Lumen Dance Studio. All rights reserved.</p>
            <p className="text-sm mt-2">Secure admin portal for authorized personnel only.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
