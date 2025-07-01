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

    // Featured posts methods
    async getFeaturedPosts(limit = 6) {
        try {
            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                [
                    Query.equal('featured', true),
                    Query.equal('status', 'active'),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit)
                ]
            );
            return response.documents || [];
        } catch (error) {
            console.error("Error fetching featured posts:", error);
            return [];
        }
    }

    async getPinnedPosts(limit = 3) {
        try {
            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                [
                    Query.equal('pinned', true),
                    Query.equal('status', 'active'),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit)
                ]
            );
            return response.documents || [];
        } catch (error) {
            console.error("Error fetching pinned posts:", error);
            return [];
        }
    }

    // Post management methods
    async togglePostFeatured(postId, featured) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                postId,
                { featured }
            );
        } catch (error) {
            console.error("Error toggling featured status:", error);
            throw error;
        }
    }

    async togglePostPinned(postId, pinned) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                postId,
                { pinned }
            );
        } catch (error) {
            console.error("Error toggling pinned status:", error);
            throw error;
        }
    }

    // NEW: Create fake likes for testing (creates actual like documents)
    async adjustPostLikes(postId, adjustment) {
        try {
            if (adjustment === 0) return { previousCount: 0, newCount: 0 };

            // Get current likes count
            const currentLikes = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteLikesCollectionId,
                [
                    Query.equal('postId', postId),
                    Query.limit(1000)
                ]
            );

            const previousCount = currentLikes.documents.length;
            let newCount = previousCount;

            if (adjustment > 0) {
                // Add fake likes
                const promises = [];
                for (let i = 0; i < adjustment; i++) {
                    promises.push(
                        this.databases.createDocument(
                            conf.appwriteDatabaseId,
                            conf.appwriteLikesCollectionId,
                            ID.unique(),
                            {
                                postId: postId,
                                userId: `admin_fake_user_${Date.now()}_${i}`, // Fake user ID
                                $createdAt: new Date().toISOString()
                            }
                        )
                    );
                }
                await Promise.all(promises);
                newCount = previousCount + adjustment;
            } else if (adjustment < 0) {
                // Remove likes
                const likesToRemove = Math.min(Math.abs(adjustment), currentLikes.documents.length);
                const promises = [];
                
                for (let i = 0; i < likesToRemove; i++) {
                    if (currentLikes.documents[i]) {
                        promises.push(
                            this.databases.deleteDocument(
                                conf.appwriteDatabaseId,
                                conf.appwriteLikesCollectionId,
                                currentLikes.documents[i].$id
                            )
                        );
                    }
                }
                await Promise.all(promises);
                newCount = Math.max(0, previousCount + adjustment);
            }

            return {
                previousCount,
                newCount
            };
        } catch (error) {
            console.error("Error adjusting likes:", error);
            throw error;
        }
    }

    async updatePostViews(postId, views) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                postId,
                { views }
            );
        } catch (error) {
            console.error("Error updating views:", error);
            throw error;
        }
    }

    async bulkPostOperation(postIds, operation) {
        try {
            let successful = 0;
            let failed = 0;
            
            const promises = postIds.map(async (postId) => {
                try {
                    switch (operation) {
                        case 'publish':
                            await this.updatePostStatus(postId, 'active');
                            break;
                        case 'unpublish':
                            await this.updatePostStatus(postId, 'inactive');
                            break;
                        case 'feature':
                            await this.togglePostFeatured(postId, true);
                            break;
                        case 'delete':
                            await this.deletePost(postId);
                            break;
                        default:
                            throw new Error('Invalid operation');
                    }
                    successful++;
                } catch (error) {
                    failed++;
                    console.error(`Failed ${operation} for post ${postId}:`, error);
                }
            });
            
            await Promise.all(promises);
            
            return { successful, failed };
        } catch (error) {
            console.error("Error in bulk operation:", error);
            throw error;
        }
    }

    // Enhanced posts fetching with filters and likes count
    async getAllPosts(options = {}) {
        try {
            const {
                limit = 50,
                offset = 0,
                status = 'all',
                featured = 'all',
                pinned = 'all',
                searchTerm = '',
                sortBy = 'newest'
            } = options;

            let queries = [
                Query.limit(limit),
                Query.offset(offset)
            ];

            // Add status filter
            if (status !== 'all') {
                queries.push(Query.equal('status', status));
            }

            // Add featured filter
            if (featured !== 'all') {
                queries.push(Query.equal('featured', featured === 'true'));
            }

            // Add pinned filter
            if (pinned !== 'all') {
                queries.push(Query.equal('pinned', pinned === 'true'));
            }

            // Add search filter
            if (searchTerm) {
                queries.push(Query.search('title', searchTerm));
            }

            // Add sorting
            switch (sortBy) {
                case 'oldest':
                    queries.push(Query.orderAsc('$createdAt'));
                    break;
                case 'title':
                    queries.push(Query.orderAsc('title'));
                    break;
                case 'views':
                    queries.push(Query.orderDesc('views'));
                    break;
                default:
                    queries.push(Query.orderDesc('$createdAt'));
            }

            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries
            );

            // Add like counts to each post
            if (response.documents) {
                const postsWithLikes = await Promise.all(
                    response.documents.map(async (post) => {
                        try {
                            const likes = await this.databases.listDocuments(
                                conf.appwriteDatabaseId,
                                conf.appwriteLikesCollectionId,
                                [
                                    Query.equal('postId', post.$id),
                                    Query.limit(1000)
                                ]
                            );
                            return {
                                ...post,
                                likesCount: likes.documents.length
                            };
                        } catch (error) {
                            return {
                                ...post,
                                likesCount: 0
                            };
                        }
                    })
                );

                response.documents = postsWithLikes;
            }

            return response;
        } catch (error) {
            console.error("Error fetching posts with filters:", error);
            throw error;
        }
    }

    // Messages management
    async getMessages(options = {}) {
        try {
            const {
                limit = 50,
                offset = 0,
                userId = '',
                searchTerm = '',
                sortBy = 'newest'
            } = options;

            let queries = [
                Query.limit(limit),
                Query.offset(offset)
            ];

            // Add user filter
            if (userId) {
                queries.push(Query.or([
                    Query.equal('senderId', userId),
                    Query.equal('receiverId', userId)
                ]));
            }

            // Add search filter
            if (searchTerm) {
                queries.push(Query.search('message', searchTerm));
            }

            // Add sorting
            if (sortBy === 'oldest') {
                queries.push(Query.orderAsc('$createdAt'));
            } else {
                queries.push(Query.orderDesc('$createdAt'));
            }

            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteMessagesCollectionId,
                queries
            );
        } catch (error) {
            console.error("Error fetching messages:", error);
            return { documents: [], total: 0 };
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

    // Users management with enhanced data
    async getAllUsers(options = {}) {
        try {
            const {
                limit = 50,
                offset = 0,
                searchTerm = '',
                sortBy = 'newest'
            } = options;

            let queries = [
                Query.limit(limit),
                Query.offset(offset)
            ];

            // Add search filter
            if (searchTerm) {
                queries.push(Query.search('userName', searchTerm));
            }

            // Add sorting
            switch (sortBy) {
                case 'oldest':
                    queries.push(Query.orderAsc('$createdAt'));
                    break;
                case 'name':
                    queries.push(Query.orderAsc('userName'));
                    break;
                default:
                    queries.push(Query.orderDesc('$createdAt'));
            }

            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteProfileCollectionId,
                queries
            );

            // Enhance user data with stats
            const enhancedUsers = await Promise.all(
                response.documents.map(async (user) => {
                    try {
                        // Get user's posts count
                        const userPosts = await this.databases.listDocuments(
                            conf.appwriteDatabaseId,
                            conf.appwriteCollectionId,
                            [Query.equal('userId', user.userId), Query.limit(1000)]
                        );

                        // Get user's messages count
                        const userMessages = await this.databases.listDocuments(
                            conf.appwriteDatabaseId,
                            conf.appwriteMessagesCollectionId,
                            [Query.equal('senderId', user.userId), Query.limit(1000)]
                        );

                        // Calculate likes received
                        let likesReceived = 0;
                        if (userPosts.documents.length > 0) {
                            for (const post of userPosts.documents) {
                                const postLikes = await this.databases.listDocuments(
                                    conf.appwriteDatabaseId,
                                    conf.appwriteLikesCollectionId,
                                    [Query.equal('postId', post.$id), Query.limit(1000)]
                                );
                                likesReceived += postLikes.documents.length;
                            }
                        }

                        return {
                            ...user,
                            postsCount: userPosts.total || 0,
                            messagesCount: userMessages.total || 0,
                            likesReceived
                        };
                    } catch (error) {
                        return {
                            ...user,
                            postsCount: 0,
                            messagesCount: 0,
                            likesReceived: 0
                        };
                    }
                })
            );

            return {
                ...response,
                documents: enhancedUsers
            };
        } catch (error) {
            console.error("Error fetching users:", error);
            return { documents: [], total: 0 };
        }
    }

    // Dashboard and analytics methods
    async getDashboardStats() {
        try {
            const [posts, profiles, messages, likes, bookmarks] = await Promise.allSettled([
                this.getAllPostsForStats(),
                this.getAllProfilesForStats(),
                this.getAllMessagesForStats(),
                this.getAllLikesForStats(),
                this.getAllBookmarksForStats()
            ]);

            const postsData = posts.status === 'fulfilled' ? posts.value : [];
            const profilesData = profiles.status === 'fulfilled' ? profiles.value : [];
            const messagesData = messages.status === 'fulfilled' ? messages.value : [];
            const likesData = likes.status === 'fulfilled' ? likes.value : [];
            const bookmarksData = bookmarks.status === 'fulfilled' ? bookmarks.value : [];

            // Calculate date ranges
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

            // Filter by date
            const todayPosts = postsData.filter(post => post && new Date(post.$createdAt) >= todayStart);
            const yesterdayPosts = postsData.filter(post => {
                if (!post) return false;
                const postDate = new Date(post.$createdAt);
                return postDate >= yesterdayStart && postDate < todayStart;
            });
            
            const todayUsers = profilesData.filter(profile => profile && new Date(profile.$createdAt) >= todayStart);
            const todayMessages = messagesData.filter(message => message && new Date(message.$createdAt) >= todayStart);
            const todayLikes = likesData.filter(like => like && new Date(like.$createdAt) >= todayStart);

            // Calculate growth
            const postsGrowth = yesterdayPosts.length > 0 ? 
                ((todayPosts.length - yesterdayPosts.length) / yesterdayPosts.length * 100) : 
                (todayPosts.length > 0 ? 100 : 0);

            // Count different post types
            const activePosts = postsData.filter(post => post && post.status === 'active');
            const draftPosts = postsData.filter(post => post && post.status === 'inactive');
            const featuredPosts = postsData.filter(post => post && post.featured === true);
            const pinnedPosts = postsData.filter(post => post && post.pinned === true);

            // Calculate total views
            const totalViews = postsData.reduce((sum, post) => sum + ((post && post.views) || 0), 0);

            // Get recent posts and users with like counts
            const recentPostsRaw = [...postsData]
                .filter(post => post && post.$createdAt)
                .sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt))
                .slice(0, 10);

            // Add like counts to recent posts
            const recentPosts = await Promise.all(
                recentPostsRaw.map(async (post) => {
                    const postLikes = likesData.filter(like => like && like.postId === post.$id);
                    return {
                        ...post,
                        likesCount: postLikes.length
                    };
                })
            );
            
            const recentUsers = [...profilesData]
                .filter(user => user && user.$createdAt)
                .sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt))
                .slice(0, 10);

            return {
                totalUsers: profilesData.length,
                totalPosts: postsData.length,
                totalMessages: messagesData.length,
                totalLikes: likesData.length,
                totalBookmarks: bookmarksData.length,
                totalViews,
                
                // Today's stats
                todayUsers: todayUsers.length,
                todayPosts: todayPosts.length,
                todayMessages: todayMessages.length,
                todayLikes: todayLikes.length,
                
                // Yesterday's stats
                yesterdayPosts: yesterdayPosts.length,
                
                // Growth metrics
                postsGrowth: Number(postsGrowth.toFixed(1)),
                usersGrowth: 0,
                engagementGrowth: 0,
                
                // Post types
                activePosts: activePosts.length,
                draftPosts: draftPosts.length,
                featuredPosts: featuredPosts.length,
                pinnedPosts: pinnedPosts.length,
                
                // Recent data
                recentPosts,
                recentUsers,
                
                // System health
                systemHealth: {
                    uptime: 99.9,
                    postsToday: todayPosts.length,
                    usersToday: todayUsers.length
                }
            };
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            throw error;
        }
    }

    async getAnalytics(days = 7) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const [posts, profiles, likes, bookmarks] = await Promise.allSettled([
                this.getAllPostsForStats(),
                this.getAllProfilesForStats(),
                this.getAllLikesForStats(),
                this.getAllBookmarksForStats()
            ]);

            const postsData = posts.status === 'fulfilled' ? posts.value : [];
            const profilesData = profiles.status === 'fulfilled' ? profiles.value : [];
            const likesData = likes.status === 'fulfilled' ? likes.value : [];
            const bookmarksData = bookmarks.status === 'fulfilled' ? bookmarks.value : [];

            // Filter data by date range
            const periodPosts = postsData.filter(post => {
                if (!post || !post.$createdAt) return false;
                const postDate = new Date(post.$createdAt);
                return postDate >= startDate && postDate <= endDate;
            });

            const periodUsers = profilesData.filter(profile => {
                if (!profile || !profile.$createdAt) return false;
                const profileDate = new Date(profile.$createdAt);
                return profileDate >= startDate && profileDate <= endDate;
            });

            const periodLikes = likesData.filter(like => {
                if (!like || !like.$createdAt) return false;
                const likeDate = new Date(like.$createdAt);
                return likeDate >= startDate && likeDate <= endDate;
            });

            const periodBookmarks = bookmarksData.filter(bookmark => {
                if (!bookmark || !bookmark.$createdAt) return false;
                const bookmarkDate = new Date(bookmark.$createdAt);
                return bookmarkDate >= startDate && bookmarkDate <= endDate;
            });

            // Create daily analytics
            const dailyAnalytics = [];
            for (let i = 0; i < days; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toDateString();

                const dayPosts = periodPosts.filter(post => 
                    post && post.$createdAt && new Date(post.$createdAt).toDateString() === dateStr
                );
                const dayUsers = periodUsers.filter(user => 
                    user && user.$createdAt && new Date(user.$createdAt).toDateString() === dateStr
                );
                const dayLikes = periodLikes.filter(like => 
                    like && like.$createdAt && new Date(like.$createdAt).toDateString() === dateStr
                );
                const dayBookmarks = periodBookmarks.filter(bookmark => 
                    bookmark && bookmark.$createdAt && new Date(bookmark.$createdAt).toDateString() === dateStr
                );

                dailyAnalytics.unshift({
                    date: date.toISOString().split('T')[0],
                    posts: dayPosts.length,
                    users: dayUsers.length,
                    likes: dayLikes.length,
                    bookmarks: dayBookmarks.length,
                    engagement: dayLikes.length + dayBookmarks.length
                });
            }

            // Calculate summary
            const summary = {
                totalPosts: periodPosts.length,
                totalUsers: periodUsers.length,
                totalEngagement: periodLikes.length + periodBookmarks.length,
                engagementRate: periodPosts.length > 0 ? 
                    (((periodLikes.length + periodBookmarks.length) / periodPosts.length) * 100).toFixed(1) : 0,
                averagePostsPerDay: (periodPosts.length / days).toFixed(1),
                averageUsersPerDay: (periodUsers.length / days).toFixed(1)
            };

            // Get top performing posts with calculated like counts
            const topPosts = postsData
                .filter(post => post && post.$id)
                .map(post => {
                    const postLikes = likesData.filter(like => like && like.postId === post.$id).length;
                    const postBookmarks = bookmarksData.filter(bookmark => bookmark && bookmark.postId === post.$id).length;
                    const postViews = post.views || 0;
                    
                    const performanceScore = (postViews * 1) + (postLikes * 5) + (postBookmarks * 3);
                    
                    return {
                        ...post,
                        likesCount: postLikes,
                        bookmarksCount: postBookmarks,
                        performanceScore
                    };
                })
                .sort((a, b) => b.performanceScore - a.performanceScore)
                .slice(0, 5);

            // Engagement metrics
            const engagementMetrics = {
                overallEngagement: summary.engagementRate,
                likesRate: postsData.length > 0 ? ((likesData.length / postsData.length) * 100).toFixed(1) : 0,
                bookmarksRate: postsData.length > 0 ? ((bookmarksData.length / postsData.length) * 100).toFixed(1) : 0,
                messagesRate: 0 // Can be calculated if needed
            };

            return {
                dailyAnalytics,
                summary,
                topPosts,
                engagementMetrics,
                period: days
            };
        } catch (error) {
            console.error("Error fetching analytics:", error);
            throw error;
        }
    }

    // Helper methods for stats (keep all existing helper methods)
    async getAllPostsForStats() {
        try {
            let allPosts = [];
            let hasMore = true;
            let offset = 0;
            const limit = 100;

            while (hasMore) {
                const response = await this.databases.listDocuments(
                    conf.appwriteDatabaseId,
                    conf.appwriteCollectionId,
                    [
                        Query.limit(limit),
                        Query.offset(offset),
                        Query.orderDesc('$createdAt')
                    ]
                );

                if (response && response.documents && response.documents.length > 0) {
                    allPosts = [...allPosts, ...response.documents];
                    offset += limit;
                    hasMore = response.documents.length === limit;
                } else {
                    hasMore = false;
                }
            }

            return allPosts;
        } catch (error) {
            console.error("Error fetching all posts for stats:", error);
            return [];
        }
    }

    async getAllProfilesForStats() {
        try {
            let allProfiles = [];
            let hasMore = true;
            let offset = 0;
            const limit = 100;

            while (hasMore) {
                const response = await this.databases.listDocuments(
                    conf.appwriteDatabaseId,
                    conf.appwriteProfileCollectionId,
                    [
                        Query.limit(limit),
                        Query.offset(offset),
                        Query.orderDesc('$createdAt')
                    ]
                );

                if (response && response.documents && response.documents.length > 0) {
                    allProfiles = [...allProfiles, ...response.documents];
                    offset += limit;
                    hasMore = response.documents.length === limit;
                } else {
                    hasMore = false;
                }
            }

            return allProfiles;
        } catch (error) {
            console.error("Error fetching all profiles for stats:", error);
            return [];
        }
    }

    async getAllMessagesForStats() {
        try {
            let allMessages = [];
            let hasMore = true;
            let offset = 0;
            const limit = 100;

            while (hasMore) {
                const response = await this.databases.listDocuments(
                    conf.appwriteDatabaseId,
                    conf.appwriteMessagesCollectionId,
                    [
                        Query.limit(limit),
                        Query.offset(offset),
                        Query.orderDesc('$createdAt')
                    ]
                );

                if (response && response.documents && response.documents.length > 0) {
                    allMessages = [...allMessages, ...response.documents];
                    offset += limit;
                    hasMore = response.documents.length === limit;
                } else {
                    hasMore = false;
                }
            }

            return allMessages;
        } catch (error) {
            console.error("Error fetching all messages for stats:", error);
            return [];
        }
    }

    async getAllLikesForStats() {
        try {
            let allLikes = [];
            let hasMore = true;
            let offset = 0;
            const limit = 100;

            while (hasMore) {
                const response = await this.databases.listDocuments(
                    conf.appwriteDatabaseId,
                    conf.appwriteLikesCollectionId,
                    [
                        Query.limit(limit),
                        Query.offset(offset),
                        Query.orderDesc('$createdAt')
                    ]
                );

                if (response && response.documents && response.documents.length > 0) {
                    allLikes = [...allLikes, ...response.documents];
                    offset += limit;
                    hasMore = response.documents.length === limit;
                } else {
                    hasMore = false;
                }
            }

            return allLikes;
        } catch (error) {
            console.error("Error fetching all likes for stats:", error);
            return [];
        }
    }

    async getAllBookmarksForStats() {
        try {
            let allBookmarks = [];
            let hasMore = true;
            let offset = 0;
            const limit = 100;

            while (hasMore) {
                const response = await this.databases.listDocuments(
                    conf.appwriteDatabaseId,
                    conf.appwriteBookmarksCollectionId,
                    [
                        Query.limit(limit),
                        Query.offset(offset),
                        Query.orderDesc('$createdAt')
                    ]
                );

                if (response && response.documents && response.documents.length > 0) {
                    allBookmarks = [...allBookmarks, ...response.documents];
                    offset += limit;
                    hasMore = response.documents.length === limit;
                } else {
                    hasMore = false;
                }
            }

            return allBookmarks;
        } catch (error) {
            console.error("Error fetching all bookmarks for stats:", error);
            return [];
        }
    }

    // Existing methods
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
}

const adminService = new AdminService();
export default adminService;