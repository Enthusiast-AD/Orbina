"use client"

import { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Search, MessageCircle } from "lucide-react"
import messagesService from "../../appwrite/messages"
import profileService from "../../appwrite/profile"
import { formatDistanceToNow } from "date-fns"

export default function ConversationsList({ onSelectConversation, selectedPartnerId }) {
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.auth.userData)
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [partnersProfiles, setPartnersProfiles] = useState({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const lastUpdateRef = useRef(0)

  useEffect(() => {
    if (currentUser) {
      fetchConversations()
    }
  }, [currentUser])

  // Optimized real-time updates - debounced refresh
  useEffect(() => {
    if (!currentUser) return

    const unsubscribe = messagesService.subscribeToUserMessages({
      userId: currentUser.$id,
      callback: (response) => {
        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          // Debounce the refresh to prevent excessive updates
          const now = Date.now()
          if (now - lastUpdateRef.current > 1000) { // Only refresh once per second
            lastUpdateRef.current = now
            setTimeout(() => {
              if (!isRefreshing) {
                fetchConversationsOptimized()
              }
            }, 500)
          }
        }
      },
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [currentUser, isRefreshing])

  const fetchConversations = async () => {
    setIsLoading(true)
    try {
      const conversationsList = await messagesService.getConversationsList(currentUser.$id)
      setConversations(conversationsList)

      // Fetch profiles for all partners
      const profilePromises = conversationsList.map(async (conv) => {
        try {
          const profile = await profileService.getProfile(conv.partnerId)
          return { [conv.partnerId]: profile }
        } catch (error) {
          console.error("Error fetching profile for:", conv.partnerId, error)
          return { [conv.partnerId]: null }
        }
      })

      const profiles = await Promise.all(profilePromises)
      const profilesMap = profiles.reduce((acc, profile) => ({ ...acc, ...profile }), {})
      setPartnersProfiles(profilesMap)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Optimized refresh that doesn't show loading state
  const fetchConversationsOptimized = async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    try {
      const conversationsList = await messagesService.getConversationsList(currentUser.$id)
      
      // Only update if there are actual changes
      const hasChanges = JSON.stringify(conversationsList) !== JSON.stringify(conversations)
      if (hasChanges) {
        setConversations(conversationsList)
        
        // Only fetch new profiles if needed
        const newPartnerIds = conversationsList
          .map(conv => conv.partnerId)
          .filter(id => !partnersProfiles[id])
        
        if (newPartnerIds.length > 0) {
          const profilePromises = newPartnerIds.map(async (partnerId) => {
            try {
              const profile = await profileService.getProfile(partnerId)
              return { [partnerId]: profile }
            } catch (error) {
              return { [partnerId]: null }
            }
          })

          const newProfiles = await Promise.all(profilePromises)
          const newProfilesMap = newProfiles.reduce((acc, profile) => ({ ...acc, ...profile }), {})
          setPartnersProfiles(prev => ({ ...prev, ...newProfilesMap }))
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    const profile = partnersProfiles[conv.partnerId]
    const userName = profile?.userName || "User"
    return userName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getPartnerName = (partnerId) => {
    return partnersProfiles[partnerId]?.userName || "User"
  }

  const getPartnerInitials = (partnerId) => {
    const name = getPartnerName(partnerId)
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const truncateMessage = (message, maxLength = 50) => {
    return message.length > maxLength ? message.substring(0, maxLength) + "..." : message
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString("en-US", { weekday: "short" })
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Messages</h2>
          {isRefreshing && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              {searchTerm ? "No conversations found" : "No messages yet"}
            </h3>
            <p className="text-slate-400 text-sm">
              {searchTerm ? "Try a different search term" : "Start a conversation with someone"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredConversations.map((conversation) => {
              const isSelected = conversation.partnerId === selectedPartnerId
              const isOwnMessage = conversation.lastMessage.senderId === currentUser.$id

              return (
                <button
                  key={conversation.partnerId}
                  onClick={() => onSelectConversation(conversation.partnerId)}
                  className={`w-full p-4 text-left hover:bg-slate-800 transition-colors ${
                    isSelected ? "bg-slate-800 border-r-2 border-purple-500" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar - No longer clickable */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-600 bg-slate-700 flex-shrink-0">
                        {partnersProfiles[conversation.partnerId]?.profileImage ? (
                          <img
                            src={profileService.getProfileImageView(
                              partnersProfiles[conversation.partnerId].profileImage
                            )}
                            alt={getPartnerName(conversation.partnerId)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <span className="text-sm font-medium">{getPartnerInitials(conversation.partnerId)}</span>
                          </div>
                        )}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                    </div>

                    {/* Conversation Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-white truncate">
                          {getPartnerName(conversation.partnerId)}
                        </h3>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {formatTime(conversation.lastMessage.$createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400 truncate">
                          {isOwnMessage && <span className="text-slate-500">You: </span>}
                          {truncateMessage(conversation.lastMessage.message)}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="ml-2 bg-purple-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center flex-shrink-0">
                            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}