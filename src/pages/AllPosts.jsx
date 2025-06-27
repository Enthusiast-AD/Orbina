import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Container, PostCard } from '../components';
import appwriteService from "../appwrite/config";
import { Search, Filter, SortAsc, Grid, List, RefreshCw, AlertCircle } from 'lucide-react';

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
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

// Loading skeleton
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

function AllPostsContent() {
  const [allPosts, setAllPosts] = useState([]); // Store all posts for filtering
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const searchTerm = useSelector((state) => state.search.term);
  const POSTS_PER_PAGE = 12;

  // Memoized filtered and sorted posts
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
      default:
        return filtered.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
    }
  }, [allPosts, searchTerm, sortBy]);

  // Get posts to display based on pagination
  const displayPosts = useMemo(() => {
    const endIndex = (currentPage + 1) * POSTS_PER_PAGE;
    return processedPosts.slice(0, endIndex);
  }, [processedPosts, currentPage, POSTS_PER_PAGE]);

  // Fetch all posts with proper sorting
  const fetchAllPosts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(0);
      }

      // Fetch all posts and sort by creation date (newest first)
      const response = await appwriteService.getPosts();
      if (response && response.documents) {
        // Sort by creation date descending (newest first)
        const sortedPosts = response.documents.sort((a, b) => 
          new Date(b.$createdAt) - new Date(a.$createdAt)
        );
        
        setAllPosts(sortedPosts);
        
        // Check if there are more posts to load
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

  // Load more posts
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setCurrentPage(prev => prev + 1);
      
      // Check if we have more posts after incrementing page
      const newPage = currentPage + 1;
      const totalDisplayAfterLoad = (newPage + 1) * POSTS_PER_PAGE;
      setHasMore(totalDisplayAfterLoad < processedPosts.length);
      setLoadingMore(false);
    }
  }, [currentPage, loadingMore, hasMore, processedPosts.length, POSTS_PER_PAGE]);

  // Refresh posts
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(0);
    fetchAllPosts(true);
  }, [fetchAllPosts]);

  // Handle sort change
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    setCurrentPage(0); // Reset pagination when sort changes
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllPosts(true);
  }, []);

  // Update hasMore when processedPosts changes
  useEffect(() => {
    const totalDisplayAfterLoad = (currentPage + 1) * POSTS_PER_PAGE;
    setHasMore(totalDisplayAfterLoad < processedPosts.length);
  }, [processedPosts.length, currentPage, POSTS_PER_PAGE]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Container>
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => {
                  setError(null);
                  fetchAllPosts(true);
                }} 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 rounded-lg transition-colors"
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
    <div className='w-full py-8 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      <Container>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">All Stories</h1>
              <p className="text-slate-400">
                Discover amazing content from our community of writers
                {displayPosts.length > 0 && (
                  <span className="ml-2">• {displayPosts.length} of {processedPosts.length} stories shown</span>
                )}
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="author">Author A-Z</option>
                </select>
              </div>

              {/* Search indicator */}
              {searchTerm && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Search className="w-4 h-4" />
                  <span>Searching for "{searchTerm}"</span>
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {Array.from({ length: 8 }).map((_, index) => (
              <PostSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Posts Display */}
        {!loading && (
          <>
            {displayPosts.length === 0 ? (
              <div className="flex w-full py-16 items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {searchTerm ? 'No matching stories found' : 'No stories available'}
                  </h3>
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    {searchTerm 
                      ? `We couldn't find any stories matching "${searchTerm}". Try different keywords or browse all content.`
                      : 'Be the first to share your story with our community!'
                    }
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {searchTerm ? (
                      <button
                        onClick={() => {
                          // Refresh the page to clear search
                          window.location.reload();
                        }}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Clear Search
                      </button>
                    ) : (
                      <button
                        onClick={() => window.location.href = '/add-post'}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                      >
                        Share Your Story
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1 max-w-4xl mx-auto'
                }`}>
                  {displayPosts.map((post) => (
                    <div 
                      key={post.$id} 
                      className={`transform hover:scale-105 transition-transform duration-200 ${
                        viewMode === 'list' ? 'hover:scale-[1.02]' : ''
                      }`}
                    >
                      <PostCard {...post} viewMode={viewMode} />
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-12">
                    <button 
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-8 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                    >
                      {loadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </>
                      ) : (
                        'Load More Stories'
                      )}
                    </button>
                  </div>
                )}

                {/* Load More Progress */}
                {loadingMore && (
                  <div className={`grid gap-6 mt-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1 max-w-4xl mx-auto'
                  }`}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <PostSkeleton key={`loading-${index}`} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Stats Footer */}
        {!loading && displayPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-800">
            <div className="text-center text-slate-400">
              <p className="text-sm">
                Showing {displayPosts.length} of {processedPosts.length} stories
                {searchTerm && ` matching "${searchTerm}"`}
                {allPosts.length !== processedPosts.length && ` (${allPosts.length} total stories)`}
              </p>
              {hasMore && (
                <p className="text-xs mt-1">
                  Scroll down or click "Load More" to see additional stories
                </p>
              )}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

// Main component wrapped with error boundary
function AllPosts() {
  return (
    <ErrorBoundary>
      <AllPostsContent />
    </ErrorBoundary>
  );
}

export default AllPosts;