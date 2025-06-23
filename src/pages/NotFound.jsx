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
        {/* 404 Animation */}
        <div className="relative mb-8">
          <div className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text animate-pulse">
            404
          </div>
          <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-purple-500/20 animate-ping">404</div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Page Not Found</h1>
          <p className="text-lg text-slate-400 mb-2">
            Oops! The page you're looking for seems to have wandered off into the digital void.
          </p>
          <p className="text-slate-500">Don't worry, even the best explorers sometimes take a wrong turn.</p>
        </div>

        {/* Action Buttons */}
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

        {/* Quick Links */}
        {/* <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <button
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  className="group p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-slate-600/30 hover:border-purple-500/50 transition-all duration-200 hover:scale-105"
                >
                  <Icon className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:text-purple-300 transition-colors" />
                  <h3 className="text-white font-medium mb-1">{link.name}</h3>
                  <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                    {link.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div> */}

        {/* Fun Fact */}
        <div className="mt-8 p-4 bg-purple-600/10 border border-purple-500/20 rounded-lg">
          <p className="text-purple-300 text-sm">
            💡 <strong>Fun Fact:</strong> The first 404 error was discovered at CERN in 1992. You're now part of
            internet history!
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      </div>
    </div>
  )
}
