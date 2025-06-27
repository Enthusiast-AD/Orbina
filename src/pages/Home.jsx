import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Heart, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Plus,
  Search,
  ArrowRight,
  Star,
  Eye,
  Lock,
  Zap,
  Globe,
  Award,
  ChevronRight,
  Sparkles,
  Timer,
  Target,
  TrophyIcon,
  Grid3X3,
} from 'lucide-react';
import appwriteService from "../appwrite/config";
import messagesService from "../appwrite/messages";
import likesService from "../appwrite/likes";
import { Container, PostCard } from '../components';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Home page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-4">We're sorry, but there was an error loading the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading skeleton component
const PostSkeleton = () => (
  <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 animate-pulse">
    <div className="h-48 bg-slate-700"></div>
    <div className="p-6">
      <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
      <div className="h-3 bg-slate-700 rounded w-full mb-1"></div>
      <div className="h-3 bg-slate-700 rounded w-2/3"></div>
    </div>
  </div>
);

// Optimized Posts Grid with lazy loading
const PostsGrid = React.memo(({ posts, isLoading, hasMore, onLoadMore, showLoadMore = true }) => {
  if (isLoading && posts.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {posts.map((post) => (
          <div key={post.$id} className="transform hover:scale-105 transition-transform duration-200">
            <PostCard {...post} />
          </div>
        ))}
      </div>
      
      {showLoadMore && hasMore && (
        <div className="text-center mt-8">
          <button 
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Loading...' : 'Load More Posts'}
          </button>
        </div>
      )}
    </>
  );
});

