import React from 'react';

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

export default PostSkeleton;