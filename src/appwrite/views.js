import conf from '../conf/conf.js';
import { Client, Databases, Query } from "appwrite";

export class ViewsService {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    // Track a view for a post with rate limiting
    async trackView(postId, userId = null) {
        try {
            // Rate limiting: prevent same user from inflating views
            const cacheKey = `view_${postId}_${userId || 'anonymous'}`;
            const lastView = localStorage.getItem(cacheKey);
            
            // If viewed within last 30 minutes, don't count again
            if (lastView && Date.now() - parseInt(lastView) < 30 * 60 * 1000) {
                // Return current view count without incrementing
                const post = await this.databases.getDocument(
                    conf.appwriteDatabaseId,
                    conf.appwriteCollectionId,
                    postId
                );
                return post.views || 0;
            }

            // Get current post
            const post = await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                postId
            );

            const currentViews = post.views || 0;
            const newViews = currentViews + 1;

            // Update view count
            await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                postId,
                { views: newViews }
            );

            // Cache this view to prevent rapid re-views
            localStorage.setItem(cacheKey, Date.now().toString());

            return newViews;
        } catch (error) {
            console.error("Error tracking view:", error);
            return null;
        }
    }

    // Get views count for a post
    async getViewsCount(postId) {
        try {
            const post = await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                postId
            );
            return post.views || 0;
        } catch (error) {
            console.error("Error getting views count:", error);
            return 0;
        }
    }
}

const viewsService = new ViewsService();
export default viewsService;