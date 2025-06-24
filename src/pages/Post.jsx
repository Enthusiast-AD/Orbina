"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Share2,
  Bookmark,
  Heart,
  Eye,
  ChevronUp,
  MapPin,
  ExternalLink,
} from "lucide-react"
import appwriteService from "../appwrite/config"
import profileService from "../appwrite/profile"
import likesService from "../appwrite/likes"
import bookmarksService from "../appwrite/bookmarks"
import { Button, Container } from "../components"
import parse from "html-react-parser"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"

export default function Post() {
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [authorProfile, setAuthorProfile] = useState(null)
  const [authorImageError, setAuthorImageError] = useState(false)

  const { slug } = useParams()
  const navigate = useNavigate()
  const userData = useSelector((state) => state.auth.userData)

  const isAuthor = post && userData ? post.userId === userData.$id : false

  useEffect(() => {
    if (slug) {
      fetchPost()
    } else {
      navigate("/")
    }
  }, [slug])

  useEffect(() => {
    if (post && userData) {
      fetchLikeBookmarkData()
    }
  }, [post, userData])

  const fetchPost = async () => {
    try {
      const postData = await appwriteService.getPost(slug)
      if (postData) {
        setPost(postData)
        if (postData.userId) {
          fetchAuthorProfile(postData.userId)
        }
      } else {
        navigate("/")
      }
    } catch (error) {
      navigate("/")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLikeBookmarkData = async () => {
    try {
      const [likeData, bookmarkData, likeCountData] = await Promise.all([
        likesService.getLike({ postId: post.$id, userId: userData.$id }),
        bookmarksService.getBookmark({ postId: post.$id, userId: userData.$id }),
        likesService.getLikesCount(post.$id)
      ])
      
      setIsLiked(!!likeData)
      setIsBookmarked(!!bookmarkData)
      setLikeCount(likeCountData)
    } catch (error) {
      console.error("Error fetching like/bookmark data:", error)
    }
  }

  const fetchAuthorProfile = async (userId) => {
    try {
      const profile = await profileService.getProfile(userId)
      if (profile) {
        setAuthorProfile(profile)
      }
    } catch (error) {
      console.error("Error fetching author profile:", error)
    }
  }

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setReadingProgress(progress)
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLike = async () => {
    if (!userData) {
      toast.error("Please login to like posts")
      return
    }

    try {
      if (isLiked) {
        await likesService.unlikePost({ postId: post.$id, userId: userData.$id })
        setIsLiked(false)
        setLikeCount(prev => prev - 1)
      } else {
        await likesService.likePost({ postId: post.$id, userId: userData.$id })
        setIsLiked(true)
        setLikeCount(prev => prev + 1)
      }
    } catch (error) {
      toast.error("Failed to update like")
    }
  }

  const handleBookmark = async () => {
    if (!userData) {
      toast.error("Please login to bookmark posts")
      return
    }

    try {
      if (isBookmarked) {
        await bookmarksService.unbookmarkPost({ postId: post.$id, userId: userData.$id })
        setIsBookmarked(false)
        toast.success("Removed from bookmarks")
      } else {
        await bookmarksService.bookmarkPost({ postId: post.$id, userId: userData.$id })
        setIsBookmarked(true)
        toast.success("Added to bookmarks")
      }
    } catch (error) {
      toast.error("Failed to update bookmark")
    }
  }

  const deletePost = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      appwriteService.deletePost(post.$id).then((status) => {
        if (status) {
          appwriteService.deleteFile(post.featuredImage)
          navigate("/")
        }
      })
    }
  }

  const calculateReadingTime = (content) => {
    if (!content) return 1
    const wordsPerMinute = 200
    const textLength = content.replace(/<[^>]*>/g, "").split(" ").length
    const readingTime = Math.ceil(textLength / wordsPerMinute)
    return readingTime < 1 ? 1 : readingTime
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Recently"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  const getAuthorName = () => {
    return authorProfile?.userName || post?.userName || "Anonymous"
  }

  const getAuthorInitials = (name) => {
    if (!name || name === "Anonymous") return "A"
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-gray-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header */}
      <div className="sticky top-0 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 z-40">
        <Container>
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                title="Share this post"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
                title={isBookmarked ? "Remove bookmark" : "Bookmark this post"}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <article className="max-w-4xl mx-auto py-8">
          {/* Featured Image */}
          <div className="relative mb-8 rounded-2xl overflow-hidden bg-slate-800">
            {!imageError && post.featuredImage ? (
              <img
                src={appwriteService.getFileView(post.featuredImage) || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-64 md:h-96 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                <div className="text-center">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-400">No featured image</p>
                </div>
              </div>
            )}

            {/* Author Controls Overlay */}
            {isAuthor && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Link to={`/edit-post/${post.$id}`}>
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  onClick={deletePost}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          {/* Post Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              {post.title}
            </h1>

            {/* Post Meta */}
            <div className="flex flex-wrap items-center gap-6 text-slate-400 mb-6">
              <Link
                to={`/profile/${post.userId}`}
                className="flex items-center gap-3 group hover:bg-slate-800/30 p-2 rounded-lg transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-purple-400 transition-colors duration-200">
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
                      <span className="text-white font-medium">{getAuthorInitials(getAuthorName())}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold group-hover:text-purple-300 transition-colors duration-200">
                    {getAuthorName()}
                  </p>
                  <p className="text-sm text-slate-400">Author</p>
                </div>
              </Link>

              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.$createdAt)}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{calculateReadingTime(post.content)} min read</span>
              </div>
            </div>

            {/* Engagement Bar */}
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isLiked
                    ? "bg-red-500/20 text-red-400 shadow-lg shadow-red-500/10"
                    : "bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-sm font-medium">Like ({likeCount})</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </header>

          {/* Post Content */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
            <div className="prose prose-invert prose-purple max-w-none prose-headings:text-white prose-p:text-slate-200 prose-strong:text-white prose-code:text-purple-300 prose-code:bg-slate-700 prose-pre:bg-slate-800 prose-blockquote:border-purple-500 prose-blockquote:text-slate-300">
              <div className="text-slate-200 leading-relaxed text-lg">{parse(post.content)}</div>
            </div>
          </div>

          {/* Author Profile Section */}
          {authorProfile && (
            <div className="mt-12 p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">About the Author</h3>
              <div className="flex items-start gap-4">
                <Link to={`/profile/${post.userId}`} className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500/30 hover:border-purple-400 transition-colors duration-200">
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
                        <span className="text-white font-medium text-lg">{getAuthorInitials(getAuthorName())}</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1">
                  <Link
                    to={`/profile/${post.userId}`}
                    className="text-xl font-semibold text-white hover:text-purple-300 transition-colors duration-200"
                  >
                    {getAuthorName()}
                  </Link>
                  {authorProfile.location && (
                    <div className="flex items-center gap-1 text-slate-400 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{authorProfile.location}</span>
                    </div>
                  )}
                  {authorProfile.bio && <p className="text-slate-300 mt-2 leading-relaxed">{authorProfile.bio}</p>}

                  {/* Author Social Links */}
                  {(authorProfile.website ||
                    authorProfile.twitter ||
                    authorProfile.github ||
                    authorProfile.linkedin) && (
                    <div className="flex items-center gap-3 mt-4">
                      {authorProfile.website && (
                        <a
                          href={
                            authorProfile.website.startsWith("http")
                              ? authorProfile.website
                              : `https://${authorProfile.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-purple-400 transition-colors duration-200"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}

                  <Link
                    to={`/profile/${post.userId}`}
                    className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm mt-3 transition-colors duration-200 pl-1"
                  >
                    View Profile
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Post Footer */}
          <footer className="mt-12 pt-8 border-t border-slate-700/50">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Publication Info */}
              <div className="text-slate-400">
                <p className="text-sm">Published on {formatDate(post.$createdAt)}</p>
                <p className="text-xs mt-1">Last updated: {formatDate(post.$updatedAt || post.$createdAt)}</p>
              </div>

              {/* Tags/Categories */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                  Article
                </span>
                <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                  Blog
                </span>
              </div>
            </div>
          </footer>
        </article>
      </Container>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all duration-300 z-40 hover:scale-110"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}