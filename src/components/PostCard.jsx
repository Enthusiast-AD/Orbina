"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Calendar, Clock, ArrowRight, Eye } from "lucide-react"
import appwriteService from "../appwrite/config"
import profileService from "../appwrite/profile"

function PostCard({ $id, title, featuredImage, content, userName, userId, $createdAt, status = "active" }) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [authorProfile, setAuthorProfile] = useState(null)
  const [authorImageError, setAuthorImageError] = useState(false)

  // Fetch author profile data
  useEffect(() => {
    const fetchAuthorProfile = async () => {
      if (userId) {
        try {
          const profile = await profileService.getProfile(userId)
          if (profile) {
            setAuthorProfile(profile)
          }
        } catch (error) {
          console.error("Error fetching author profile:", error)
        }
      }
    }

    fetchAuthorProfile()
  }, [userId])

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

  // Get author display name (prioritize profile userName over post userName)
  const getAuthorName = () => {
    return authorProfile?.userName || userName || "Anonymous"
  }

  // Get author initials for fallback avatar
  const getAuthorInitials = (name) => {
    if (!name || name === "Anonymous") return "A"
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle author click - prevent event bubbling to post link
  const handleAuthorClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
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
              <Link
                to={`/profile/${userId}`}
                onClick={handleAuthorClick}
                className="relative group/avatar"
                title={`View ${getAuthorName()}'s profile`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent group-hover/avatar:border-purple-400 transition-colors duration-200">
                  {!authorImageError && authorProfile?.profileImage ? (
                    <img
                      src={
                        profileService.getFileView
                          ? profileService.getFileView(authorProfile.profileImage)
                          : profileService.getProfileImageView?.(authorProfile.profileImage) || "/placeholder.svg"
                      }
                      alt={`${getAuthorName()}'s profile`}
                      className="w-full h-full object-cover"
                      onError={() => setAuthorImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">{getAuthorInitials(getAuthorName())}</span>
                    </div>
                  )}
                </div>

                {/* Hover indicator */}
                <div className="absolute inset-0 rounded-full bg-purple-500/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200" />
              </Link>

              {/* Author Info */}
              <div>
                <Link
                  to={`/profile/${userId}`}
                  onClick={handleAuthorClick}
                  className="text-sm font-medium text-white hover:text-purple-300 transition-colors duration-200 cursor-pointer"
                  title={`View ${getAuthorName()}'s profile`}
                >
                  {getAuthorName()}
                </Link>
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

        {/* Author Profile Preview Tooltip */}
        {authorProfile && (
          <div className="absolute bottom-full left-6 mb-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  {!authorImageError && authorProfile.profileImage ? (
                    <img
                      src={
                        profileService.getFileView
                          ? profileService.getFileView(authorProfile.profileImage)
                          : profileService.getProfileImageView?.(authorProfile.profileImage) || "/placeholder.svg"
                      }
                      alt={`${getAuthorName()}'s profile`}
                      className="w-full h-full object-cover"
                      onError={() => setAuthorImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{getAuthorInitials(getAuthorName())}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{getAuthorName()}</h4>
                  {authorProfile.location && <p className="text-slate-400 text-sm">{authorProfile.location}</p>}
                </div>
              </div>
              {authorProfile.bio && <p className="text-slate-300 text-sm line-clamp-2">{authorProfile.bio}</p>}
              <div className="mt-2 text-xs text-purple-400">Click to view profile →</div>
            </div>
          </div>
        )}

        {/* Hover Effect Border */}
        {/* <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" /> */}
      </article>
    </Link>
  )
}

export default PostCard
