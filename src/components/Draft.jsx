"use client"

import { useEffect, useState, useCallback } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Edit3, Calendar, Clock, Trash2, Eye, FileText, Plus, Search } from "lucide-react"
import appwriteService from "../appwrite/config" // Updated import path

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
      // Get all posts by user and filter for drafts (inactive status)
      const allPosts = await appwriteService.getPosts()
      const userDrafts =
        allPosts.documents?.filter((post) => post.userId === userData.$id && post.status === "inactive") || []
      setDrafts(userDrafts)
    } catch (error) {
      console.error("Error fetching drafts:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userData?.$id])

  useEffect(() => {
    fetchDrafts()
  }, [fetchDrafts])

  useEffect(() => {
    const filtered = drafts.filter(
      (draft) =>
        draft.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        draft.content?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredDrafts(filtered)
  }, [drafts, searchTerm])

  const handleEditDraft = (draftId) => {
    navigate(`/edit-post/${draftId}`)
  }

  const handleDeleteDraft = async (draftId) => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      try {
        await appwriteService.deletePost(draftId) // Updated service call
        setDrafts(drafts.filter((draft) => draft.$id !== draftId))
      } catch (error) {
        console.error("Error deleting draft:", error)
      }
    }
  }

  const handlePreviewDraft = (draftId) => {
    navigate(`/post/${draftId}`) // Updated navigation path
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your drafts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Drafts</h2>
          <p className="text-slate-400 mt-1">
            {drafts.length} draft{drafts.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <button
          onClick={() => navigate("/add-post")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Draft
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search drafts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Drafts List */}
      {filteredDrafts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">
            {searchTerm ? "No drafts found" : "No drafts yet"}
          </h3>
          <p className="text-slate-400 mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Start writing your first blog post and save it as a draft"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate("/add-post")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
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
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-white mb-2 truncate">{draft.title || "Untitled Draft"}</h3>

                  <p className="text-slate-300 mb-4 leading-relaxed">{truncateContent(draft.content)}</p>

                  <div className="flex items-center gap-4 text-sm text-slate-400">
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
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditDraft(draft.$id)}
                    className="p-2 text-slate-400 hover:text-purple-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDraft(draft.$id)}
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
