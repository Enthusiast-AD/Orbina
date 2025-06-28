"use client"

import { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Search,
  Paperclip,
  Smile,
  X,
  File,
  Image,
  Download,
  User,
  Trash2,
  Palette,
} from "lucide-react"
import messagesService from "../../appwrite/messages"
import profileService from "../../appwrite/profile"
import appwriteService from "../../appwrite/config"
import { formatDistanceToNow } from "date-fns"
import toast from "react-hot-toast"

const Modal = ({ isOpen, onClose, title, children, type = "default" }) => {
  if (!isOpen) return null

  const modalTypes = {
    default: "border-slate-700 bg-slate-800",
    danger: "border-red-500/30 bg-slate-800",
    info: "border-blue-500/30 bg-slate-800"
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className={`bg-slate-800 border ${modalTypes[type]} rounded-xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}


const ContextMenu = ({ isOpen, position, onClose, onDelete }) => {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div 
        className="fixed z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-2 min-w-[150px] animate-in fade-in zoom-in-95 duration-150"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <button
          onClick={onDelete}
          className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-red-600/20 transition-colors text-red-400"
        >
          <Trash2 className="w-4 h-4" />
          Delete for everyone
        </button>
      </div>
    </>
  )
}

export default function ChatInterface({ partnerId, onClose }) {
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.auth.userData)
  const [messages, setMessages] = useState([])
  const [filteredMessages, setFilteredMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [partnerProfile, setPartnerProfile] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [showSearchBar, setShowSearchBar] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [chatTheme, setChatTheme] = useState("default")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, messageId: null })
  
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const searchInputRef = useRef(null)

 
  useEffect(() => {
    if (partnerId) {
      const savedTheme = localStorage.getItem(`chatTheme_${partnerId}`)
      if (savedTheme) {
        setChatTheme(savedTheme)
      }
    }
  }, [partnerId])

  useEffect(() => {
    if (partnerId && currentUser) {
      fetchMessages()
      fetchPartnerProfile()
      markMessagesAsRead()
    }
  }, [partnerId, currentUser])

  useEffect(() => {
    scrollToBottom()
  }, [filteredMessages])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = messages.filter(message => 
        message.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMessages(filtered)
    } else {
      setFilteredMessages(messages)
    }
  }, [messages, searchTerm])

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

        if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
          const deletedMessageId = response.payload.$id
          setMessages((prev) => prev.filter(msg => msg.$id !== deletedMessageId))
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
      setShowEmojiPicker(false)
      inputRef.current?.focus()
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    setUploadingFile(true)
    try {
      const uploadedFile = await appwriteService.uploadFile(file)
      
      if (uploadedFile) {
        const messageData = {
          senderId: currentUser.$id,
          receiverId: partnerId,
          message: `📎 ${file.name}`,
          fileId: uploadedFile.$id,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        }

        await messagesService.sendMessage(messageData)
        toast.success("File sent successfully")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to upload file")
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const downloadFile = async (fileId, fileName) => {
    try {
      const fileUrl = appwriteService.getFileView(fileId)
      
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Downloaded ${fileName}`)
    } catch (error) {
      console.error("Error downloading file:", error)
      toast.error("Failed to download file")
    }
  }

  const deleteChat = async () => {
    try {

      const conversation = await messagesService.getConversation({
        userId1: currentUser.$id,
        userId2: partnerId,
        limit: 1000,
      })

      const deletePromises = conversation.documents.map(message => 
        messagesService.deleteMessage(message.$id)
      )
      
      await Promise.all(deletePromises)
      setMessages([])

      localStorage.removeItem(`chatTheme_${partnerId}`)
      
      toast.success("Chat deleted successfully")
      onClose()
    } catch (error) {
      console.error("Error deleting chat:", error)
      toast.error("Failed to delete chat")
    }
  }

  const deleteMessage = async (messageId) => {
    try {
      await messagesService.deleteMessage(messageId)
      setMessages(prev => prev.filter(msg => msg.$id !== messageId))
      toast.success("Message deleted")
    } catch (error) {
      console.error("Error deleting message:", error)
      toast.error("Failed to delete message")
    }
  }

  const handleRightClick = (e, messageId) => {
    e.preventDefault()
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      messageId
    })
  }

  const handleThemeChange = (theme) => {
    setChatTheme(theme)
    localStorage.setItem(`chatTheme_${partnerId}`, theme)
    setShowMoreMenu(false)
    toast.success(`Theme changed to ${theme}`)
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      setTimeout(() => {
        container.scrollTop = container.scrollHeight
      }, 100)
    }
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

  const handleProfileClick = () => {
    navigate(`/profile/${partnerId}`)
  }

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  const isFileMessage = (message) => {
    return message.fileId && message.fileName
  }

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <Image className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getThemeClasses = () => {
    switch (chatTheme) {
      case "dark":
        return "bg-slate-950"
      case "blue":
        return "bg-gradient-to-b from-blue-900/20 to-slate-900"
      case "purple":
        return "bg-gradient-to-b from-purple-900/20 to-slate-900"
      case "green":
        return "bg-gradient-to-b from-green-900/20 to-slate-900"
      default:
        return "bg-slate-900"
    }
  }

  const toggleSearch = () => {
    setShowSearchBar(!showSearchBar)
    setSearchTerm("")
    if (!showSearchBar) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }

  const detectOS = () => {
    const userAgent = navigator.userAgent
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return "mobile"
    } else if (/Mac/i.test(userAgent)) {
      return "mac"
    } else {
      return "windows"
    }
  }

  const getEmojiShortcut = () => {
    const os = detectOS()
    switch (os) {
      case "mobile":
        return "Tap the emoji button or use your keyboard's emoji feature"
      case "mac":
        return "Press Control + Command + Space to open emoji picker"
      case "windows":
      default:
        return "Press Windows + ; (semicolon) to open emoji picker"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full border border-slate-700 rounded-lg overflow-hidden transition-all duration-300 ${getThemeClasses()}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 hover:bg-slate-700/50 rounded-lg p-2 -m-2 transition-colors"
          >
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
              <h3 className="text-white font-semibold text-left">{getPartnerName()}</h3>
              <p className="text-xs text-slate-400">
                {isTyping ? "Typing..." : "Click to view profile"}
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleSearch}
            className={`p-2 hover:bg-slate-700 rounded-lg transition-colors ${showSearchBar ? 'bg-slate-700' : ''}`} 
            title="Search Messages"
          >
            <Search className="w-4 h-4 text-slate-400" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors" 
              title="More Options"
            >
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </button>
            
            {showMoreMenu && (
              <div className="absolute right-0 top-12 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    handleProfileClick()
                    setShowMoreMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors text-slate-300"
                >
                  <User className="w-4 h-4" />
                  View Profile
                </button>
                
                <div className="border-t border-slate-700">
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Palette className="w-4 h-4 text-slate-400" />
                      <p className="text-sm text-slate-300 font-medium">Chat Theme</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "default", color: "bg-slate-600" },
                        { name: "dark", color: "bg-slate-900" },
                        { name: "blue", color: "bg-blue-600" },
                        { name: "purple", color: "bg-purple-600" },
                        { name: "green", color: "bg-green-600" }
                      ].map((theme) => (
                        <button
                          key={theme.name}
                          onClick={() => handleThemeChange(theme.name)}
                          className={`flex items-center gap-2 p-2 rounded text-xs capitalize transition-colors ${
                            chatTheme === theme.name 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full ${theme.color}`}></div>
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-slate-700">
                  <button
                    onClick={() => {
                      setShowDeleteModal(true)
                      setShowMoreMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-600/20 transition-colors text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearchBar && (
        <div className="p-4 border-b border-slate-700 bg-slate-800/50 animate-in slide-in-from-top-2 duration-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-xs text-slate-400 mt-2">
              Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        style={{ scrollBehavior: 'smooth' }}
      >
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{getPartnerInitials()}</span>
              </div>
              <h3 className="text-white font-semibold mb-2">
                {searchTerm ? "No messages found" : "Start a conversation"}
              </h3>
              <p className="text-slate-400 text-sm">
                {searchTerm ? "Try a different search term" : `Send a message to ${getPartnerName()}`}
              </p>
            </div>
          </div>
        ) : (
          filteredMessages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUser.$id
            const showAvatar = index === 0 || filteredMessages[index - 1].senderId !== message.senderId

            return (
              <div
                key={message.$id}
                className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
                onContextMenu={(e) => handleRightClick(e, message.$id)}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                  {isOwnMessage ? (
                    <div className="w-full h-full bg-purple-600 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {currentUser?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <button onClick={handleProfileClick} className="w-full h-full">
                      {partnerProfile?.profileImage ? (
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
                    </button>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`px-4 py-2 rounded-2xl transition-all hover:shadow-lg cursor-pointer ${
                      isOwnMessage
                        ? "bg-purple-600 text-white rounded-br-md"
                        : "bg-slate-700 text-white rounded-bl-md"
                    }`}
                  >
                    {isFileMessage(message) ? (
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="flex items-center gap-2 flex-1">
                          {getFileIcon(message.fileType)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{message.fileName}</p>
                            <p className="text-xs opacity-75">{formatFileSize(message.fileSize)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadFile(message.fileId, message.fileName)}
                          className="p-1 hover:bg-black/20 rounded transition-colors"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{message.message}</p>
                    )}
                  </div>
                  
                  
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

     
      <div className="p-4 border-t border-slate-700 bg-slate-800/80 backdrop-blur-sm">
        
        {showEmojiPicker && (
          <div className="mb-3 p-4 bg-slate-700 rounded-lg border border-slate-600 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-300">Add Emoji</span>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-center mb-3">
              <p className="text-xs text-slate-400">{getEmojiShortcut()}</p>
            </div>
            
            <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
              {/* Common emojis */}
              {["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️", "💌", "💤", "💢", "💬", "👁️‍🗨️", "🗨️", "🗯️", "💭", "💫"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="text-lg hover:bg-slate-600 rounded p-1 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={sendMessage} className="flex items-end gap-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              title="Attach File"
            >
              {uploadingFile ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
              ) : (
                <Paperclip className="w-4 h-4 text-slate-400" />
              )}
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
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
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

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Chat"
        type="danger"
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            Are you sure you want to delete this entire conversation with <span className="font-semibold text-white">{getPartnerName()}</span>?
          </p>
          <p className="text-sm text-slate-400">
            This action cannot be undone. All messages, files, and chat history will be permanently deleted.
          </p>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteChat()
                setShowDeleteModal(false)
              }}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete Chat
            </button>
          </div>
        </div>
      </Modal>

      
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        onDelete={() => {
          deleteMessage(contextMenu.messageId)
          setContextMenu({ ...contextMenu, isOpen: false })
        }}
      />
    </div>
  )
}