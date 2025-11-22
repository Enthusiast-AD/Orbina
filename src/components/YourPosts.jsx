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
          <div className="animate-spin h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Posts</h2>
          <p className="text-muted-foreground mt-1">
            {posts.length} post{posts.length !== 1 ? "s" : ""} published
          </p>
        </div>
        <button
          onClick={() => navigate("/add-post")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          type="text"
          placeholder="Search your posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-background border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {searchTerm ? "No posts found" : "No posts yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Start writing your first blog post"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate("/add-post")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
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
              className="bg-card p-6 border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-foreground truncate">{post.title || "Untitled Post"}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium ${
                        post.status === "active"
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                      }`}
                    >
                      {post.status === "active" ? "Published" : "Draft"}
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-4 leading-relaxed">{truncateContent(post.content)}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditPost(post.$id)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.$id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-accent transition-colors"
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