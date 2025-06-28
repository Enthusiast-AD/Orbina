"use client"

import { useNavigate } from "react-router-dom"
import { Home, ArrowLeft, Search, BookOpen } from "lucide-react"

export default function NotFound() {
  const navigate = useNavigate()

  const quickLinks = [
    {
      name: "Home",
      path: "/",
      icon: Home,
      description: "Go back to the homepage",
    },
    {
      name: "All Posts",
      path: "/all-posts",
      icon: BookOpen,
      description: "Browse all blog posts",
    },
    {
      name: "Search",
      path: "/search",
      icon: Search,
      description: "Search for content",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        
        <div className="relative mb-8">
          <div className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text animate-pulse">
            404
          </div>
          <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-purple-500/20 animate-ping">404</div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Page Not Found</h1>
          <p className="text-lg text-slate-400 mb-2">
            Oops! The page you're looking for seems to have wandered off into the digital void.
          </p>
          <p className="text-slate-500">Don't worry, even the best explorers sometimes take a wrong turn.</p>
        </div>

   
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

       

        <div className="mt-8 p-4 bg-purple-600/10 border border-purple-500/20 rounded-lg">
          <p className="text-purple-300 text-sm">
            💡 <strong>Fun Fact:</strong> The first 404 error was discovered at CERN in 1992. You're now part of
            internet history!
          </p>
        </div>

        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      </div>
    </div>
  )
}
