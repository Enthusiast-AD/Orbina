"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Calendar, Clock, ArrowRight, Eye, ImageIcon } from "lucide-react"
import appwriteService from "../appwrite/config"
import profileService from "../appwrite/profile"
import { cleanDisplayContent } from '../utils/contentParser'

const profileCache = new Map();
const failedProfiles = new Set();

function PostCard({ 
  $id, 
  title, 
  featuredImage, 
  content, 
  userName, 
  userId, 
  $createdAt, 
  status = "active", 
  viewMode = "grid",
  views = 0,
  showStats = true 
}) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [authorProfile, setAuthorProfile] = useState(null)
  const [authorImageError, setAuthorImageError] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const hasFetchedProfile = useRef(false)

  // Fetch author profile
  useEffect(() => {
    const fetchAuthorProfile = async () => {
      if (!userId || hasFetchedProfile.current || profileLoading) return;

      if (failedProfiles.has(userId)) {
        setAuthorProfile(null);
        return;
      }

      // Check cache first
      if (profileCache.has(userId)) {
        setAuthorProfile(profileCache.get(userId));
        return;
      }

      hasFetchedProfile.current = true;
      setProfileLoading(true);

      try {
        const profile = await profileService.getProfile(userId);
        if (profile) {
          setAuthorProfile(profile);
          profileCache.set(userId, profile);
        } else {
          setAuthorProfile(null);
          failedProfiles.add(userId); 
          profileCache.set(userId, null); 
        }
      } catch (error) {
        console.error(`Failed to fetch profile for user ${userId}:`, error.message);
        setAuthorProfile(null);
        failedProfiles.add(userId);
        profileCache.set(userId, null);
      } finally {
        setProfileLoading(false);
      }
    }

    fetchAuthorProfile();
  }, [userId, profileLoading]);

  // Format numbers for display (K, M format) with null safety
  const formatNumber = (num) => {
    // Handle null, undefined, or non-numeric values
    if (num === null || num === undefined || isNaN(num)) {
      return '0';
    }
    
    const numValue = Number(num);
    
    if (numValue >= 1000000) return (numValue / 1000000).toFixed(1) + 'M';
    if (numValue >= 1000) return (numValue / 1000).toFixed(1) + 'K';
    return numValue.toString();
  };

  // Get plain text preview from HTML content
  const getPlainTextPreview = (htmlContent, maxLength = 120) => {
    if (!htmlContent) return "No preview available...";

    try {
      // Parse and clean content
      const parsedContent = cleanDisplayContent(htmlContent);
      
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = parsedContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || "";
      
      // Clean up HTML entities
      const cleanText = plainText
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
      
      return cleanText.length > maxLength ? cleanText.substring(0, maxLength) + "..." : cleanText;
    } catch (error) {
      return "Preview unavailable...";
    }
  };

  // Calculate reading time
  const calculateReadingTime = (content) => {
    if (!content) return 1;
    try {
      const wordsPerMinute = 200;
      const textLength = content.replace(/<[^>]*>/g, "").split(" ").length;
      const readingTime = Math.ceil(textLength / wordsPerMinute);
      return readingTime < 1 ? 1 : readingTime;
    } catch (error) {
      return 1;
    }
  };

  // Enhanced relative time formatting
  const getTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      
      // Convert to different time units
      const diffSeconds = Math.floor(diffTime / 1000);
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      // Just now (less than 30 seconds)
      if (diffSeconds < 30) return "Just now";
      
      // Seconds ago (30 seconds to 1 minute)
      if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
      
      // Minutes ago (1 minute to 1 hour)
      if (diffMinutes < 60) {
        return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
      }
      
      // Hours ago (1 hour to 24 hours)
      if (diffHours < 24) {
        return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
      }
      
      // Days ago (1 day to 7 days)
      if (diffDays < 7) {
        if (diffDays === 1) return "1 day ago";
        return `${diffDays} days ago`;
      }
      
      // Weeks ago (1 week to 4 weeks)
      if (diffWeeks < 4) {
        return diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`;
      }
      
      // Months ago (1 month to 12 months)
      if (diffMonths < 12) {
        return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
      }
      
      // Years ago
      return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
      
    } catch (error) {
      console.error("Error calculating time ago:", error);
      return "Recently";
    }
  };

  // Get author name with fallback
  const getAuthorName = () => {
    if (authorProfile?.userName) return authorProfile.userName;
    if (userName) return userName;
    return "Anonymous Author";
  };

  // Get author initials
  const getAuthorInitials = (name) => {
    if (!name || name === "Anonymous Author") return "AA";
    try {
      return name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    } catch (error) {
      return "AA";
    }
  };

  // Handle author profile click
  const handleAuthorClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Get image URL with error handling
  const getImageUrl = (imageId) => {
    if (!imageId) return null;
    try {
      return appwriteService.getFileView(imageId);
    } catch (error) {
      return null;
    }
  };

  // Get profile image URL
  const getProfileImageUrl = (imageId) => {
    if (!imageId) return null;
    try {
      if (profileService.getProfileImageView) {
        return profileService.getProfileImageView(imageId);
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Ensure we have valid values with defaults
  const safeViews = views || 0;

  // List view mode
  if (viewMode === "list") {
    return (
      <Link to={`/post/${$id}`} className="block group">
        <article className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/10">
          <div className="flex gap-6">
            {/* Image */}
            <div className="w-48 h-32 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0 relative">
              {!imageError && featuredImage ? (
                <img
                  src={getImageUrl(featuredImage)}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-700">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
              )}
              
              {/* Views overlay for list view */}
              {/* {showStats && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs">
                  <Eye className="w-3 h-3" />
                  {formatNumber(safeViews)}
                </div>
              )} */}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                {title}
              </h3>
              
              <p className="text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                {getPlainTextPreview(content, 200)}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Author avatar */}
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent flex-shrink-0">
                    {!authorImageError && authorProfile?.profileImage ? (
                      <img
                        src={getProfileImageUrl(authorProfile.profileImage)}
                        alt={`${getAuthorName()}'s profile`}
                        className="w-full h-full object-cover"
                        onError={() => setAuthorImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{getAuthorInitials(getAuthorName())}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">{getAuthorName()}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{getTimeAgo($createdAt)}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{calculateReadingTime(content)} min read</span>
                      {showStats && (
                        <>
                          <span>•</span>
                          <Eye className="w-3 h-3" />
                          <span>{formatNumber(safeViews)} views</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Grid view mode (default)
  return (
    <Link to={`/post/${$id}`} className="block group">
      <article
        className="relative bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/20 hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Featured Image */}
        <div className="aspect-[1.91/1] bg-slate-700 overflow-hidden relative">
          {!imageError && featuredImage ? (
            <img
              src={getImageUrl(featuredImage)}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-slate-600 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm">No image</p>
              </div>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Status badge */}
          {status && (
            <div className="absolute top-3 left-3">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  status === "active"
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                }`}
              >
                {status === "active" ? "Published" : "Draft"}
              </span>
            </div>
          )}

          {/* Reading time and views */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-900/70 backdrop-blur-sm rounded-full text-xs text-slate-300">
              <Clock className="w-3 h-3" />
              <span>{calculateReadingTime(content)} min</span>
            </div>
            {showStats && (
              <div className="flex items-center gap-1 px-2 py-1 bg-slate-900/70 backdrop-blur-sm rounded-full text-xs text-slate-300">
                <Eye className="w-3 h-3" />
                <span>{formatNumber(safeViews)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">
            {title}
          </h3>

          {/* Preview */}
          <p className="text-slate-400 mb-4 line-clamp-3 leading-relaxed">{getPlainTextPreview(content)}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Author Avatar */}
              <Link
                to={`/profile/${userId}`}
                onClick={handleAuthorClick}
                className="relative group/avatar flex-shrink-0"
                title={`View ${getAuthorName()}'s profile`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent group-hover/avatar:border-purple-400 transition-colors duration-200">
                  {!authorImageError && authorProfile?.profileImage ? (
                    <img
                      src={getProfileImageUrl(authorProfile.profileImage)}
                      alt={`${getAuthorName()}'s profile`}
                      className="w-full h-full object-cover"
                      onError={() => setAuthorImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">{getAuthorInitials(getAuthorName())}</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Author Info */}
              <div className="min-w-0 flex-1">
                <Link
                  to={`/profile/${userId}`}
                  onClick={handleAuthorClick}
                  className="text-sm font-medium text-white hover:text-purple-300 transition-colors duration-200 cursor-pointer block truncate"
                  title={`View ${getAuthorName()}'s profile`}
                >
                  {getAuthorName()}
                </Link>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <span>{getTimeAgo($createdAt)}</span>
                  {/* {showStats && (
                    <>
                      <span className="mx-1">•</span>
                      <Eye className="w-3 h-3" />
                      <span>{formatNumber(safeViews)} views</span>
                    </>
                  )} */}
                </div>
              </div>
            </div>

            {/* Read More Arrow */}
            <div
              className={`flex items-center gap-1 text-purple-400 transition-all duration-300 flex-shrink-0 ${
                isHovered ? "translate-x-1" : ""
              }`}
            >
              <span className="text-sm font-medium">Read</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default PostCard;