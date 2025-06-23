"use client"

import { useEffect, useState, useCallback } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  Edit3,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  BookOpen,
} from "lucide-react"
import appwriteService from "../appwrite/config" // Updated import path

export default function YourPosts() {
  const navigate = useNavigate()
  const userData = useSelector((state) => state.auth.userData)
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPosts, setFilteredPosts] = useState([])
  const [sortBy, setSortBy] = useState("newest") // newest, oldest, popular

  const fetchPosts = useCallback(async () => {
    if (!userData?.$id) return

    setIsLoading(true)
    try {
      // Get all posts by user and filter for published posts (active status)
      const allPosts = await appwriteService.getPosts()
      const userPosts =
        allPosts.documents?.filter((post) => post.userId === userData.$id && post.status === "active") || []
      setPosts(userPosts)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userData?.$id])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    const filtered = posts.filter(
      (post) =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.$createdAt) - new Date(b.$createdAt)
        case "popular":
          return (b.likes || 0) - (a.likes || 0)
        case "newest":
        default:
          return new Date(b.$createdAt) - new Date(a.$createdAt)
      }
    })

    setFilteredPosts(filtered)
  }, [posts, searchTerm, sortBy])

  const handleEditPost = (postId) => {
    navigate(`/edit-post/${postId}`)
  }

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await appwriteService.deletePost(postId) // Updated to use appwriteService
        setPosts(posts.filter((post) => post.$id !== postId))
      } catch (error) {
        console.error("Error deleting post:", error)
      }
    }
  }

  const handleViewPost = (postId) => {
    // Updated to use postId
    navigate(`/post/${postId}`)
  }

  const handleSharePost = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content?.substring(0, 100) + "...",
          url: `${window.location.origin}/post/${post.slug}`,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.slug}`)
      alert("Link copied to clipboard!")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return ""
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content
  }

  const getTotalStats = () => {
    // Updated to remove mock stats calculation
    return {
      views: 0, // You can implement view tracking later
      likes: 0, // You can implement like tracking later
      comments: 0, // You can implement comment tracking later
    }
  }

  const stats = getTotalStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-300" />
            <div>
              <div className="text-2xl font-bold text-white">{posts.length}</div>
              <div className="text-purple-300 text-sm">Published Posts</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-300" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.views}</div>
              <div className="text-blue-300 text-sm">Total Views</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-green-300" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.likes}</div>
              <div className="text-green-300 text-sm">Total Likes</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-orange-300" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.comments}</div>
              <div className="text-orange-300 text-sm">Total Comments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search your posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-10 pr-8 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">
            {searchTerm ? "No posts found" : "No published posts yet"}
          </h3>
          <p className="text-slate-400 mb-6">
            {searchTerm ? "Try adjusting your search terms" : "Start writing and publishing your first blog post"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate("/add-post")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Write Your First Post
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.$id}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              {post.featuredImage && ( // Added featured image display
                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={appwriteService.getFileView(post.featuredImage) || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none"
                    }}
                  />
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-white mb-2 truncate">{post.title}</h3>

                  <p className="text-slate-300 mb-4 leading-relaxed">{truncateContent(post.content)}</p>

                  <div className="flex items-center gap-6 text-sm text-slate-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Published {formatDate(post.$createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.views || 0} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes || 0} likes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments || 0} comments</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewPost(post.$id)} // Updated to use post.$id
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                    title="View Post"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSharePost(post)}
                    className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditPost(post.$id)}
                    className="p-2 text-slate-400 hover:text-purple-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.$id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
