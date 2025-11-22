"use client"

import { useEffect, useState, useCallback } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Bookmark, Search, Calendar, Clock, Heart, ArrowRight } from "lucide-react"
import bookmarksService from "../appwrite/bookmarks"
import appwriteService from "../appwrite/config"
import likesService from "../appwrite/likes"

export default function BookmarkedPosts() {
  const navigate = useNavigate()
  const userData = useSelector((state) => state.auth.userData)
  const [bookmarkedPosts, setBookmarkedPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPosts, setFilteredPosts] = useState([])

  const fetchBookmarkedPosts = useCallback(async () => {
    if (!userData?.$id) return

    setIsLoading(true)
    try {
      
      const bookmarks = await bookmarksService.getUserBookmarks(userData.$id)
      
      
      const postsData = await Promise.all(
        bookmarks.map(async (bookmark) => {
          try {
            const post = await appwriteService.getPost(bookmark.postId)
            const likesCount = await likesService.getLikesCount(bookmark.postId)
            return { ...post, likesCount, bookmarkedAt: bookmark.$createdAt }
          } catch (error) {
            console.error("Error fetching bookmarked post:", bookmark.postId, error)
            return null
          }
        })
      )
      
      
      const validPosts = postsData.filter(Boolean).sort(
        (a, b) => new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt)
      )
      
      setBookmarkedPosts(validPosts)
    } catch (error) {
      console.error("Error fetching bookmarked posts:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userData?.$id])

  useEffect(() => {
    fetchBookmarkedPosts()
  }, [fetchBookmarkedPosts])

  useEffect(() => {
    const filtered = bookmarkedPosts.filter(
      (post) =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredPosts(filtered)
  }, [bookmarkedPosts, searchTerm])

  const handleRemoveBookmark = async (postId) => {
    if (window.confirm("Remove this post from bookmarks?")) {
      try {
        await bookmarksService.unbookmarkPost({ postId, userId: userData.$id })
        setBookmarkedPosts(bookmarkedPosts.filter((post) => post.$id !== postId))
      } catch (error) {
        console.error("Error removing bookmark:", error)
      }
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
    const plainText = content.replace(/<[^>]*>/g, "")
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + "..." : plainText
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your bookmarks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bookmarked Posts</h2>
          <p className="text-muted-foreground mt-1">
            {bookmarkedPosts.length} post{bookmarkedPosts.length !== 1 ? "s" : ""} bookmarked
          </p>
        </div>
      </div>

     
      {bookmarkedPosts.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search bookmarked posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      )}

      
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {searchTerm ? "No bookmarks found" : bookmarkedPosts.length === 0 ? "No bookmarks yet" : "No results"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Start bookmarking posts you want to read later"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.$id}
              className="bg-card p-6 border border-border hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 
                      className="text-xl font-semibold text-foreground truncate hover:text-primary cursor-pointer transition-colors"
                      onClick={() => navigate(`/post/${post.$id}`)}
                    >
                      {post.title || "Untitled Post"}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      Bookmarked
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-4 leading-relaxed">{truncateContent(post.content)}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Published {formatDate(post.$createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Bookmarked {formatDate(post.bookmarkedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likesCount || 0} likes</span>
                    </div>
                    <span className="text-muted-foreground/70">by {post.userName || "Anonymous"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/post/${post.$id}`)}
                    className="flex items-center gap-1 px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                    title="Read Post"
                  >
                    <span className="text-sm">Read</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveBookmark(post.$id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-accent transition-colors"
                    title="Remove Bookmark"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
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