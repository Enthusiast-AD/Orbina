"use client"

import { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  Paperclip,
  Smile,
  X,
} from "lucide-react"
import messagesService from "../../appwrite/messages"
import profileService from "../../appwrite/profile"
import { formatDistanceToNow } from "date-fns"

export default function ChatInterface({ partnerId, onClose }) {
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.auth.userData)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [partnerProfile, setPartnerProfile] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (partnerId && currentUser) {
      fetchMessages()
      fetchPartnerProfile()
      markMessagesAsRead()
    }
  }, [partnerId, currentUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Real-time message subscription
  useEffect(() => {
    if (!partnerId || !currentUser) return

    const unsubscribe = messagesService.subscribeToConversation({
      userId1: currentUser.$id,
      userId2: partnerId,
      callback: (response) => {
        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          const newMessage = response.payload
          if (
            (newMessage.senderId === partnerId && newMessage.receiverId === currentUser.$id) ||
            (newMessage.senderId === currentUser.$id && newMessage.receiverId === partnerId)
          ) {
            setMessages((prev) => [...prev, newMessage])
            if (newMessage.senderId === partnerId) {
              markMessagesAsRead()
            }
          }
        }
      },
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [partnerId, currentUser])

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const conversation = await messagesService.getConversation({
        userId1: currentUser.$id,
        userId2: partnerId,
        limit: 100,
      })
      setMessages(conversation.documents || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPartnerProfile = async () => {
    try {
      const profile = await profileService.getProfile(partnerId)
      setPartnerProfile(profile)
    } catch (error) {
      console.error("Error fetching partner profile:", error)
    }
  }

  const markMessagesAsRead = async () => {
    try {
      await messagesService.markConversationAsRead({
        senderId: partnerId,
        receiverId: currentUser.$id,
      })
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const messageData = {
        senderId: currentUser.$id,
        receiverId: partnerId,
        message: newMessage.trim(),
      }

      await messagesService.sendMessage(messageData)
      setNewMessage("")
      inputRef.current?.focus()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatMessageTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  const getPartnerName = () => {
    return partnerProfile?.userName || "User"
  }

  const getPartnerInitials = () => {
    const name = getPartnerName()
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/30 bg-slate-700 flex-shrink-0">
            {partnerProfile?.profileImage ? (
              <img
                src={profileService.getProfileImageView(partnerProfile.profileImage)}
                alt={getPartnerName()}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <span className="text-sm font-medium">{getPartnerInitials()}</span>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-white font-semibold">{getPartnerName()}</h3>
            <p className="text-xs text-slate-400">
              {isTyping ? "Typing..." : "Online"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Voice Call">
            <Phone className="w-4 h-4 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Video Call">
            <Video className="w-4 h-4 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="More Options">
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{getPartnerInitials()}</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Start a conversation</h3>
              <p className="text-slate-400 text-sm">Send a message to {getPartnerName()}</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUser.$id
            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId

            return (
              <div
                key={message.$id}
                className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                  {isOwnMessage ? (
                    <div className="w-full h-full bg-purple-600 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {currentUser?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ) : partnerProfile?.profileImage ? (
                    <img
                      src={profileService.getProfileImageView(partnerProfile.profileImage)}
                      alt={getPartnerName()}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <span className="text-slate-400 text-xs font-medium">{getPartnerInitials()}</span>
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwnMessage
                        ? "bg-purple-600 text-white rounded-br-md"
                        : "bg-slate-700 text-white rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.message}</p>
                  </div>
                  
                  {/* Timestamp */}
                  <span className="text-xs text-slate-500 mt-1 px-2">
                    {formatMessageTime(message.$createdAt)}
                    {isOwnMessage && (
                      <span className="ml-1">
                        {message.isRead ? "✓✓" : "✓"}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-700 bg-slate-800">
        <form onSubmit={sendMessage} className="flex items-end gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(e)
                }
              }}
              placeholder="Type a message..."
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none max-h-20"
              rows="1"
              disabled={isSending}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Add Emoji"
            >
              <Smile className="w-4 h-4 text-slate-400" />
            </button>
            
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              title="Send Message"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}