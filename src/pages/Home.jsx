import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import appwriteService from "../appwrite/config";
import adminService from "../appwrite/admin";
import likesService from "../appwrite/likes";
import { Container } from '../components';
import GuestHome from '../components/home/GuestHome';
import AuthenticatedHome from '../components/home/AuthenticatedHome';
import ErrorBoundary from '../components/common/ErrorBoundary';

function HomeContent() {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);

  // Enhanced fetch function that includes like counts
  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [allPostsData, featuredData, pinnedData] = await Promise.all([
        appwriteService.getPosts(),
        adminService.getFeaturedPosts(6), // Get 6 featured posts
        adminService.getPinnedPosts(3)    // Get 3 pinned posts
      ]);

      if (allPostsData?.documents) {
        // Filter active posts and add like counts
        const activePosts = allPostsData.documents.filter(post => post.status === 'active');
        
        // Fetch like counts for all posts
        const postsWithLikes = await Promise.all(
          activePosts.map(async (post) => {
            try {
              const likesCount = await likesService.getLikesCount(post.$id);
              return { ...post, likesCount };
            } catch (error) {
              console.error(`Error fetching likes for post ${post.$id}:`, error);
              return { ...post, likesCount: 0 };
            }
          })
        );

        const sortedPosts = postsWithLikes.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
        setPosts(sortedPosts);
      }

      // Add like counts to featured posts
      if (featuredData && featuredData.length > 0) {
        const featuredWithLikes = await Promise.all(
          featuredData.map(async (post) => {
            try {
              const likesCount = await likesService.getLikesCount(post.$id);
              return { ...post, likesCount };
            } catch (error) {
              return { ...post, likesCount: 0 };
            }
          })
        );
        setFeaturedPosts(featuredWithLikes);
      } else {
        setFeaturedPosts([]);
      }

      // Add like counts to pinned posts
      if (pinnedData && pinnedData.length > 0) {
        const pinnedWithLikes = await Promise.all(
          pinnedData.map(async (post) => {
            try {
              const likesCount = await likesService.getLikesCount(post.$id);
              return { ...post, likesCount };
            } catch (error) {
              return { ...post, likesCount: 0 };
            }
          })
        );
        setPinnedPosts(pinnedWithLikes);
      } else {
        setPinnedPosts([]);
      }
      
    } catch (error) {
      console.error('Error fetching home data:', error);
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  // Retry function
  const handleRetry = () => {
    setError(null);
    fetchHomeData();
  };

  // Error state
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
              onClick={handleRetry}
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
      {authStatus ? (
        <AuthenticatedHome 
          posts={posts}
          featuredPosts={featuredPosts}
          pinnedPosts={pinnedPosts}
          loading={loading}
          userData={userData}
          onRefresh={fetchHomeData}
        />
      ) : (
        <GuestHome 
          posts={posts}
          featuredPosts={featuredPosts}
          pinnedPosts={pinnedPosts}
          loading={loading}
          onRefresh={fetchHomeData}
        />
      )}
    </div>
  );
}

function Home() {
  return (
    <ErrorBoundary>
      <HomeContent />
    </ErrorBoundary>
  );
}

export default Home;