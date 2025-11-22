import React from 'react';

const PostSkeleton = ({ viewMode = 'grid', className = '' }) => {
  if (viewMode === 'list') {
    return (
      <div className={`bg-card/50 border border-border animate-pulse flex gap-6 p-6 ${className}`}>
        <div className="w-48 h-32 bg-muted flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-6 bg-muted w-3/4 mb-3"></div>
          <div className="h-4 bg-muted w-full mb-2"></div>
          <div className="h-4 bg-muted w-2/3 mb-4"></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted"></div>
            <div className="h-4 bg-muted w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card/50 overflow-hidden border border-border animate-pulse h-full flex flex-col ${className}`}>
      <div className="h-48 bg-muted w-full"></div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="h-6 bg-muted w-3/4 mb-3"></div>
        <div className="h-4 bg-muted w-full mb-2"></div>
        <div className="h-4 bg-muted w-2/3 mb-auto"></div>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
          <div className="w-8 h-8 rounded-full bg-muted"></div>
          <div className="h-4 bg-muted w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default PostSkeleton;