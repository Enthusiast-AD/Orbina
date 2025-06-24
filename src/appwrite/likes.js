import conf from '../conf/conf.js';
import { Client, ID, Databases, Query } from "appwrite";

export class LikesService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    async likePost({ postId, userId }) {
        try {
            console.log("Attempting to like post:", { postId, userId });
            
            // Check if already liked
            const existing = await this.getLike({ postId, userId });
            if (existing) {
                console.log("Post already liked");
                return existing;
            }

            const result = await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteLikesCollectionId,
                ID.unique(),
                { 
                    postId: postId,
                    userId: userId
                }
            );
            console.log("Like created successfully:", result);
            return result;
        } catch (error) {
            console.error("Error liking post:", error);
            throw error;
        }
    }

    async unlikePost({ postId, userId }) {
        try {
            console.log("Attempting to unlike post:", { postId, userId });
            
            const likeDoc = await this.getLike({ postId, userId });
            if (likeDoc) {
                await this.databases.deleteDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteLikesCollectionId,
                    likeDoc.$id
                );
                console.log("Like deleted successfully");
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error unliking post:", error);
            throw error;
        }
    }

    async getLike({ postId, userId }) {
        try {
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteLikesCollectionId,
                [
                    Query.equal("postId", postId),
                    Query.equal("userId", userId),
                ]
            );
            return result.documents.length > 0 ? result.documents[0] : null;
        } catch (error) {
            console.error("Error getting like:", error);
            return null;
        }
    }

    async getLikesCount(postId) {
        try {
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteLikesCollectionId,
                [Query.equal("postId", postId)]
            );
            return result.documents.length;
        } catch (error) {
            console.error("Error getting likes count:", error);
            return 0;
        }
    }

    async getUserLikes(userId) {
        try {
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteLikesCollectionId,
                [Query.equal("userId", userId)]
            );
            return result.documents;
        } catch (error) {
            console.error("Error getting user likes:", error);
            return [];
        }
    }
}

const likesService = new LikesService();
export default likesService;