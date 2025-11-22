"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { cleanDisplayContent } from '../utils/contentParser'
import { useViewTracking } from '../hooks/useViewTracking';
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
  User,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  CheckCircle,
  Globe,
  Github,
  ImageIcon,
} from "lucide-react"
import appwriteService from "../appwrite/config"
import profileService from "../appwrite/profile"
import likesService from "../appwrite/likes"
import bookmarksService from "../appwrite/bookmarks"
import { Button, Container } from "../components"
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
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [estimatedReadTime, setEstimatedReadTime] = useState(0)
  const [viewsCount, setViewsCount] = useState(0);

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

  useViewTracking(slug, userData?.$id, post);

  const fetchPost = async () => {
    try {
      const postData = await appwriteService.getPost(slug)
      if (postData) {
        setPost(postData)
        setViewsCount(postData.views || 0) // Add this line
        setEstimatedReadTime(calculateReadingTime(postData.content))
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


  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = Math.min((scrollTop / documentHeight) * 100, 100)
      setReadingProgress(progress)
      setShowScrollTop(scrollTop > 600)
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
        toast.success("Like removed")
      } else {
        await likesService.likePost({ postId: post.$id, userId: userData.$id })
        setIsLiked(true)
        setLikeCount(prev => prev + 1)
        toast.success("Post liked!")
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
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      appwriteService.deletePost(post.$id).then((status) => {
        if (status) {
          if (post.featuredImage) {
            appwriteService.deleteFile(post.featuredImage)
          }
          toast.success("Post deleted successfully")
          navigate("/")
        }
      })
    }
  }

  const calculateReadingTime = (content) => {
    if (!content) return 1
    const wordsPerMinute = 200
    const textLength = content.replace(/<[^>]*>/g, "").split(" ").filter(word => word.length > 0).length
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

  const handleShare = async (platform = null) => {
    const url = window.location.href
    const title = post.title
    const text = `Check out this article: ${title}`

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error("Failed to copy link")
      }
      return
    }

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    }

    if (platform && shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    } else if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    }
    setShowShareMenu(false)
  }

  const getAuthorName = () => {
    return authorProfile?.userName || post?.userName || "Anonymous Author"
  }

  const getAuthorInitials = (name) => {
    if (!name || name === "Anonymous Author") return "A"
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getSocialIcon = (platform) => {
    const icons = {
      website: Globe,
      twitter: Twitter,
      github: Github,
      linkedIn: Linkedin,
    }
    return icons[platform] || Globe
  }

  const formatSocialLink = (platform, value) => {
    if (!value) return null
    const baseUrls = {
      website: value.startsWith("http") ? value : `https://${value}`,
      twitter: `https://twitter.com/${value.replace("@", "")}`,
      github: `https://github.com/${value}`,
      linkedIn: `https://linkedin.com/in/${value}`,
    }
    return baseUrls[platform] || value
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="min-h-screen">

      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>


      <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border z-40">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-accent text-foreground rounded-none transition-all duration-200 hover:translate-x-[-2px]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>


              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${readingProgress}%` }}
                  />
                </div>
                <span>{Math.round(readingProgress)}%</span>
              </div>
            </div>

            <div className="flex items-center gap-3">

              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 bg-card hover:bg-accent text-muted-foreground hover:text-foreground rounded-none transition-all duration-200"
                  title="Share this post"
                >
                  <Share2 className="w-4 h-4" />
                </button>


                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-none shadow-xl z-50">
                    <div className="p-2">
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-muted-foreground hover:text-foreground hover:bg-accent rounded-none transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-muted-foreground hover:text-foreground hover:bg-accent rounded-none transition-colors"
                      >
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-muted-foreground hover:text-foreground hover:bg-accent rounded-none transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </button>
                      <hr className="my-2 border-border" />
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-muted-foreground hover:text-foreground hover:bg-accent rounded-none transition-colors"
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleBookmark}
                className={`p-2 rounded-none transition-all duration-200 ${isBookmarked
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card hover:bg-accent text-muted-foreground hover:text-foreground"
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

          <div className="relative mb-12">

            <div className="relative mb-8 rounded-none overflow-hidden">
              {!imageError && post.featuredImage ? (
                <div className="aspect-[1.91/1] bg-muted rounded-none overflow-hidden relative">
                  <img
                    src={appwriteService.getFileView(post.featuredImage)}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                    onError={() => setImageError(true)}
                  />


                  {isAuthor && (
                    <div className="absolute top-6 right-6 flex gap-3 z-20">
                      <Link to={`/edit-post/${post.$id}`}>
                        <Button className="bg-green-600/90 hover:bg-green-600 backdrop-blur-sm text-white px-4 py-2 rounded-none flex items-center gap-2 transition-all duration-200 hover:translate-y-[-2px]">
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        onClick={deletePost}
                        className="bg-destructive/90 hover:bg-destructive backdrop-blur-sm text-destructive-foreground px-4 py-2 rounded-none flex items-center gap-2 transition-all duration-200 hover:translate-y-[-2px]"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[1.91/1] bg-muted rounded-none overflow-hidden flex items-center justify-center relative">
                  <div className="text-center">
                    <ImageIcon className="w-20 h-20 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-lg">No featured image</p>
                  </div>


                  {isAuthor && (
                    <div className="absolute top-6 right-6 flex gap-3 z-20">
                      <Link to={`/edit-post/${post.$id}`}>
                        <Button className="bg-green-600/90 hover:bg-green-600 backdrop-blur-sm text-white px-4 py-2 rounded-none flex items-center gap-2 transition-all duration-200 hover:translate-y-[-2px]">
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        onClick={deletePost}
                        className="bg-destructive/90 hover:bg-destructive backdrop-blur-sm text-destructive-foreground px-4 py-2 rounded-none flex items-center gap-2 transition-all duration-200 hover:translate-y-[-2px]"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>


            <header className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                {post.title}
              </h1>


              <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{formatDate(post.$createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span>{estimatedReadTime} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-500" />
                  <span>{formatNumber(viewsCount)} views</span>
                </div>
              </div>


              <Link
                to={`/profile/${post.userId}`}
                className="inline-flex items-center gap-4 p-4 bg-card backdrop-blur-sm rounded-none border border-border hover:border-primary transition-all duration-300 hover:translate-y-[-2px] group"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors duration-200">
                  {!authorImageError && authorProfile?.profileImage ? (
                    <img
                      src={profileService.getProfileImageView(authorProfile.profileImage)}
                      alt={`${getAuthorName()}'s profile`}
                      className="w-full h-full object-cover"
                      onError={() => setAuthorImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-medium text-lg">{getAuthorInitials(getAuthorName())}</span>
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-foreground font-semibold text-lg group-hover:text-primary transition-colors duration-200">
                    {getAuthorName()}
                  </p>
                  <p className="text-muted-foreground text-sm">Article Author</p>
                  {authorProfile?.location && (
                    <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{authorProfile.location}</span>
                    </div>
                  )}
                </div>
              </Link>
            </header>


            <div className="flex items-center justify-center gap-4 p-6 bg-card rounded-none border border-border mb-8">
              <button
                onClick={handleLike}
                className={`flex items-center gap-3 px-6 py-3 rounded-none font-medium transition-all duration-200 hover:translate-y-[-2px] ${isLiked
                  ? "bg-red-500/10 text-red-500 border border-red-500/30"
                  : "bg-card hover:bg-accent text-muted-foreground hover:text-foreground border border-border"
                  }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
              </button>

              <button
                onClick={handleBookmark}
                className={`flex items-center gap-3 px-6 py-3 rounded-none font-medium transition-all duration-200 hover:translate-y-[-2px] ${isBookmarked
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-card hover:bg-accent text-muted-foreground hover:text-foreground border border-border"
                  }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>

              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-3 px-6 py-3 bg-card hover:bg-accent text-muted-foreground hover:text-foreground rounded-none font-medium transition-all duration-200 hover:translate-y-[-2px] border border-border"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>


          <div className="relative">
            <div className="bg-card backdrop-blur-sm rounded-none p-8 md:p-12 border border-border shadow-sm">
              <div className="prose dark:prose-invert prose-lg md:prose-xl max-w-3xl mx-auto 
             prose-headings:text-foreground prose-headings:font-bold prose-headings:leading-tight
             prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
             prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-7 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
             prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-6
             prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
             prose-strong:text-foreground prose-strong:font-semibold
             prose-em:text-muted-foreground prose-em:italic
             prose-code:text-primary prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
             prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-none prose-pre:p-4
             prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:rounded-r-none prose-blockquote:text-muted-foreground prose-blockquote:italic
             prose-ul:text-foreground prose-ol:text-foreground
             prose-li:mb-2 prose-li:leading-relaxed
             prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80 prose-a:font-medium">
                <div
                  className="article-content leading-loose break-words"
                  dangerouslySetInnerHTML={{ __html: cleanDisplayContent(post.content) }}
                />
              </div>
            </div>
          </div>


          {authorProfile && (
            <div className="mt-16 p-8 bg-card backdrop-blur-sm rounded-none border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-primary" />
                About the Author
              </h3>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <Link to={`/profile/${post.userId}`} className="flex-shrink-0 group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-border group-hover:border-primary transition-all duration-300 group-hover:scale-105">
                    {!authorImageError && authorProfile.profileImage ? (
                      <img
                        src={profileService.getProfileImageView(authorProfile.profileImage)}
                        alt={`${getAuthorName()}'s profile`}
                        className="w-full h-full object-cover"
                        onError={() => setAuthorImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-medium text-xl">{getAuthorInitials(getAuthorName())}</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1">
                  <Link
                    to={`/profile/${post.userId}`}
                    className="text-2xl font-bold text-foreground hover:text-primary transition-colors duration-200 block mb-2"
                  >
                    {getAuthorName()}
                  </Link>

                  {authorProfile.location && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{authorProfile.location}</span>
                    </div>
                  )}

                  {authorProfile.bio && (
                    <p className="text-muted-foreground leading-relaxed mb-4 text-lg">{authorProfile.bio}</p>
                  )}


                  <div className="flex flex-wrap gap-3">
                    {["website", "twitter", "github", "linkedIn"].map((platform) => {
                      const value = authorProfile[platform]
                      const Icon = getSocialIcon(platform)
                      const link = formatSocialLink(platform, value)

                      if (!value) return null

                      return (
                        <a
                          key={platform}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-accent text-muted-foreground hover:text-foreground rounded-none transition-all duration-200 hover:translate-y-[-2px] border border-border"
                        >
                          <Icon className="w-4 h-4" />
                          <span className="capitalize text-sm font-medium">
                            {platform === "linkedIn" ? "LinkedIn" : platform}
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )
                    })}

                    <Link
                      to={`/profile/${post.userId}`}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary/80 rounded-none transition-all duration-200 hover:translate-y-[-2px] border border-primary/30"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">View Profile</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}


          <footer className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

              <div className="text-muted-foreground">
                <p className="text-sm mb-1">
                  <span className="font-medium">Published:</span> {formatDate(post.$createdAt)}
                </p>
                <p className="text-xs">
                  <span className="font-medium">Last updated:</span> {formatDate(post.$updatedAt || post.$createdAt)}
                </p>
              </div>


              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-none text-sm border border-primary/30 font-medium">
                  Article
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-none text-sm border border-blue-500/30 font-medium">
                  Blog
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-none text-sm border border-green-500/30 font-medium">
                  {estimatedReadTime} min read
                </span>
              </div>
            </div>
          </footer>
        </article>
      </Container>


      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-none shadow-lg transition-all duration-300 z-40 hover:translate-y-[-2px] group"
          title="Scroll to top"
        >
          <ChevronUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-200" />
        </button>
      )}


      {showShareMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowShareMenu(false)}
        />
      )}


      <style jsx global>{`
        .article-content {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.7;
          color: hsl(var(--foreground));
        }
        
        .article-content p {
          margin: 1.25rem 0 !important;
          line-height: 1.7 !important;
          color: hsl(var(--foreground)) !important;
          font-size: 1.125rem !important;
          font-weight: 400 !important;
        }
        
        .article-content h1 {
          font-size: 2.5rem !important;
          font-weight: 800 !important;
          color: hsl(var(--foreground)) !important;
          margin: 2rem 0 1.5rem 0 !important;
          line-height: 1.2 !important;
          letter-spacing: -0.025em !important;
        }
        
        .article-content h2 {
          font-size: 2rem !important;
          font-weight: 700 !important;
          color: hsl(var(--foreground)) !important;
          margin: 1.75rem 0 1rem 0 !important;
          line-height: 1.3 !important;
          border-bottom: 2px solid hsl(var(--border)) !important;
          padding-bottom: 0.5rem !important;
          letter-spacing: -0.025em !important;
        }
        
        .article-content h3 {
          font-size: 1.5rem !important;
          font-weight: 600 !important;
          color: hsl(var(--foreground)) !important;
          margin: 1.5rem 0 0.75rem 0 !important;
          line-height: 1.4 !important;
        }
        
        .article-content strong {
          font-weight: 700 !important;
          color: hsl(var(--foreground)) !important;
          font-size: inherit !important;
        }
        
        .article-content em {
          font-style: italic !important;
          color: hsl(var(--muted-foreground)) !important;
          font-weight: 500 !important;
        }
        
        .article-content u {
          text-decoration: underline !important;
          text-decoration-color: hsl(var(--primary)) !important;
          text-decoration-thickness: 2px !important;
          text-underline-offset: 3px !important;
          color: hsl(var(--foreground)) !important;
        }
        
        .article-content del {
          text-decoration: line-through !important;
          text-decoration-color: hsl(var(--destructive)) !important;
          color: hsl(var(--muted-foreground)) !important;
          opacity: 0.8 !important;
        }
        
        .article-content code {
          background: hsl(var(--muted)) !important;
          color: hsl(var(--primary)) !important;
          padding: 0.375rem 0.75rem !important;
          border-radius: 0.375rem !important;
          font-family: 'Fira Code', 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          border: 1px solid hsl(var(--border)) !important;
        }
        
        .article-content pre {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          padding: 1.5rem !important;
          border-radius: 0 !important;
          border: 1px solid hsl(var(--border)) !important;
          overflow-x: auto !important;
          margin: 2rem 0 !important;
          font-family: 'Fira Code', 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace !important;
          font-size: 0.875rem !important;
          line-height: 1.6 !important;
        }
        
        .article-content pre code {
          background: transparent !important;
          color: inherit !important;
          padding: 0 !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          font-size: inherit !important;
        }
        
        .article-content blockquote {
          border-left: 4px solid hsl(var(--primary)) !important;
          background: hsl(var(--primary) / 0.1) !important;
          padding: 1.5rem 2rem !important;
          margin: 2rem 0 !important;
          border-radius: 0 !important;
          font-style: italic !important;
          color: hsl(var(--muted-foreground)) !important;
          font-size: 1.1rem !important;
          position: relative !important;
        }
        
        .article-content blockquote::before {
          content: '"' !important;
          font-size: 3rem !important;
          color: hsl(var(--primary)) !important;
          position: absolute !important;
          top: -0.5rem !important;
          left: 1rem !important;
          font-family: serif !important;
          opacity: 0.3 !important;
        }
        
        .article-content ul, .article-content ol {
          margin: 1.5rem 0 !important;
          padding-left: 2rem !important;
        }
        
        .article-content ul {
          list-style-type: none !important;
        }
        
        .article-content ul li::before {
          content: '•' !important;
          color: hsl(var(--primary)) !important;
          font-weight: bold !important;
          position: absolute !important;
          margin-left: -1.5rem !important;
          font-size: 1.2rem !important;
        }
        
        .article-content ol {
          list-style-type: decimal !important;
          list-style-position: outside !important;
        }
        
        .article-content ol li {
          list-style-type: decimal !important;
        }
        
        .article-content li {
          margin: 0.75rem 0 !important;
          line-height: 1.6 !important;
          color: hsl(var(--foreground)) !important;
          font-size: 1.125rem !important;
          position: relative !important;
        }
        
        .article-content a {
          color: hsl(var(--primary)) !important;
          text-decoration: none !important;
          font-weight: 500 !important;
          border-bottom: 2px solid transparent !important;
          transition: all 0.2s ease !important;
        }
        
        .article-content a:hover {
          color: hsl(var(--primary) / 0.8) !important;
          border-bottom-color: hsl(var(--primary) / 0.8) !important;
        }
        
        .article-content br {
          margin: 0.5rem 0 !important;
        }
        
        /* Hide any stray HTML tags that might appear */
        .article-content script,
        .article-content style {
          display: none !important;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .article-content h1 {
            font-size: 2rem !important;
          }
          
          .article-content h2 {
            font-size: 1.75rem !important;
          }
          
          .article-content h3 {
            font-size: 1.375rem !important;
          }
          
          .article-content p,
          .article-content li {
            font-size: 1rem !important;
          }
          
          .article-content pre {
            padding: 1rem !important;
            font-size: 0.8rem !important;
          }
          
          .article-content blockquote {
            padding: 1rem 1.5rem !important;
            margin: 1.5rem 0 !important;
          }
        }
      `}</style>
    </div>
  )
}