"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import {
  User,
  Calendar,
  MapPin,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Edit3,
  BookOpen,
  Bookmark,
  ExternalLink,
  Mail,
} from "lucide-react"
import profileService from "../appwrite/profile"
import appwriteService from "../appwrite/config"
import bookmarksService from "../appwrite/bookmarks"
import { setProfile } from "../store/profileSlice"
import Draft from "./Draft"
import YourPosts from "./YourPosts"
import BookmarkedPosts from "./BookmarkedPosts"

export default function Profile() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const profileData = useSelector((state) => state.profile.profileData)
  const userData = useSelector((state) => state.auth.userData)
  const [isLoading, setIsLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [profileFetched, setProfileFetched] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [publishedCount, setPublishedCount] = useState(0)
  const [bookmarksCount, setBookmarksCount] = useState(0)

  const profileImageUrl = useMemo(() => {
    if (!profileData?.profileImage) return null
    try {
      const imageUrl = profileService.getProfileImageView(profileData.profileImage)
      return imageUrl
    } catch (error) {
      console.error("Error getting profile image URL:", error)
      return null
    }
  }, [profileData?.profileImage])

  const fetchProfile = useCallback(async () => {
    if (!userData?.$id || isLoading) return

    setIsLoading(true)
    try {
      const profile = await profileService.getProfile(userData.$id)
      if (profile) {
        dispatch(setProfile(profile))
      }
      setProfileFetched(true)
    } catch (error) {
      console.error("Error fetching profile:", error)
      setProfileFetched(true)
    } finally {
      setIsLoading(false)
    }
  }, [userData?.$id, dispatch, isLoading])

  const fetchStats = useCallback(async () => {
    if (!userData?.$id) return
    
    try {
      
      const posts = await appwriteService.getPosts()
      const userPublishedPosts = posts?.documents?.filter(
        (post) => post.userId === userData.$id && post.status === "active"
      ) || []
      setPublishedCount(userPublishedPosts.length)

      
      const userBookmarks = await bookmarksService.getUserBookmarks(userData.$id)
      setBookmarksCount(userBookmarks.length)
    } catch (error) {
      console.error("Error fetching stats:", error)
      setPublishedCount(0)
      setBookmarksCount(0)
    }
  }, [userData?.$id])

  useEffect(() => {
    if (userData?.$id && !profileFetched) {
      fetchProfile()
      fetchStats()
    }
  }, [userData?.$id, profileFetched, fetchProfile, fetchStats])

  useEffect(() => {
    setProfileFetched(false)
    setImageLoaded(false)
    setImageError(false)
  }, [userData?.$id])

  useEffect(() => {
    if (profileImageUrl) {
      setImageLoaded(false)
      setImageError(false)
    }
  }, [profileImageUrl])

  const getSocialIcon = useCallback((platform) => {
    const icons = {
      website: Globe,
      twitter: Twitter,
      github: Github,
      linkedIn: Linkedin,
    }
    return icons[platform] || Globe
  }, [])

  const formatSocialLink = useCallback((platform, value) => {
    if (!value) return null

    const baseUrls = {
      website: value.startsWith("http") ? value : `https://${value}`,
      twitter: `https://twitter.com/${value.replace("@", "")}`,
      github: `https://github.com/${value}`,
      linkedIn: `https://linkedin.com/in/${value}`,
    }

    return baseUrls[platform] || value
  }, [])

  const calculateProfileCompletion = useCallback(() => {
    if (!profileData) return 0

    const fields = {
      userName: profileData?.userName,
      bio: profileData?.bio,
      location: profileData?.location,
      profileImage: profileData?.profileImage,
      website: profileData?.website,
    }

    const filledFields = Object.values(fields).filter(Boolean).length
    return Math.round((filledFields / 5) * 100)
  }, [profileData])

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    setImageError(false)
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(false)
  }, [])

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading user data...</p>
        </div>
      </div>
    )
  }

  if (isLoading && !profileFetched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">User Profile</h1>
              <p className="text-slate-400 mt-1">Manage your profile information</p>
            </div>
            <button
              onClick={() => navigate("/edit-profile")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

    
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "posts"
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Your Posts
          </button>
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "bookmarks"
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Bookmarks
          </button>
          <button
            onClick={() => setActiveTab("drafts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "drafts"
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Drafts
          </button>
        </div>
      </div>

      
      <div className="max-w-6xl mx-auto px-6 pb-8">
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
            <div className="lg:col-span-2 space-y-6">
             
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500/30 bg-slate-700">
                      {profileImageUrl && !imageError ? (
                        <div className="relative w-full h-full">
                          <img
                            src={typeof profileImageUrl === "string" ? profileImageUrl : profileImageUrl.href}
                            alt="Profile"
                            className={`w-full h-full object-cover transition-opacity duration-300 ${
                              imageLoaded ? "opacity-100" : "opacity-0"
                            }`}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            loading="eager"
                          />
                          {!imageLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-800"></div>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {profileData?.userName || userData?.name || "User"}
                    </h2>
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                      <Mail className="w-4 h-4" />
                      <span>{userData?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(userData?.$createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              {profileData?.bio && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                  <p className="text-slate-300 leading-relaxed">{profileData.bio}</p>
                </div>
              )}

              {/* Details Section */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">Display Name</span>
                    <span className="text-white font-medium">{profileData?.userName || "Not set"}</span>
                  </div>
                  {profileData?.location && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-400 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </span>
                      <span className="text-white font-medium">{profileData.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["website", "twitter", "github", "linkedIn"].map((platform) => {
                    const value = profileData?.[platform]
                    const Icon = getSocialIcon(platform)
                    const link = formatSocialLink(platform, value)

                    return (
                      <div key={platform} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-300 capitalize">
                            {platform === "linkedIn" ? "LinkedIn" : platform}
                          </span>
                        </div>
                        {value ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <span className="text-sm truncate max-w-32">{value}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-500 text-sm">Not set</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Activity */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600/30 rounded-lg">
                      <BookOpen className="w-6 h-6 text-purple-300" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{publishedCount}</div>
                      <div className="text-purple-300 text-sm">Articles Published</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600/30 rounded-lg">
                      <Bookmark className="w-6 h-6 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{bookmarksCount}</div>
                      <div className="text-blue-300 text-sm">Articles Bookmarked</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Completion */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Profile Completion</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white font-medium">{calculateProfileCompletion()}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProfileCompletion()}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-400">Complete your profile to get better visibility</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/edit-profile")}
                    className="w-full flex items-center gap-3 p-3 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => setActiveTab("posts")}
                    className="w-full flex items-center gap-3 p-3 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    My Articles
                  </button>
                  <button 
                    onClick={() => setActiveTab("bookmarks")}
                    className="w-full flex items-center gap-3 p-3 text-left text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <Bookmark className="w-4 h-4" />
                    Bookmarks
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "posts" && <YourPosts />}
        {activeTab === "bookmarks" && <BookmarkedPosts />}
        {activeTab === "drafts" && <Draft />}
      </div>
    </div>
  )
}