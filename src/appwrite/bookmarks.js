import conf from '../conf/conf.js';
import { Client, ID, Databases, Query } from "appwrite";

export class BookmarksService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    async bookmarkPost({ postId, userId }) {
        try {
            console.log("Attempting to bookmark post:", { postId, userId });
            
            // Check if already bookmarked
            const existing = await this.getBookmark({ postId, userId });
            if (existing) {
                console.log("Post already bookmarked");
                return existing;
            }

            const result = await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteBookmarksCollectionId,
                ID.unique(),
                { 
                    postId: postId,
                    userId: userId
                }
            );
            console.log("Bookmark created successfully:", result);
            return result;
        } catch (error) {
            console.error("Error bookmarking post:", error);
            throw error;
        }
    }

    async unbookmarkPost({ postId, userId }) {
        try {
            console.log("Attempting to unbookmark post:", { postId, userId });
            
            const bookmarkDoc = await this.getBookmark({ postId, userId });
            if (bookmarkDoc) {
                await this.databases.deleteDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteBookmarksCollectionId,
                    bookmarkDoc.$id
                );
                console.log("Bookmark deleted successfully");
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error unbookmarking post:", error);
            throw error;
        }
    }

    async getBookmark({ postId, userId }) {
        try {
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteBookmarksCollectionId,
                [
                    Query.equal("postId", postId),
                    Query.equal("userId", userId),
                ]
            );
            return result.documents.length > 0 ? result.documents[0] : null;
        } catch (error) {
            console.error("Error getting bookmark:", error);
            return null;
        }
    }

    async getBookmarksCount(postId) {
        try {
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteBookmarksCollectionId,
                [Query.equal("postId", postId)]
            );
            return result.documents.length;
        } catch (error) {
            console.error("Error getting bookmarks count:", error);
            return 0;
        }
    }

    async getUserBookmarks(userId) {
        try {
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteBookmarksCollectionId,
                [Query.equal("userId", userId)]
            );
            return result.documents;
        } catch (error) {
            console.error("Error getting user bookmarks:", error);
            return [];
        }
    }
}

const bookmarksService = new BookmarksService();
export default bookmarksService;