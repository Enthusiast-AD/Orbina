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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    )
  }

  if (isLoading && !profileFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your profile information</p>
            </div>
            <button
              onClick={() => navigate("/edit-profile")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
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
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "posts"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Your Posts
          </button>
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "bookmarks"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Bookmarks
          </button>
          <button
            onClick={() => setActiveTab("drafts")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "drafts"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
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
             
              <div className="bg-card backdrop-blur-sm p-6 border border-border">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 overflow-hidden border-4 border-primary/30 bg-muted">
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
                            <div className="absolute inset-0 flex items-center justify-center bg-muted">
                              <div className="animate-spin h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-card"></div>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      {profileData?.userName || userData?.name || "User"}
                    </h2>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Mail className="w-4 h-4" />
                      <span>{userData?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(userData?.$createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              {profileData?.bio && (
                <div className="bg-card backdrop-blur-sm p-6 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-3">About</h3>
                  <p className="text-muted-foreground leading-relaxed">{profileData.bio}</p>
                </div>
              )}

              {/* Details Section */}
              <div className="bg-card backdrop-blur-sm p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Display Name</span>
                    <span className="text-foreground font-medium">{profileData?.userName || "Not set"}</span>
                  </div>
                  {profileData?.location && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </span>
                      <span className="text-foreground font-medium">{profileData.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-card backdrop-blur-sm p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["website", "twitter", "github", "linkedIn"].map((platform) => {
                    const value = profileData?.[platform]
                    const Icon = getSocialIcon(platform)
                    const link = formatSocialLink(platform, value)

                    return (
                      <div key={platform} className="flex items-center justify-between p-3 bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                          <span className="text-muted-foreground capitalize">
                            {platform === "linkedIn" ? "LinkedIn" : platform}
                          </span>
                        </div>
                        {value ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                          >
                            <span className="text-sm truncate max-w-32">{value}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground/50 text-sm">Not set</span>
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
                <div className="bg-card p-6 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{publishedCount}</div>
                      <div className="text-primary text-sm">Articles Published</div>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-6 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10">
                      <Bookmark className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{bookmarksCount}</div>
                      <div className="text-primary text-sm">Articles Bookmarked</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Completion */}
              <div className="bg-card backdrop-blur-sm p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Profile Completion</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{calculateProfileCompletion()}%</span>
                  </div>
                  <div className="w-full bg-muted h-2">
                    <div
                      className="bg-primary h-2 transition-all duration-300"
                      style={{ width: `${calculateProfileCompletion()}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">Complete your profile to get better visibility</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card backdrop-blur-sm p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/edit-profile")}
                    className="w-full flex items-center gap-3 p-3 text-left text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => setActiveTab("posts")}
                    className="w-full flex items-center gap-3 p-3 text-left text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    My Articles
                  </button>
                  <button 
                    onClick={() => setActiveTab("bookmarks")}
                    className="w-full flex items-center gap-3 p-3 text-left text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
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