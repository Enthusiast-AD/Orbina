"use client"

import { useEffect, useState, useCallback } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Edit3, Calendar, Clock, Trash2, Eye, FileText, Plus, Search, RefreshCw, Send, Heart } from "lucide-react"
import appwriteService from "../appwrite/config"
import { cleanDisplayContent } from '../utils/contentParser'
import toast from "react-hot-toast"

export default function Draft() {
  const navigate = useNavigate()
  const userData = useSelector((state) => state.auth.userData)
  const [drafts, setDrafts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredDrafts, setFilteredDrafts] = useState([])

  const fetchDrafts = useCallback(async () => {
    if (!userData?.$id) return

    setIsLoading(true)
    try {
      
      let allPostsData = []
      let hasMore = true
      let offset = 0
      const limit = 100
      
      while (hasMore) {
        const response = await appwriteService.getPosts([], limit, offset)
        
        if (!response || !response.documents || response.documents.length === 0) {
          hasMore = false
          break
        }
        
        allPostsData = [...allPostsData, ...response.documents]
        offset += limit
        
        if (response.documents.length < limit) {
          hasMore = false
        }
      }

      
      const userDrafts = allPostsData.filter(post => 
        post.userId === userData.$id && post.status === "inactive"
      )
      
      
      const sortedDrafts = userDrafts.sort((a, b) => 
        new Date(b.$updatedAt || b.$createdAt) - new Date(a.$updatedAt || a.$createdAt)
      )
      
      setDrafts(sortedDrafts)
    } catch (error) {
      console.error("Error fetching drafts:", error)
      toast.error("Failed to load drafts")
    } finally {
      setIsLoading(false)
    }
  }, [userData?.$id])

  useEffect(() => {
    fetchDrafts()
  }, [fetchDrafts])

  useEffect(() => {
    const filtered = drafts.filter((draft) => {
      const titleMatch = draft.title?.toLowerCase().includes(searchTerm.toLowerCase())
      const contentMatch = draft.content?.toLowerCase().includes(searchTerm.toLowerCase())
      return titleMatch || contentMatch
    })
    setFilteredDrafts(filtered)
  }, [drafts, searchTerm])

  const handleEditDraft = (draftId) => {
    navigate(`/edit-post/${draftId}`)
  }

  const handleDeleteDraft = async (draftId) => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      try {
        const post = drafts.find(d => d.$id === draftId)
        
        await appwriteService.deletePost(draftId)
        
        if (post?.featuredImage) {
          try {
            await appwriteService.deleteFile(post.featuredImage)
          } catch (imageError) {
            console.warn("Could not delete associated image:", imageError)
          }
        }
        
        setDrafts(drafts.filter((draft) => draft.$id !== draftId))
        toast.success("Draft deleted successfully")
      } catch (error) {
        console.error("Error deleting draft:", error)
        toast.error("Failed to delete draft")
      }
    }
  }

  const handlePreviewDraft = (draftId) => {
    navigate(`/post/${draftId}`)
  }

  const handlePublishDraft = async (draftId) => {
    if (window.confirm("Are you sure you want to publish this draft?")) {
      try {
        const draft = drafts.find(d => d.$id === draftId)
        if (!draft) return

        await appwriteService.updatePost(draftId, {
          title: draft.title,
          content: draft.content,
          featuredImage: draft.featuredImage,
          status: "active"
        })

        setDrafts(drafts.filter((draft) => draft.$id !== draftId))
        toast.success("Draft published successfully!")
        navigate(`/post/${draftId}`)
      } catch (error) {
        console.error("Error publishing draft:", error)
        toast.error("Failed to publish draft")
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
    
    try {
      const cleanContent = cleanDisplayContent(content)
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = cleanContent
      const plainText = tempDiv.textContent || tempDiv.innerText || ""
      
      return plainText.length > maxLength ? plainText.substring(0, maxLength) + "..." : plainText
    } catch (error) {
      return "Content preview unavailable"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your drafts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Drafts</h2>
          <p className="text-muted-foreground mt-1">
            {drafts.length} draft{drafts.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <button
          onClick={() => navigate("/add-post")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Draft
        </button>
      </div>

      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          type="text"
          placeholder="Search drafts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-background border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>

      
      {filteredDrafts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {searchTerm ? "No drafts found" : "No drafts yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Start writing your first blog post and save it as a draft"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate("/add-post")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Draft
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredDrafts.map((draft) => (
            <div
              key={draft.$id}
              className="bg-card p-6 border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-foreground truncate">{draft.title || "Untitled Draft"}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                      Draft
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-4 leading-relaxed">{truncateContent(draft.content)}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created {formatDate(draft.$createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Updated {formatDate(draft.$updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePreviewDraft(draft.$id)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditDraft(draft.$id)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePublishDraft(draft.$id)}
                    className="p-2 text-muted-foreground hover:text-green-500 hover:bg-accent transition-colors"
                    title="Publish"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDraft(draft.$id)}
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