function HomeContent() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]); // Store all posts for filtering
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [userStats, setUserStats] = useState({
    totalLikes: 0,
    totalPosts: 0,
    unreadMessages: 0,
    totalUsers: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  
  const searchTerm = useSelector((state) => state.search.term);
  const userData = useSelector((state) => state.auth.userData);
  const authStatus = useSelector((state) => state.auth.status);

  const POSTS_PER_PAGE = authStatus ? 12 : 4;

  // Memoized filtered posts with proper sorting and filtering
  const filteredPosts = useMemo(() => {
    let postsToFilter = [...allPosts];
    
    // Apply search filter first
    if (searchTerm) {
      postsToFilter = postsToFilter.filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filter === 'trending') {
      // Sort by creation date (newest first) for trending
      postsToFilter = postsToFilter
        .filter(post => {
          // Show posts from last 7 days as "trending"
          const postDate = new Date(post.$createdAt);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return postDate >= sevenDaysAgo;
        })
        .sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
    } else {
      // For 'all', sort by creation date (newest first)
      postsToFilter = postsToFilter.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
    }

    return postsToFilter;
  }, [allPosts, searchTerm, filter]);

  // Get posts to display based on pagination
  const displayPosts = useMemo(() => {
    const endIndex = (currentPage + 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(0, endIndex);
  }, [filteredPosts, currentPage, POSTS_PER_PAGE]);

  // Fetch posts with proper sorting
  const fetchPosts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(0);
      }

      // Fetch all posts and sort by creation date (newest first)
      const allPostsData = await appwriteService.getPosts();
      if (allPostsData && allPostsData.documents) {
        // Sort by creation date descending (newest first)
        const sortedPosts = allPostsData.documents.sort((a, b) => 
          new Date(b.$createdAt) - new Date(a.$createdAt)
        );
        
        setAllPosts(sortedPosts);
        
        // Check if there are more posts to load
        const totalFilteredPosts = sortedPosts.length;
        const currentDisplayCount = (currentPage + 1) * POSTS_PER_PAGE;
        setHasMore(currentDisplayCount < totalFilteredPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentPage, POSTS_PER_PAGE]);

  // Load more posts
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setCurrentPage(prev => prev + 1);
      
      // Check if we have more posts after incrementing page
      const newPage = currentPage + 1;
      const totalDisplayAfterLoad = (newPage + 1) * POSTS_PER_PAGE;
      setHasMore(totalDisplayAfterLoad < filteredPosts.length);
      setLoadingMore(false);
    }
  }, [currentPage, loadingMore, hasMore, filteredPosts.length, POSTS_PER_PAGE]);

  // Handle filter change
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    setCurrentPage(0); // Reset pagination when filter changes
  }, []);

  // Fetch user statistics with caching
  const fetchUserStats = useCallback(async () => {
    if (!userData?.$id) return;

    // Check for cached stats
    const cacheKey = `userStats_${userData.$id}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Use cache if less than 5 minutes old
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        setUserStats(data);
        return;
      }
    }

    setStatsLoading(true);
    try {
      const [userPosts, unreadCount] = await Promise.all([
        appwriteService.getPosts(),
        messagesService.getUnreadCount(userData.$id)
      ]);

      const userSpecificPosts = userPosts?.documents?.filter(
        (post) => post.userId === userData.$id
      ) || [];

      let totalLikesReceived = 0;
      const likePromises = userSpecificPosts.map(async (post) => {
        try {
          return await likesService.getLikesCount(post.$id);
        } catch (error) {
          console.error("Error fetching likes for post:", post.$id, error);
          return 0;
        }
      });

      const likes = await Promise.all(likePromises);
      totalLikesReceived = likes.reduce((sum, count) => sum + count, 0);

      const allAuthors = new Set(userPosts?.documents?.map(post => post.userId) || []);

      const stats = {
        totalLikes: totalLikesReceived,
        totalPosts: userSpecificPosts.length,
        unreadMessages: unreadCount,
        totalUsers: allAuthors.size
      };

      setUserStats(stats);

      // Cache the results
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: stats,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [userData?.$id]);

  // Initial load
  useEffect(() => {
    fetchPosts(true);
  }, []);

  // Fetch user stats
  useEffect(() => {
    if (authStatus && userData) {
      fetchUserStats();
    }
  }, [authStatus, userData, fetchUserStats]);

  // Listen for message read events
  useEffect(() => {
    const handleMessagesRead = () => {
      if (authStatus && userData) {
        fetchUserStats();
      }
    };

    window.addEventListener('messagesRead', handleMessagesRead);
    
    return () => {
      window.removeEventListener('messagesRead', handleMessagesRead);
    };
  }, [authStatus, userData, fetchUserStats]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Container>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchPosts(true);
              }} 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      <Container>
        <div className="py-8">
          {/* Enhanced Hero Section for Non-Authenticated Users */}
          {!authStatus && (
            <div className="mb-12">
              {/* Main Hero */}
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-3xl p-12 border border-slate-600/50 relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">Welcome to the Future of Blogging</span>
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                      Share Your{' '}
                      <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                        Stories
                      </span>
                      <br />
                      Connect with{' '}
                      <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Writers
                      </span>
                    </h1>
                    
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
                      Join thousands of writers sharing their passion, connecting with readers, 
                      and building a community around great content.
                    </p>

                    {/* Quick stats for motivation */}
                    <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mb-8">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">10K+</div>
                        <div className="text-slate-400 text-sm">Active Writers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">50K+</div>
                        <div className="text-slate-400 text-sm">Stories Shared</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">1M+</div>
                        <div className="text-slate-400 text-sm">Reads Daily</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button
                        onClick={() => navigate('/signup')}
                        className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-purple-500/25"
                      >
                        <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        Start Writing for Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 border-2 border-slate-500 text-slate-300 hover:text-white hover:border-slate-400 rounded-xl font-semibold transition-colors backdrop-blur-sm"
                      >
                        Welcome Back
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature showcase */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Write & Publish</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Create beautiful stories with our rich text editor. Publish instantly and reach thousands of readers.
                  </p>
                </div>

                <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Connect & Chat</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Message other writers, collaborate on projects, and build meaningful relationships in our community.
                  </p>
                </div>

                <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Grow & Earn</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Build your audience, get featured, and turn your passion for writing into a rewarding experience.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced User Dashboard for Authenticated Users */}
          {authStatus && userData && (
            <div className="mb-8">
              {/* Personalized Welcome */}
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Timer className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-400 font-medium">
                        {new Date().getHours() < 12 ? 'Good Morning' : 
                         new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                      Welcome back, {userData.name}! <TrophyIcon className="w-7 h-7 text-amber-400" />
                    </h1>
                    <p className="text-slate-400">
                      Ready to discover amazing stories and share your thoughts?
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Messages Button with Animation */}
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

                    {/* New Post Button */}
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

              {/* Enhanced Statistics Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="group bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-purple-600/30 rounded-lg group-hover:scale-110 transition-transform">
                      <Heart className="w-5 h-5 text-purple-300" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {statsLoading ? '...' : userStats.totalLikes}
                  </div>
                  <div className="text-purple-300 text-xs">Total Likes</div>
                  <div className="text-purple-400 text-xs mt-1">+12% this week</div>
                </div>

                <div className="group bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-blue-600/30 rounded-lg group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5 text-blue-300" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {statsLoading ? '...' : userStats.totalPosts}
                  </div>
                  <div className="text-blue-300 text-xs">Your Stories</div>
                  <div className="text-blue-400 text-xs mt-1">Keep writing!</div>
                </div>

                <div className="group bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-green-600/30 rounded-lg group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5 text-green-300" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {statsLoading ? '...' : userStats.unreadMessages}
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
                    {statsLoading ? '...' : userStats.totalUsers}
                  </div>
                  <div className="text-orange-300 text-xs">Community</div>
                  <div className="text-orange-400 text-xs mt-1">Growing daily</div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Grid3X3 className="w-6 h-6 text-blue-400" />
                    <span className="text-white font-medium">Quick Actions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/all-posts')}
                      className="px-3 py-2 text-sm  hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Explore All
                    </button>
                    <button
                      onClick={() => navigate('/profile')}
                      className="px-3 py-2 text-sm  hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      My Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Header with Enhanced Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">
                {authStatus ? (
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                    Latest Stories
                  </div>
                ) : '✨ Featured Stories'}
              </h2>
              
              {!authStatus && (
                <div className="flex items-center gap-1 text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                  <Eye className="w-4 h-4" />
                  <span>Preview Mode</span>
                </div>
              )}
              
              {authStatus && (
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
              )}
            </div>

            {authStatus && (
              <button
                onClick={() => navigate('/all-posts')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
              >
                <span className="text-sm">Explore More</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {/* Enhanced Posts Display */}
          {displayPosts.length === 0 && !loading ? (
            <div className="flex w-full py-16 items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {allPosts.length === 0 ? 'No stories yet' : 'No matches found'}
                </h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  {allPosts.length === 0
                    ? 'Be the first to share your story with our community!'
                    : 'Try adjusting your search terms or explore different categories.'}
                </p>
                
                {authStatus ? (
                  <button
                    onClick={() => navigate('/add-post')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Share Your Story
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => navigate('/signup')}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      Join Our Community
                    </button>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-6 py-3 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 rounded-lg font-medium transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <PostsGrid 
                posts={displayPosts}
                isLoading={loading || loadingMore}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                showLoadMore={authStatus}
              />

              {/* Enhanced CTA for non-authenticated users */}
              {!authStatus && allPosts.length > 4 && (
                <div className="mt-16">
                  <div className="bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-red-600/10 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full blur-xl"></div>
                    
                    <div className="relative z-10 text-center">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Lock className="w-8 h-8 text-purple-400" />
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                      </div>
                      
                      <h3 className="text-3xl font-bold text-white mb-4">
                        Unlock the Full Experience
                      </h3>
                      
                      <p className="text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                        You've explored just a taste of our {allPosts.length}+ amazing stories. 
                        Join our thriving community to access unlimited content, connect with writers, 
                        and share your own stories!
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <button
                          onClick={() => navigate('/signup')}
                          className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl"
                        >
                          <Star className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          Join Free - Read All {allPosts.length} Stories
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                          onClick={() => navigate('/login')}
                          className="px-8 py-4 border-2 border-slate-500 text-slate-300 hover:text-white hover:border-slate-400 rounded-xl font-semibold transition-colors backdrop-blur-sm"
                        >
                          Welcome Back
                        </button>
                      </div>

                      {/* Feature highlights */}
                      <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-slate-400 text-sm">Message Writers</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-slate-400 text-sm">Like & Save Stories</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-slate-400 text-sm">Publish Your Stories</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Container>
    </div>
  );
}

// Main component wrapped with error boundary
function Home() {
  return (
    <ErrorBoundary>
      <HomeContent />
    </ErrorBoundary>
  );
}

export default Home;