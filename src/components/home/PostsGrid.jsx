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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[300px] grid-flow-dense">
        {posts.map((post, index) => {
          // Bento grid logic
          let className = "h-full group relative overflow-hidden transition-all duration-300 hover:shadow-lg border border-border bg-card";
          
          const patternIndex = index % 7;
          
          if (patternIndex === 0) {
            className += " md:col-span-2 md:row-span-2";
          } else if (patternIndex === 1) {
            className += " md:col-span-1 md:row-span-2";
          } else if (patternIndex === 4) {
            className += " md:col-span-2 md:row-span-1";
          } else {
            className += " md:col-span-1 md:row-span-1";
          }
          
          return (
            <div key={post.$id} className={className}>
              <div className="h-full w-full">
                <PostCard 
                  {...post} 
                  views={post.views || 0}
                  likesCount={post.likesCount || 0}
                  className="h-full w-full"
                  simple={true} // Pass a prop to simplify card internals if needed for small tiles
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {showLoadMore && hasMore && (
        <div className="text-center mt-8">
          <button 
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-secondary hover:bg-secondary/80 disabled:opacity-50 text-secondary-foreground font-medium transition-colors cursor-pointer"
          >
            {isLoading ? 'Loading...' : 'Load More Posts'}
          </button>
        </div>
      )}
    </>
  );
});

export default PostsGrid;