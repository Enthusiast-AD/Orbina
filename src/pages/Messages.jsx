"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, MessageCircle } from "lucide-react"
import ConversationsList from "../components/messaging/ConversationsList"
import ChatInterface from "../components/messaging/ChatInterface"
import messagesService from "../appwrite/messages"

export default function Messages() {
  const navigate = useNavigate()
  const { userId } = useParams() // For direct message links
  const currentUser = useSelector((state) => state.auth.userData)
  const [selectedPartnerId, setSelectedPartnerId] = useState(userId || null)
  const [isMobile, setIsMobile] = useState(false)
  const [showChat, setShowChat] = useState(false)

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Auto-select conversation on mobile if partner is specified
  useEffect(() => {
    if (userId && isMobile) {
      setSelectedPartnerId(userId)
      setShowChat(true)
    }
  }, [userId, isMobile])

  const handleSelectConversation = (partnerId) => {
    setSelectedPartnerId(partnerId)
    if (isMobile) {
      setShowChat(true)
    }
  }

  const handleCloseChat = () => {
    if (isMobile) {
      setShowChat(false)
      setSelectedPartnerId(null)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Log In</h1>
          <p className="text-slate-400 mb-6">You need to be logged in to access messages.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-white">Messages</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden h-[calc(100vh-200px)]">
          <div className="flex h-full">
            {/* Conversations List - Hidden on mobile when chat is open */}
            <div className={`${isMobile ? (showChat ? "hidden" : "w-full") : "w-80"} border-r border-slate-700 bg-slate-900/50`}>
              <ConversationsList
                onSelectConversation={handleSelectConversation}
                selectedPartnerId={selectedPartnerId}
              />
            </div>

            {/* Chat Interface */}
            <div className={`flex-1 ${isMobile && !showChat ? "hidden" : ""}`}>
              {selectedPartnerId ? (
                <ChatInterface
                  partnerId={selectedPartnerId}
                  onClose={handleCloseChat}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-900">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                    <p className="text-slate-400">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}