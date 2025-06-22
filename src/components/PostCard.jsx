"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Calendar, Clock, User, ArrowRight, Eye } from "lucide-react"
import appwriteService from "../appwrite/config"

function PostCard({ $id, title, featuredImage, content, userName, $createdAt, status = "active" }) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Extract plain text from HTML content for preview
  const getPlainTextPreview = (htmlContent, maxLength = 120) => {
    if (!htmlContent) return "No preview available..."

    // Create a temporary div to extract text content
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = htmlContent
    const plainText = tempDiv.textContent || tempDiv.innerText || ""

    return plainText.length > maxLength ? plainText.substring(0, maxLength) + "..." : plainText
  }

  // Calculate estimated reading time
  const calculateReadingTime = (content) => {
    if (!content) return 1
    const wordsPerMinute = 200
    const textLength = content.replace(/<[^>]*>/g, "").split(" ").length
    const readingTime = Math.ceil(textLength / wordsPerMinute)
    return readingTime < 1 ? 1 : readingTime
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Recently"
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Link to={`/post/${$id}`} className="block group">
      <article
        className="relative bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/20 hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Featured Image */}
        <div className="relative overflow-hidden h-48 bg-slate-700">
          {!imageError && featuredImage ? (
            <img
              src={appwriteService.getFileView(featuredImage) || "/placeholder.svg"}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-slate-600 rounded-full flex items-center justify-center">
                  <Eye className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm">No image</p>
              </div>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Status badge */}
          {status && (
            <div className="absolute top-3 left-3">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  status === "active"
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                }`}
              >
                {status === "active" ? "Published" : "Draft"}
              </span>
            </div>
          )}

          {/* Reading time */}
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-900/70 backdrop-blur-sm rounded-full text-xs text-slate-300">
              <Clock className="w-3 h-3" />
              <span>{calculateReadingTime(content)} min read</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">
            {title}
          </h3>

          {/* Content Preview */}
          <p className="text-slate-400 mb-4 line-clamp-3 leading-relaxed">{getPlainTextPreview(content)}</p>

          {/* Author and Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Author Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>

              {/* Author Info */}
              <div>
                <p className="text-sm font-medium text-white">{userName || "Anonymous"}</p>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate($createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Read More Arrow */}
            <div
              className={`flex items-center gap-1 text-purple-400 transition-all duration-300 ${
                isHovered ? "translate-x-1" : ""
              }`}
            >
              <span className="text-sm font-medium">Read</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Hover Effect Border */}
        {/* <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" /> */}
      </article>
    </Link>
  )
}

export default PostCard
