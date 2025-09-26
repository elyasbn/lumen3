"use client"

import { useState, useEffect } from "react"
import { ArrowUp, Users, Award, Calendar, Star, Play, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"

const stats = [
  { number: "12", label: "Years in Business", icon: Calendar },
  { number: "500+", label: "Happy Students", icon: Users },
  { number: "15", label: "Classes Offered", icon: Star },
  { number: "8", label: "Certified Instructors", icon: Award },
]

const milestones = [
  {
    year: "2013",
    title: "Studio Founded",
    description:
      "Veritas Dance Studio opened its doors with a vision to create an inclusive space for dancers of all levels.",
  },
  {
    year: "2015",
    title: "First Performance",
    description: "Our students performed their first showcase, marking the beginning of our performance tradition.",
  },
  {
    year: "2017",
    title: "Expanded Classes",
    description: "Added Zumba, Yoga, and specialized fitness programs to serve our growing community.",
  },
  {
    year: "2019",
    title: "New Location",
    description: "Moved to our current spacious facility with state-of-the-art equipment and multiple studios.",
  },
  {
    year: "2021",
    title: "Online Classes",
    description: "Launched virtual classes during the pandemic, keeping our community connected through dance.",
  },
  {
    year: "2023",
    title: "Award Recognition",
    description: "Received the 'Best Dance Studio' award from the local arts community.",
  },
]

const values = [
  {
    icon: Users,
    title: "Inclusive Community",
    description: "We welcome dancers of all backgrounds, ages, and skill levels to join our supportive family.",
  },
  {
    icon: Star,
    title: "Excellence in Teaching",
    description: "Our certified instructors bring passion, expertise, and personalized attention to every class.",
  },
  {
    icon: Award,
    title: "Personal Growth",
    description: "We believe dance is a journey of self-discovery, confidence building, and artistic expression.",
  },
]

const galleryImages = [
  "/placeholder.svg?height=400&width=600",
  "/placeholder.svg?height=400&width=600",
  "/placeholder.svg?height=400&width=600",
  "/placeholder.svg?height=400&width=600",
  "/placeholder.svg?height=400&width=600",
  "/placeholder.svg?height=400&width=600",
]

export default function AboutPage() {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Veritas Dance Studio"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            Lumen
            <span className="block text-[#e5d5bc] text-4xl md:text-5xl font-light mt-2">Dance Studio</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">Where Movement Meets Passion</p>

          {/* Scroll Down Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="w-24 h-1 bg-[#949f7d] mx-auto mb-8"></div>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <p className="text-xl mb-8 text-center text-gray-600">
                Founded in 2013 with a simple yet powerful vision: to create a space where everyone can discover the
                joy, beauty, and transformative power of dance.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
                <div>
                  <p className="mb-6">
                    What started as a small studio with just three instructors has grown into a thriving community hub
                    that serves hundreds of students each month. Our journey began when our founder, a passionate dancer
                    and educator, recognized the need for a truly inclusive dance space in our community.
                  </p>
                  <p className="mb-6">
                    At Veritas, we believe that dance is not just about perfect technique or flawless performances. It's
                    about self-expression, building confidence, staying healthy, and connecting with others who share
                    your passion for movement. Whether you're taking your first dance steps or you're a seasoned
                    performer, our studio is designed to meet you exactly where you are.
                  </p>
                </div>
                <div className="relative">
                  <Image
                    src="/placeholder.svg?height=400&width=500"
                    alt="Studio founder teaching"
                    width={500}
                    height={400}
                    className="rounded-lg shadow-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 relative">
                  <Image
                    src="/placeholder.svg?height=400&width=500"
                    alt="Diverse dance community"
                    width={500}
                    height={400}
                    className="rounded-lg shadow-xl"
                  />
                </div>
                <div className="order-1 md:order-2">
                  <p className="mb-6">
                    Our expert instructors come from diverse backgrounds and bring years of professional experience to
                    every class. They're not just teachers; they're mentors, cheerleaders, and guides who are committed
                    to helping each student reach their personal goals.
                  </p>
                  <p className="mb-6">
                    From traditional belly dance and elegant ballet to high-energy Zumba and peaceful yoga, we offer a
                    comprehensive range of classes designed to challenge, inspire, and delight students of all ages and
                    abilities. Our commitment to excellence, combined with our welcoming atmosphere, has made Veritas a
                    second home for dancers throughout our community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      

      {/* Mission Statement */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Our Mission</h2>
            <blockquote className="text-2xl md:text-3xl text-gray-700 font-light leading-relaxed mb-8 italic">
              "To empower individuals through the transformative art of dance, fostering confidence, creativity, and
              community in a supportive and inclusive environment where every person can discover their unique voice
              through movement."
            </blockquote>
            <div className="w-32 h-1 bg-[#949f7d] mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      

      {/* Timeline Section */}
      

      {/* Gallery Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Studio Gallery</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Take a visual tour of our beautiful studio spaces and vibrant community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Studio gallery ${index + 1}`}
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#949f7d] to-[#949f7d]/80">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Join Our Dance Family</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Ready to start your dance journey? We'd love to welcome you to our supportive and inspiring community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#949f7d] hover:bg-gray-100 px-8 py-3">
              Book Your First Class
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#949f7d] px-8 py-3 bg-transparent"
            >
              Schedule a Tour
            </Button>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <Image
              src={selectedImage || "/placeholder.svg"}
              alt="Gallery image"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-[#949f7d] hover:bg-[#949f7d]/90 text-white p-3 rounded-full shadow-lg transition-all duration-300"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      <Footer />
    </div>
  )
}
