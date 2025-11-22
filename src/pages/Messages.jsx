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
  const { userId } = useParams() 
  const currentUser = useSelector((state) => state.auth.userData)
  const [selectedPartnerId, setSelectedPartnerId] = useState(userId || null)
  const [isMobile, setIsMobile] = useState(false)
  const [showChat, setShowChat] = useState(false)


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please Log In</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to access messages.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          </div>
        </div>
      </div>

     
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-card backdrop-blur-sm border border-border overflow-hidden h-[calc(100vh-200px)]">
          <div className="flex h-full">
            
            <div className={`${isMobile ? (showChat ? "hidden" : "w-full") : "w-80"} border-r border-border bg-muted/30`}>
              <ConversationsList
                onSelectConversation={handleSelectConversation}
                selectedPartnerId={selectedPartnerId}
              />
            </div>

           
            <div className={`flex-1 ${isMobile && !showChat ? "hidden" : ""}`}>
              {selectedPartnerId ? (
                <ChatInterface
                  partnerId={selectedPartnerId}
                  onClose={handleCloseChat}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-background/50">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">Choose a conversation from the list to start messaging</p>
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