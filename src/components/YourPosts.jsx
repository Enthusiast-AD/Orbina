"use client"

import { useEffect, useState, useCallback } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Edit3, Calendar, Clock, Trash2, Eye, FileText, Plus, Search, Heart } from "lucide-react"
import appwriteService from "../appwrite/config"
import likesService from "../appwrite/likes"

export default function YourPosts() {
  const navigate = useNavigate()
  const userData = useSelector((state) => state.auth.userData)
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPosts, setFilteredPosts] = useState([])
  const [postsWithLikes, setPostsWithLikes] = useState([])

  const fetchPosts = useCallback(async () => {
    if (!userData?.$id) return

    setIsLoading(true)
    try {
      const allPosts = await appwriteService.getPosts()
      const userPosts = allPosts.documents?.filter((post) => post.userId === userData.$id) || []
      setPosts(userPosts)
      
      // Fetch likes for each post
      const postsWithLikeData = await Promise.all(
        userPosts.map(async (post) => {
          try {
            const likesCount = await likesService.getLikesCount(post.$id)
            return { ...post, likesCount }
          } catch (error) {
            console.error("Error fetching likes for post:", post.$id, error)
            return { ...post, likesCount: 0 }
          }
        })
      )
      setPostsWithLikes(postsWithLikeData)
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
    const filtered = postsWithLikes.filter(
      (post) =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredPosts(filtered)
  }, [postsWithLikes, searchTerm])

  const handleEditPost = (postId) => {
    navigate(`/edit-post/${postId}`)
  }

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await appwriteService.deletePost(postId)
        setPosts(posts.filter((post) => post.$id !== postId))
        setPostsWithLikes(postsWithLikes.filter((post) => post.$id !== postId))
      } catch (error) {
        console.error("Error deleting post:", error)
      }
    }
  }

  const handlePreviewPost = (postId) => {
    navigate(`/post/${postId}`)
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
    const plainText = content.replace(/<[^>]*>/g, "")
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + "..." : plainText
  }

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Posts</h2>
          <p className="text-slate-400 mt-1">
            {posts.length} post{posts.length !== 1 ? "s" : ""} published
          </p>
        </div>
        <button
          onClick={() => navigate("/add-post")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search your posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">
            {searchTerm ? "No posts found" : "No posts yet"}
          </h3>
          <p className="text-slate-400 mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Start writing your first blog post"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate("/add-post")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Post
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
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-white truncate">{post.title || "Untitled Post"}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        post.status === "active"
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      }`}
                    >
                      {post.status === "active" ? "Published" : "Draft"}
                    </span>
                  </div>

                  <p className="text-slate-300 mb-4 leading-relaxed">{truncateContent(post.content)}</p>

                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created {formatDate(post.$createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Updated {formatDate(post.$updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likesCount || 0} likes</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePreviewPost(post.$id)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
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