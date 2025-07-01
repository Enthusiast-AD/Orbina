import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  MessageCircle, Heart, BookOpen, Users, TrendingUp, Plus,
  ArrowRight, Timer, Target, Grid3X3, ChevronRight, Star,
  Search, Pin, Zap, Award, Bell, Activity, RefreshCw
} from 'lucide-react';
import { Container, PostCard } from '../index';
import messagesService from '../../appwrite/messages';
import likesService from '../../appwrite/likes';
import appwriteService from '../../appwrite/config';
import FeaturedPosts from './FeaturedPosts';
import PostSkeleton from './PostSkeleton';
import PostsGrid from './PostsGrid';

const AuthenticatedHome = ({ posts, featuredPosts, pinnedPosts, loading, userData, onRefresh }) => {
  const navigate = useNavigate();
  const searchTerm = useSelector((state) => state.search.term);
  
  const [userStats, setUserStats] = useState({
    totalLikes: 0,
    totalPosts: 0,
    unreadMessages: 0,
    totalUsers: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const POSTS_PER_PAGE = 12;

  // Filter and paginate posts
  const filteredPosts = useMemo(() => {
    let postsToFilter = [...posts];
    
    if (searchTerm) {
      postsToFilter = postsToFilter.filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter === 'trending') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      postsToFilter = postsToFilter.filter(post => 
        new Date(post.$createdAt) >= sevenDaysAgo
      );
    }

    return postsToFilter.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
  }, [posts, searchTerm, filter]);

  const displayPosts = useMemo(() => {
    const endIndex = (currentPage + 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(0, endIndex);
  }, [filteredPosts, currentPage]);

  const hasMore = useMemo(() => {
    return (currentPage + 1) * POSTS_PER_PAGE < filteredPosts.length;
  }, [filteredPosts.length, currentPage]);

  // Fetch user statistics
  const fetchUserStats = useCallback(async () => {
    if (!userData?.$id) return;

    const cacheKey = `userStats_${userData.$id}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 2 * 60 * 1000) { // 2 minutes cache
          setUserStats(data);
          return;
        }
      } catch (error) {
        sessionStorage.removeItem(cacheKey);
      }
    }

    setStatsLoading(true);
    try {
      // Get all posts to calculate stats
      const allPostsResponse = await appwriteService.getPosts();
      const allPosts = allPostsResponse?.documents || [];

      // Filter user's posts
      const userSpecificPosts = allPosts.filter(post => post.userId === userData.$id);

      // Calculate total likes from user's posts
      let totalLikesReceived = 0;
      if (userSpecificPosts.length > 0) {
        const likePromises = userSpecificPosts.map(async (post) => {
          try {
            const likesCount = await likesService.getLikesCount(post.$id);
            return likesCount || 0;
          } catch (error) {
            return 0;
          }
        });

        const likes = await Promise.all(likePromises);
        totalLikesReceived = likes.reduce((sum, count) => sum + count, 0);
      }

      // Get unread messages count
      let unreadCount = 0;
      try {
        unreadCount = await messagesService.getUnreadCount(userData.$id);
      } catch (error) {
        // Messages service might not be available
      }

      // Calculate unique users (authors)
      const allAuthors = new Set();
      allPosts.forEach(post => {
        if (post.userId) {
          allAuthors.add(post.userId);
        }
      });
      const totalUsers = allAuthors.size;

      const stats = {
        totalLikes: totalLikesReceived,
        totalPosts: userSpecificPosts.length,
        unreadMessages: unreadCount,
        totalUsers: totalUsers
      };

      setUserStats(stats);

      // Cache the results
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: stats,
        timestamp: Date.now()
      }));

    } catch (error) {
      // Set fallback stats
      const fallbackStats = {
        totalLikes: 0,
        totalPosts: posts.filter(post => post.userId === userData.$id).length || 0,
        unreadMessages: 0,
        totalUsers: new Set(posts.map(post => post.userId)).size || 1
      };
      setUserStats(fallbackStats);
    } finally {
      setStatsLoading(false);
    }
  }, [userData?.$id, posts]);

  // Fetch stats when component mounts and when posts change
  useEffect(() => {
    if (userData && posts.length > 0) {
      fetchUserStats();
    }
  }, [fetchUserStats, posts.length]);

  // Also fetch when userData changes
  useEffect(() => {
    if (userData) {
      fetchUserStats();
    }
  }, [userData, fetchUserStats]);

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(0);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Clear cache before refresh
    if (userData?.$id) {
      const cacheKey = `userStats_${userData.$id}`;
      sessionStorage.removeItem(cacheKey);
    }
    
    await onRefresh();
    await fetchUserStats();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Container>
      <div className="py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">{getGreeting()}</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  Welcome back, {userData.name}! <Award className="w-7 h-7 text-amber-400" />
                </h1>
                <p className="text-slate-400">
                  Ready to discover amazing stories and share your thoughts?
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-lg"
                  title="Refresh"
                >
                  <RefreshCw className={`w-5 h-5 text-slate-300 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                
                <button
                  onClick={() => navigate('/messages')}
                  className="relative p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-lg"
                  title="Messages"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                  {userStats.unreadMessages > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center animate-pulse">
                      {userStats.unreadMessages > 99 ? '99+' : userStats.unreadMessages}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => navigate('/add-post')}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  New Story
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="group bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 cursor-pointer"
                 onClick={() => navigate('/profile')}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-600/30 rounded-lg group-hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5 text-purple-300" />
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {statsLoading ? (
                  <div className="animate-pulse bg-slate-700 h-8 w-8 rounded"></div>
                ) : (
                  userStats.totalLikes
                )}
              </div>
              <div className="text-purple-300 text-xs">Total Likes</div>
              <div className="text-purple-400 text-xs mt-1">From your stories</div>
            </div>

            <div className="group bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 cursor-pointer"
                 onClick={() => navigate('/profile')}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-600/30 rounded-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 text-blue-300" />
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {statsLoading ? (
                  <div className="animate-pulse bg-slate-700 h-8 w-8 rounded"></div>
                ) : (
                  userStats.totalPosts
                )}
              </div>
              <div className="text-blue-300 text-xs">Your Stories</div>
              <div className="text-blue-400 text-xs mt-1">Keep writing!</div>
            </div>

            <div className="group bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 cursor-pointer"
                 onClick={() => navigate('/messages')}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-600/30 rounded-lg group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5 text-green-300" />
                </div>
                <ChevronRight className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {statsLoading ? (
                  <div className="animate-pulse bg-slate-700 h-8 w-8 rounded"></div>
                ) : (
                  userStats.unreadMessages
                )}
              </div>
              <div className="text-green-300 text-xs">New Messages</div>
              <div className="text-green-400 text-xs mt-1">Stay connected</div>
            </div>

            <div className="group bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-600/30 rounded-lg group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-orange-300" />
                </div>
                <ChevronRight className="w-4 h-4 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {statsLoading ? (
                  <div className="animate-pulse bg-slate-700 h-8 w-8 rounded"></div>
                ) : (
                  userStats.totalUsers
                )}
              </div>
              <div className="text-orange-300 text-xs">Community</div>
              <div className="text-orange-400 text-xs mt-1">Growing daily</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Grid3X3 className="w-6 h-6 text-blue-400" />
                <span className="text-white font-medium">Quick Actions</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/all-posts')}
                  className="px-3 py-2 text-sm hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Explore All
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-3 py-2 text-sm hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  My Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Featured & Pinned Posts */}
        {(featuredPosts.length > 0 || pinnedPosts.length > 0) && (
          <div className="mb-8">
            {pinnedPosts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Pin className="w-5 h-5 text-blue-400" />
                  Pinned Posts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedPosts.map((post) => (
                    <div key={post.$id} className="transform hover:scale-105 transition-transform duration-200">
                      <PostCard {...post} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {featuredPosts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Featured Stories
                </h3>
                <FeaturedPosts posts={featuredPosts.slice(0, 6)} />
              </div>
            )}
          </div>
        )}

        {/* Latest Stories Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              Latest Stories
            </h2>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                All Stories
              </button>
              <button
                onClick={() => handleFilterChange('trending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === 'trending'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Trending
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/all-posts')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <span className="text-sm">Explore More</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Posts Grid */}
        {displayPosts.length === 0 && !loading ? (
          <div className="flex w-full py-16 items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {posts.length === 0 ? 'No stories yet' : 'No matches found'}
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                {posts.length === 0
                  ? 'Be the first to share your story with our community!'
                  : 'Try adjusting your search terms or explore different categories.'}
              </p>
              
              <button
                onClick={() => navigate('/add-post')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Share Your Story
              </button>
            </div>
          </div>
        ) : (
          <PostsGrid 
            posts={displayPosts}
            isLoading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            showLoadMore={true}
          />
        )}
      </div>
    </Container>
  );
};

export default AuthenticatedHome;