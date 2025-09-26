"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  GraduationCap,
  DollarSign,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
  Plus,
  UserPlus,
  CalendarPlus,
  Package,
  ArrowUpRight,
  Activity,
} from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface DashboardStats {
  overview: {
    totalStudents: number
    activeClasses: number
    monthlyRevenue: number
    totalBlogPosts: number
    growthMetrics: {
      studentsGrowth: number
      classesGrowth: number
      revenueGrowth: number
      postsGrowth: number
    }
  }
  todaySchedule: Array<{
    id: number
    className: string
    time: string
    instructor: string
    enrolled: number
    capacity: number
    status: string
  }>
  recentActivity: Array<{
    id: number
    type: string
    message: string
    timestamp: string
    icon: string
  }>
  quickStats: {
    pendingEnrollments: number
    lowStockProducts: number
    upcomingEvents: number
    draftPosts: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch("/data/dashboard-stats.json")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          // Fallback data
          setStats({
            overview: {
              totalStudents: 245,
              activeClasses: 12,
              monthlyRevenue: 18500,
              totalBlogPosts: 28,
              growthMetrics: {
                studentsGrowth: 12,
                classesGrowth: 8,
                revenueGrowth: 15,
                postsGrowth: 25,
              },
            },
            todaySchedule: [
              {
                id: 1,
                className: "Belly Dance Fundamentals",
                time: "10:00 AM",
                instructor: "Maria Rodriguez",
                enrolled: 18,
                capacity: 20,
                status: "upcoming",
              },
              {
                id: 2,
                className: "Advanced Salsa",
                time: "2:00 PM",
                instructor: "Carlos Mendez",
                enrolled: 16,
                capacity: 16,
                status: "full",
              },
            ],
            recentActivity: [
              {
                id: 1,
                type: "enrollment",
                message: "New student enrolled in Belly Dance Fundamentals",
                timestamp: "2024-01-15T10:30:00Z",
                icon: "user-plus",
              },
              {
                id: 2,
                type: "blog",
                message: "New blog post published: Health Benefits of Dance",
                timestamp: "2024-01-15T09:15:00Z",
                icon: "file-text",
              },
            ],
            quickStats: {
              pendingEnrollments: 8,
              lowStockProducts: 3,
              upcomingEvents: 5,
              draftPosts: 2,
            },
          })
        }
      } catch (error) {
        console.error("Error loading dashboard stats:", error)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case "user-plus":
        return <UserPlus className="h-4 w-4" />
      case "calendar-plus":
        return <CalendarPlus className="h-4 w-4" />
      case "file-text":
        return <FileText className="h-4 w-4" />
      case "calendar":
        return <Calendar className="h-4 w-4" />
      case "package":
        return <Package className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#949f7d]"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error Loading Dashboard</h2>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening at Lumen Studio today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/classes">
                <Plus className="mr-2 h-4 w-4" />
                Quick Actions
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/blog">
                <FileText className="mr-2 h-4 w-4" />
                New Post
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.overview.totalStudents}</div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">+{stats.overview.growthMetrics.studentsGrowth}%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Classes</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.overview.activeClasses}</div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">+{stats.overview.growthMetrics.classesGrowth}%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(stats.overview.monthlyRevenue)}</div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">+{stats.overview.growthMetrics.revenueGrowth}%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Blog Posts</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.overview.totalBlogPosts}</div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">+{stats.overview.growthMetrics.postsGrowth}%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Today's Schedule */}
          <Card className="col-span-4 border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Today's Schedule</CardTitle>
                  <CardDescription className="mt-1">Classes scheduled for today</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/classes">
                    View All
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.todaySchedule.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-semibold text-base">{classItem.className}</div>
                          <div className="text-sm text-muted-foreground">{classItem.instructor}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {classItem.enrolled}/{classItem.capacity} students
                        </div>
                        <Progress value={(classItem.enrolled / classItem.capacity) * 100} className="w-24 h-2 mt-1" />
                      </div>
                      <div className="text-lg font-semibold text-muted-foreground">{classItem.time}</div>
                      <Badge variant={classItem.status === "full" ? "secondary" : "default"}>{classItem.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="col-span-3 border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                  <CardDescription className="mt-1">Latest updates from your studio</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      {getActivityIcon(activity.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-relaxed">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Enrollments</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quickStats.pendingEnrollments}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
              <Button variant="outline" size="sm" className="mt-3 w-full bg-transparent" asChild>
                <Link href="/admin/classes">Review Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Products</CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <Package className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quickStats.lowStockProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">Need restocking</p>
              <Button variant="outline" size="sm" className="mt-3 w-full bg-transparent" asChild>
                <Link href="/admin/shop">Manage Inventory</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quickStats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
              <Button variant="outline" size="sm" className="mt-3 w-full bg-transparent" asChild>
                <Link href="/admin/events">View Events</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Draft Posts</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quickStats.draftPosts}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready to publish</p>
              <Button variant="outline" size="sm" className="mt-3 w-full bg-transparent" asChild>
                <Link href="/admin/blog">Publish Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
