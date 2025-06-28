"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Calendar, Clock, ArrowRight, Eye, ImageIcon } from "lucide-react"
import appwriteService from "../appwrite/config"
import profileService from "../appwrite/profile"
import { cleanDisplayContent } from '../utils/contentParser'


const profileCache = new Map();
const failedProfiles = new Set();

function PostCard({ $id, title, featuredImage, content, userName, userId, $createdAt, status = "active", viewMode = "grid" }) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [authorProfile, setAuthorProfile] = useState(null)
  const [authorImageError, setAuthorImageError] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const hasFetchedProfile = useRef(false)

 
  useEffect(() => {
    const fetchAuthorProfile = async () => {
      if (!userId || hasFetchedProfile.current || profileLoading) return;

      if (failedProfiles.has(userId)) {
        setAuthorProfile(null);
        return;
      }

 
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

  
  const getPlainTextPreview = (htmlContent, maxLength = 120) => {
    if (!htmlContent) return "No preview available...";

    try {
     
      const parsedContent = cleanDisplayContent(htmlContent);
      
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = parsedContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || "";
      
      
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

 
  const formatDate = (dateString) => {
  if (!dateString) return "Recently";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    
    if (diffMinutes < 1) return "Just now";
    
    
    if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
    
   
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    
   
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) === 1 ? '' : 's'} ago`;
    
   
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Recently";
  }
};

  
  const getAuthorName = () => {
    if (authorProfile?.userName) return authorProfile.userName;
    if (userName) return userName;
    return "Anonymous Author";
  };


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

  
  const handleAuthorClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

 
  const getImageUrl = (imageId) => {
    if (!imageId) return null;
    try {
      return appwriteService.getFileView(imageId);
    } catch (error) {
      return null;
    }
  };

  
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

 
  if (viewMode === "list") {
    return (
      <Link to={`/post/${$id}`} className="block group">
        <article className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/10">
          <div className="flex gap-6">
            
            <div className="w-48 h-32 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
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
            </div>

          
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                {title}
              </h3>
              
              <p className="text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                {getPlainTextPreview(content, 200)}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  
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
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate($createdAt)}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{calculateReadingTime(content)} min read</span>
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

  
  return (
    <Link to={`/post/${$id}`} className="block group">
      <article
        className="relative bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/20 hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        
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

         
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

         
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

         
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-900/70 backdrop-blur-sm rounded-full text-xs text-slate-300">
              <Clock className="w-3 h-3" />
              <span>{calculateReadingTime(content)} min read</span>
            </div>
          </div>
        </div>

      
        <div className="p-6">
        
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">
            {title}
          </h3>

         
          <p className="text-slate-400 mb-4 line-clamp-3 leading-relaxed">{getPlainTextPreview(content)}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
            
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
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate($createdAt)}</span>
                </div>
              </div>
            </div>

          
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