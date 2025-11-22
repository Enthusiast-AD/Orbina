import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, PostCard, StatsCard } from '../components';
import appwriteService from "../appwrite/config";
import likesService from "../appwrite/likes";
import { 
  Search, Filter, SortAsc, Grid, List, RefreshCw, AlertCircle, 
  TrendingUp, Clock, Heart, Eye, Sparkles, Users, Star,
  ArrowUp, BookOpen, Zap, Target, Award, Timer
} from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AllPosts Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background bg-grid-pattern flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-none flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Oops! Something went wrong</h2>
            <p className="text-muted-foreground mb-6">Don't worry, our team has been notified.</p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-none transition-colors font-medium"
              >
                Reload Page
              </button>
              <button 
                onClick={() => window.location.href = '/'} 
                className="px-6 py-3 border border-border text-muted-foreground hover:text-foreground hover:border-foreground rounded-none transition-colors font-medium"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Enhanced Post Skeleton with views/likes placeholders
const PostSkeleton = ({ viewMode = 'grid', className = '' }) => {
  if (viewMode === 'list') {
    return (
      <div className={`bg-card rounded-none p-6 border border-border animate-pulse ${className}`}>
        <div className="flex gap-6">
          <div className="w-48 h-32 bg-muted rounded-none flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-6 bg-muted rounded-none w-3/4 mb-3"></div>
            <div className="h-4 bg-muted rounded-none w-full mb-2"></div>
            <div className="h-4 bg-muted rounded-none w-2/3 mb-4"></div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-muted rounded-none"></div>
              <div className="h-3 bg-muted rounded-none w-24"></div>
              <div className="h-3 bg-muted rounded-none w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-none overflow-hidden border border-border animate-pulse h-full flex flex-col ${className}`}>
      <div className="aspect-[1.91/1] bg-muted relative w-full">
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="w-12 h-6 bg-background/50 rounded-none"></div>
          <div className="w-12 h-6 bg-background/50 rounded-none"></div>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="h-6 bg-muted rounded-none w-3/4 mb-3"></div>
        <div className="h-4 bg-muted rounded-none w-full mb-2"></div>
        <div className="h-4 bg-muted rounded-none w-2/3 mb-auto"></div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-none"></div>
            <div className="h-4 bg-muted rounded-none w-20"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 bg-muted rounded-none w-8"></div>
            <div className="h-3 bg-muted rounded-none w-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

function AllPostsContent() {
  const navigate = useNavigate();
  const [allPosts, setAllPosts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalAuthors: 0
  });
  
  const searchTerm = useSelector((state) => state.search.term);
  const userData = useSelector((state) => state.auth.userData);
  const POSTS_PER_PAGE = 12;

  // Enhanced posts processing with views and likes
  const processedPosts = useMemo(() => {
    let filtered = [...allPosts];
    
    // Apply search filter
    if (searchTerm) {
      filtered = allPosts.filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.userName && post.userName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.$createdAt) - new Date(b.$createdAt));
      case 'title':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case 'author':
        return filtered.sort((a, b) => (a.userName || '').localeCompare(b.userName || ''));
      case 'views':
        return filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'likes':
        return filtered.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      case 'trending':
        // Sort by engagement score (views + likes * 2)
        return filtered.sort((a, b) => {
          const scoreA = (a.views || 0) + (a.likesCount || 0) * 2;
          const scoreB = (b.views || 0) + (b.likesCount || 0) * 2;
          return scoreB - scoreA;
        });
      default:
        return filtered.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
    }
  }, [allPosts, searchTerm, sortBy]);

  // Display posts with pagination
  const displayPosts = useMemo(() => {
    const endIndex = (currentPage + 1) * POSTS_PER_PAGE;
    return processedPosts.slice(0, endIndex);
  }, [processedPosts, currentPage, POSTS_PER_PAGE]);

  // Format number for display
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Enhanced fetch function with likes and views
  const fetchAllPosts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(0);
      }

      console.log('Fetching all posts...');
      const response = await appwriteService.getPosts();
      console.log('Posts response:', response);
      
      if (response && response.documents) {
        console.log('Processing posts with likes...');
        // Enhance posts with likes count
        const enhancedPosts = await Promise.all(
          response.documents.map(async (post) => {
            try {
              const likesCount = await likesService.getLikesCount(post.$id);
              console.log(`Post ${post.$id}: ${likesCount} likes, ${post.views || 0} views`);
              return { 
                ...post, 
                likesCount,
                views: post.views || 0
              };
            } catch (error) {
              console.error(`Error fetching likes for post ${post.$id}:`, error);
              return { 
                ...post, 
                likesCount: 0, 
                views: post.views || 0 
              };
            }
          })
        );
        
        const sortedPosts = enhancedPosts.sort((a, b) => 
          new Date(b.$createdAt) - new Date(a.$createdAt)
        );
        
        setAllPosts(sortedPosts);
        
        // Calculate stats
        const totalViews = sortedPosts.reduce((sum, post) => sum + (post.views || 0), 0);
        const totalLikes = sortedPosts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
        const uniqueAuthors = new Set(sortedPosts.map(post => post.userId)).size;
        
        const calculatedStats = {
          totalPosts: sortedPosts.length,
          totalViews,
          totalLikes,
          totalAuthors: uniqueAuthors
        };
        
        console.log('Calculated stats:', calculatedStats);
        setStats(calculatedStats);
        
        const totalFilteredPosts = sortedPosts.length;
        const currentDisplayCount = (currentPage + 1) * POSTS_PER_PAGE;
        setHasMore(currentDisplayCount < totalFilteredPosts);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [currentPage, POSTS_PER_PAGE]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setCurrentPage(prev => prev + 1);
      
      const newPage = currentPage + 1;
      const totalDisplayAfterLoad = (newPage + 1) * POSTS_PER_PAGE;
      setHasMore(totalDisplayAfterLoad < processedPosts.length);
      setLoadingMore(false);
    }
  }, [currentPage, loadingMore, hasMore, processedPosts.length, POSTS_PER_PAGE]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(0);
    fetchAllPosts(true);
  }, [fetchAllPosts]);

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    setCurrentPage(0); 
  }, []);

  useEffect(() => {
    fetchAllPosts(true);
  }, []);

  useEffect(() => {
    const totalDisplayAfterLoad = (currentPage + 1) * POSTS_PER_PAGE;
    setHasMore(totalDisplayAfterLoad < processedPosts.length);
  }, [processedPosts.length, currentPage, POSTS_PER_PAGE]);

  if (error) {
    return (
      <div className="min-h-screen bg-background bg-grid-pattern flex items-center justify-center">
        <Container>
          <div className="text-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-none flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => {
                  setError(null);
                  fetchAllPosts(true);
                }} 
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-none transition-colors font-medium"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 border border-border text-muted-foreground hover:text-foreground hover:border-foreground rounded-none transition-colors font-medium"
              >
                Reload Page
              </button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className='w-full py-8 min-h-screen'>
      <Container>
        {/* Enhanced Header with Stats */}
        <div className="mb-8">
          {/* Title Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">All Stories</h1>
                <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-600 rounded-none text-sm">
                  <Zap className="w-3 h-3" />
                  Live
                </div>
              </div>
              <p className="text-muted-foreground">
                Discover amazing content from our community of {stats.totalAuthors} writers
                {displayPosts.length > 0 && (
                  <span className="ml-2">• {displayPosts.length} of {processedPosts.length} stories shown</span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-none transition-colors font-medium border border-border ${
                  showFilters ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent text-foreground'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-accent disabled:opacity-50 text-foreground rounded-none transition-colors font-medium border border-border"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              icon={BookOpen}
              label="Total Stories"
              value={formatNumber(stats.totalPosts)}
              color="bg-card border-border text-foreground hover:border-primary"
              trend="+12%"
            />
            <StatsCard
              icon={Eye}
              label="Total Views"
              value={formatNumber(stats.totalViews)}
              color="bg-card border-border text-foreground hover:border-green-500"
              trend="+24%"
            />
            <StatsCard
              icon={Heart}
              label="Total Likes"
              value={formatNumber(stats.totalLikes)}
              color="bg-card border-border text-foreground hover:border-red-500"
              trend="+8%"
            />
            <StatsCard
              icon={Users}
              label="Authors"
              value={formatNumber(stats.totalAuthors)}
              color="bg-card border-border text-foreground hover:border-purple-500"
              trend="+5%"
            />
          </div>
          
          {/* Enhanced Filters */}
          {showFilters && (
            <div className="bg-card rounded-none p-6 border border-border mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <SortAsc className="w-4 h-4 text-muted-foreground" />
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="bg-background border border-border text-foreground rounded-none px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="newest">🆕 Newest First</option>
                      <option value="oldest">📅 Oldest First</option>
                      <option value="trending">🔥 Trending</option>
                      <option value="views">👁️ Most Viewed</option>
                      <option value="likes">❤️ Most Liked</option>
                      <option value="title">📝 Title A-Z</option>
                      <option value="author">👤 Author A-Z</option>
                    </select>
                  </div>

                  {/* Search Indicator */}
                  {searchTerm && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-none text-sm">
                      <Search className="w-3 h-3" />
                      <span>"{searchTerm}"</span>
                      <button 
                        onClick={() => window.location.reload()}
                        className="text-primary hover:text-primary/80"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-muted rounded-none p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-none transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-none transition-colors ${
                      viewMode === 'list'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[300px] grid-flow-dense' 
              : 'grid-cols-1 max-w-4xl mx-auto'
          }`}>
            {Array.from({ length: 8 }).map((_, index) => {
               let spanClasses = "";
               if (viewMode === 'grid') {
                 const patternIndex = index % 7;
                 if (patternIndex === 0) spanClasses = "md:col-span-2 md:row-span-2";
                 else if (patternIndex === 1) spanClasses = "md:col-span-2 md:row-span-1";
                 else if (patternIndex === 4) spanClasses = "md:col-span-2 md:row-span-1";
                 else spanClasses = "md:col-span-1 md:row-span-1";
               }
               return (
                 <div key={index} className={`${spanClasses} h-full`}>
                   <PostSkeleton viewMode={viewMode} className="h-full" />
                 </div>
               );
            })}
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {displayPosts.length === 0 ? (
              <div className="flex w-full py-16 items-center justify-center">
                <div className="text-center max-w-lg">
                  <div className="w-24 h-24 bg-primary/10 rounded-none flex items-center justify-center mx-auto mb-6">
                    {searchTerm ? (
                      <Search className="w-12 h-12 text-primary" />
                    ) : (
                      <Sparkles className="w-12 h-12 text-primary" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {searchTerm ? `No stories found for "${searchTerm}"` : 'No stories available yet'}
                  </h3>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    {searchTerm 
                      ? `Try different keywords or explore our trending content.`
                      : 'Be the first to share your story and inspire others in our community!'
                    }
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {searchTerm ? (
                      <>
                        <button
                          onClick={() => window.location.reload()}
                          className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-none font-medium transition-colors"
                        >
                          Clear Search
                        </button>
                        <button
                          onClick={() => navigate('/')}
                          className="px-6 py-3 border border-border text-muted-foreground hover:text-foreground hover:border-foreground rounded-none transition-colors font-medium"
                        >
                          Browse All
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate('/add-post')}
                          className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-none font-semibold transition-all duration-300 hover:translate-y-[-2px]"
                        >
                          Share Your Story
                        </button>
                        {userData && (
                          <button
                            onClick={() => navigate('/profile')}
                            className="px-6 py-3 border border-border text-muted-foreground hover:text-foreground hover:border-foreground rounded-none transition-colors font-medium"
                          >
                            My Profile
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Posts Grid */}
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[300px] grid-flow-dense' 
                    : 'grid-cols-1 max-w-4xl mx-auto'
                }`}>
                  {displayPosts.map((post, index) => {
                    // Bento grid logic
                    let spanClasses = "";
                    if (viewMode === 'grid') {
                      const patternIndex = index % 7;
                      if (patternIndex === 0) spanClasses = "md:col-span-2 md:row-span-2"; // Item 0: 2x2
                      else if (patternIndex === 1) spanClasses = "md:col-span-2 md:row-span-1"; // Item 1: 2x1
                      else if (patternIndex === 4) spanClasses = "md:col-span-2 md:row-span-1"; // Item 4: 2x1
                      else spanClasses = "md:col-span-1 md:row-span-1"; // Items 2,3,5,6: 1x1
                    }

                    return (
                      <div 
                        key={post.$id} 
                        className={`transform transition-all duration-300 ${spanClasses} ${
                          viewMode === 'list' ? 'hover:scale-[1.02]' : 'hover:translate-y-[-4px] h-full'
                        }`}
                        style={{ 
                          animationDelay: `${index * 50}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        <PostCard 
                          {...post} 
                          viewMode={viewMode}
                          views={post.views || 0}
                          likesCount={post.likesCount || 0}
                          showStats={true}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-12">
                    <button 
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="group px-8 py-4 bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-foreground border border-border rounded-none font-medium transition-all duration-300 hover:translate-y-[-2px] shadow-sm flex items-center gap-3 mx-auto"
                    >
                      {loadingMore ? (
                        <>
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          Loading more stories...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform text-primary" />
                          Load More Stories
                          <ArrowUp className="w-4 h-4 rotate-180 group-hover:translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Loading More Skeletons */}
                {loadingMore && (
                  <div className={`grid gap-6 mt-8 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1 max-w-4xl mx-auto'
                  }`}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <PostSkeleton key={`loading-${index}`} viewMode={viewMode} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Enhanced Footer Stats */}
        {!loading && displayPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border">
            <div className="bg-card rounded-none p-6 border border-border">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Browsing Statistics
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>📚 Showing {displayPosts.length} of {processedPosts.length} stories</p>
                    {searchTerm && <p>🔍 Results for "{searchTerm}"</p>}
                    {allPosts.length !== processedPosts.length && (
                      <p>📊 {allPosts.length} total stories in library</p>
                    )}
                    <p>⏱️ Last updated: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Community Insights
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>👀 {formatNumber(stats.totalViews)} total views across all stories</p>
                    <p>❤️ {formatNumber(stats.totalLikes)} likes from our community</p>
                    <p>✍️ {formatNumber(stats.totalAuthors)} talented authors</p>
                    {hasMore && <p>📖 {formatNumber(processedPosts.length - displayPosts.length)} more stories to discover</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>

      {/* Scroll to Top Button */}
      {displayPosts.length > 8 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-none shadow-lg transition-all duration-300 z-40 hover:translate-y-[-2px] group"
          title="Scroll to top"
        >
          <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-200" />
        </button>
      )}

      {/* Floating Action Button for New Users */}
      {!userData && !loading && displayPosts.length > 0 && (
        <div className="fixed bottom-8 left-8 z-40">
          <div className="bg-primary rounded-none p-4 shadow-lg hover:translate-y-[-2px] transition-all duration-300 cursor-pointer group"
               onClick={() => navigate('/signup')}>
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-primary-foreground group-hover:rotate-12 transition-transform" />
              <span className="text-primary-foreground font-medium hidden md:block">Join Our Community</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Main Component with Error Boundary
function AllPosts() {
  return (
    <ErrorBoundary>
      <AllPostsContent />
    </ErrorBoundary>
  );
}

export default AllPosts;