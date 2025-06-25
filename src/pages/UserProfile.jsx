"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  Calendar,
  MapPin,
  Globe,
  Twitter,
  Github,
  Linkedin,
  BookOpen,
  ExternalLink,
  ArrowLeft,
  MessageCircle,
  UserPlus,
  UserCheck,
  Heart,
} from "lucide-react"
import profileService from "../appwrite/profile"
import appwriteService from "../appwrite/config"
import likesService from "../appwrite/likes"
import PostCard from "../components/PostCard"

export default function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.auth.userData)

  const [userProfile, setUserProfile] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")
  const [totalLikes, setTotalLikes] = useState(0)

  const isOwnProfile = currentUser?.$id === userId

  useEffect(() => {
    if (userId) {
      fetchUserProfile()
      fetchUserPosts()
    }
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      const profile = await profileService.getProfile(userId)
      if (profile) {
        setUserProfile(profile)
      } else {
        navigate("/404")
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      navigate("/404")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserPosts = async () => {
    try {
      const posts = await appwriteService.getPosts()
      const userSpecificPosts = posts?.documents?.filter((post) => post.userId === userId) || []
      setUserPosts(userSpecificPosts)

      // Calculate total likes received by this user
      let totalLikesCount = 0
      for (const post of userSpecificPosts) {
        try {
          const postLikes = await likesService.getLikesCount(post.$id)
          totalLikesCount += postLikes
        } catch (error) {
          console.error("Error fetching likes for post:", post.$id, error)
        }
      }
      setTotalLikes(totalLikesCount)
    } catch (error) {
      console.error("Error fetching user posts:", error)
    } finally {
      setPostsLoading(false)
    }
  }

  const getSocialIcon = (platform) => {
    const icons = {
      website: Globe,
      twitter: Twitter,
      github: Github,
      linkedin: Linkedin,
    }
    return icons[platform] || Globe
  }

  const formatSocialLink = (platform, value) => {
    if (!value) return null

    const baseUrls = {
      website: value.startsWith("http") ? value : `https://${value}`,
      twitter: `https://twitter.com/${value.replace("@", "")}`,
      github: `https://github.com/${value}`,
      linkedin: `https://linkedin.com/in/${value}`,
    }

    return baseUrls[platform] || value
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing)
  }

  const handleMessage = () => {
    // Navigate to messages page with this user
    navigate(`/messages/${userId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">User Not Found</h1>
          <p className="text-slate-400 mb-6">The user profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {!isOwnProfile && currentUser && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMessage}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
                <button
                  onClick={handleFollowToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing
                      ? "bg-slate-700 hover:bg-slate-600 text-white"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500/30 bg-slate-700 mx-auto">
                    {!imageError && userProfile.profileImage ? (
                      <img
                        src={
                          profileService.getFileView
                            ? profileService.getFileView(userProfile.profileImage)
                            : profileService.getProfileImageView?.(userProfile.profileImage) || "/placeholder.svg"
                        }
                        alt={`${userProfile.userName}'s profile`}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <span className="text-2xl font-bold">{getInitials(userProfile.userName)}</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-800"></div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">{userProfile.userName}</h1>

                {userProfile.location && (
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{userProfile.location}</span>
                  </div>
                )}

                {userProfile.bio && <p className="text-slate-300 leading-relaxed mb-4">{userProfile.bio}</p>}

                <div className="flex items-center justify-center gap-1 text-slate-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(userProfile.$createdAt || userProfile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 text-center">
                <div className="text-2xl font-bold text-white">{userPosts.length}</div>
                <div className="text-purple-300 text-sm">Posts</div>
              </div>
              <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30 text-center">
                <div className="text-2xl font-bold text-white">{totalLikes}</div>
                <div className="text-red-300 text-sm">Likes Received</div>
              </div>
            </div>

            {/* Social Links */}
            {(userProfile.website || userProfile.twitter || userProfile.github || userProfile.linkedin) && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Social Links</h3>
                <div className="space-y-3">
                  {["website", "twitter", "github", "linkedin"].map((platform) => {
                    const value = userProfile[platform]
                    const Icon = getSocialIcon(platform)
                    const link = formatSocialLink(platform, value)

                    if (!value) return null

                    return (
                      <a
                        key={platform}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors group"
                      >
                        <Icon className="w-5 h-5 text-slate-400 group-hover:text-white" />
                        <span className="text-slate-300 group-hover:text-white capitalize flex-1">{platform}</span>
                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
              <div className="flex border-b border-slate-700/50">
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === "posts"
                      ? "text-purple-400 border-b-2 border-purple-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Posts ({userPosts.length})
                </button>
              </div>

              <div className="p-6">
                {activeTab === "posts" && (
                  <div>
                    {postsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                      </div>
                    ) : userPosts.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {userPosts.map((post) => (
                          <PostCard key={post.$id} {...post} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                        <p className="text-slate-400">
                          {isOwnProfile
                            ? "Start writing your first post!"
                            : "This user hasn't published any posts yet."}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}