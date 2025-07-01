import React from 'react';
import { PostCard } from '../index';
import PostSkeleton from './PostSkeleton';

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
            <PostCard 
              {...post} 
              views={post.views || 0}
              likesCount={post.likesCount || 0}
            />
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

export default PostsGrid;