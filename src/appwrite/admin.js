import conf from '../conf/conf.js';
import { Client, ID, Databases, Storage, Query } from "appwrite";

export class AdminService {
    client = new Client();
    databases;
    bucket;
    
    constructor(){
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
    }

    async getDashboardStats() {
        try {
            const [posts, profiles, messages, likes, bookmarks] = await Promise.all([
                this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteCollectionId),
                this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteProfileCollectionId),
                this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteMessagesCollectionId),
                this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteLikesCollectionId),
                this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteBookmarksCollectionId),
            ]);

            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const todayPosts = posts.documents.filter(post => 
                new Date(post.$createdAt).toDateString() === today.toDateString()
            );

            const yesterdayPosts = posts.documents.filter(post => 
                new Date(post.$createdAt).toDateString() === yesterday.toDateString()
            );

            return {
                totalPosts: posts.total,
                totalUsers: profiles.total,
                totalMessages: messages.total,
                totalLikes: likes.total,
                totalBookmarks: bookmarks.total,
                todayPosts: todayPosts.length,
                yesterdayPosts: yesterdayPosts.length,
                postsGrowth: yesterdayPosts.length > 0 ? 
                    ((todayPosts.length - yesterdayPosts.length) / yesterdayPosts.length * 100).toFixed(1) : 
                    100,
                recentPosts: posts.documents.slice(0, 10),
                recentUsers: profiles.documents.slice(0, 10)
            };
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            throw error;
        }
    }

    async getAllPosts(limit = 50, offset = 0) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                [
                    Query.limit(limit),
                    Query.offset(offset),
                    Query.orderDesc('$createdAt')
                ]
            );
        } catch (error) {
            console.error("Error fetching posts:", error);
            throw error;
        }
    }

    async getAllUsers(limit = 50, offset = 0) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteProfileCollectionId,
                [
                    Query.limit(limit),
                    Query.offset(offset),
                    Query.orderDesc('$createdAt')
                ]
            );
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    }

    async deletePost(postId) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                postId
            );
            return true;
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    }

    async updatePostStatus(postId, status) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                postId,
                { status }
            );
        } catch (error) {
            console.error("Error updating post status:", error);
            throw error;
        }
    }

    async getReportedContent() {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteReportsCollectionId || conf.appwriteCollectionId,
                [Query.orderDesc('$createdAt')]
            );
        } catch (error) {
            console.error("Error fetching reported content:", error);
            return { documents: [], total: 0 };
        }
    }

    async getAnalytics(days = 30) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const posts = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                [
                    Query.greaterThanEqual('$createdAt', startDate.toISOString()),
                    Query.lessThanEqual('$createdAt', endDate.toISOString())
                ]
            );

            const users = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteProfileCollectionId,
                [
                    Query.greaterThanEqual('$createdAt', startDate.toISOString()),
                    Query.lessThanEqual('$createdAt', endDate.toISOString())
                ]
            );

            const analytics = [];
            for (let i = 0; i < days; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toDateString();

                const dayPosts = posts.documents.filter(post => 
                    new Date(post.$createdAt).toDateString() === dateStr
                );
                const dayUsers = users.documents.filter(user => 
                    new Date(user.$createdAt).toDateString() === dateStr
                );

                analytics.unshift({
                    date: date.toISOString().split('T')[0],
                    posts: dayPosts.length,
                    users: dayUsers.length
                });
            }

            return analytics;
        } catch (error) {
            console.error("Error fetching analytics:", error);
            throw error;
        }
    }
}

const adminService = new AdminService();
export default adminService;