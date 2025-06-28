import conf from '../conf/conf.js';
import { Client, ID, Databases, Query } from "appwrite";

export class MessagesService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    async sendMessage({ senderId, receiverId, message, fileId = null, fileName = null, fileSize = null, fileType = null }) {
        try {
            const result = await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteMessagesCollectionId,
                ID.unique(),
                { 
                    senderId: senderId,
                    receiverId: receiverId,
                    message: message,
                    isRead: false,
                    fileId: fileId,
                    fileName: fileName,
                    fileSize: fileSize,
                    fileType: fileType
                }
            );
            return result;
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    }

    async getConversation({ userId1, userId2, limit = 50, offset = 0 }) {
        try {
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteMessagesCollectionId,
                [
                    Query.or([
                        Query.and([
                            Query.equal("senderId", userId1),
                            Query.equal("receiverId", userId2)
                        ]),
                        Query.and([
                            Query.equal("senderId", userId2),
                            Query.equal("receiverId", userId1)
                        ])
                    ]),
                    Query.orderDesc("$createdAt"),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );
            
            return {
                ...result,
                documents: result.documents.reverse()
            };
        } catch (error) {
            console.error("Error fetching conversation:", error);
            return { documents: [] };
        }
    }

    async getConversationsList(userId, limit = 20) {
        try {
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteMessagesCollectionId,
                [
                    Query.or([
                        Query.equal("senderId", userId),
                        Query.equal("receiverId", userId)
                    ]),
                    Query.orderDesc("$createdAt"),
                    Query.limit(200) // Get more to process conversations
                ]
            );

            const conversationsMap = new Map();
            
            result.documents.forEach(message => {
                const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
                
                if (!conversationsMap.has(partnerId)) {
                    conversationsMap.set(partnerId, {
                        partnerId,
                        lastMessage: message,
                        unreadCount: 0
                    });
                }
            
                if (message.receiverId === userId && !message.isRead) {
                    conversationsMap.get(partnerId).unreadCount++;
                }
            });

            const conversations = Array.from(conversationsMap.values()).sort(
                (a, b) => new Date(b.lastMessage.$createdAt) - new Date(a.lastMessage.$createdAt)
            );

            return conversations.slice(0, limit);
        } catch (error) {
            console.error("Error fetching conversations list:", error);
            return [];
        }
    }

    async markAsRead({ messageId }) {
        try {
            const result = await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteMessagesCollectionId,
                messageId,
                { isRead: true }
            );
            return result;
        } catch (error) {
            console.error("Error marking message as read:", error);
            throw error;
        }
    }

    async markConversationAsRead({ senderId, receiverId }) {
        try {
            // Get unread messages in this conversation where current user is receiver
            const unreadMessages = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteMessagesCollectionId,
                [
                    Query.equal("senderId", senderId),
                    Query.equal("receiverId", receiverId),
                    Query.equal("isRead", false)
                ]
            );
            const updatePromises = unreadMessages.documents.map(message =>
                this.markAsRead({ messageId: message.$id })
            );

            await Promise.all(updatePromises);
            return unreadMessages.documents.length;
        } catch (error) {
            console.error("Error marking conversation as read:", error);
            throw error;
        }
    }

    async getUnreadCount(userId) {
        try {
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteMessagesCollectionId,
                [
                    Query.equal("receiverId", userId),
                    Query.equal("isRead", false)
                ]
            );
            return result.documents.length;
        } catch (error) {
            console.error("Error getting unread count:", error);
            return 0;
        }
    }

    async deleteMessage(messageId) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteMessagesCollectionId,
                messageId
            );
            return true;
        } catch (error) {
            console.error("Error deleting message:", error);
            throw error;
        }
    }

    async searchMessages({ userId, searchTerm, limit = 50 }) {
        try {
            console.log("Searching messages for:", { userId, searchTerm });
            
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteMessagesCollectionId,
                [
                    Query.or([
                        Query.equal("senderId", userId),
                        Query.equal("receiverId", userId)
                    ]),
                    Query.search("message", searchTerm),
                    Query.orderDesc("$createdAt"),
                    Query.limit(limit)
                ]
            );
            
            return result.documents;
        } catch (error) {
            console.error("Error searching messages:", error);
            return [];
        }
    }

    subscribeToConversation({ userId1, userId2, callback }) {
        try {
            const channel = `databases.${conf.appwriteDatabaseId}.collections.${conf.appwriteMessagesCollectionId}.documents`;
            
            return this.client.subscribe(channel, callback);
        } catch (error) {
            console.error("Error subscribing to conversation:", error);
            return null;
        }
    }

    subscribeToUserMessages({ userId, callback }) {
        try {
            const channel = `databases.${conf.appwriteDatabaseId}.collections.${conf.appwriteMessagesCollectionId}.documents`;
            
            return this.client.subscribe(channel, (response) => {
                const payload = response.payload;
                // Filter messages for this user
                if (payload.senderId === userId || payload.receiverId === userId) {
                    callback(response);
                }
            });
        } catch (error) {
            console.error("Error subscribing to user messages:", error);
            return null;
        }
    }
}

const messagesService = new MessagesService();
export default messagesService;