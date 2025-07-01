import React from 'react';
import { Star, Eye, Heart, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import appwriteService from '../../appwrite/config';

const FeaturedPosts = ({ posts }) => {
  const navigate = useNavigate();

  if (!posts || posts.length === 0) return null;

  const mainPost = posts[0];
  const sidePosts = posts.slice(1, 5);

  // Format number for display
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Clean content for preview
  const cleanContent = (content) => {
    if (!content) return '';
    return content.replace(/<[^>]*>/g, '').slice(0, 150);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Featured Post */}
      <div className="lg:col-span-2">
        <div 
          className="group relative bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
          onClick={() => navigate(`/post/${mainPost.$id}`)}
        >
          {mainPost.featuredImage && (
            <div className="relative h-64 overflow-hidden">
              <img
                src={appwriteService.getFileView(mainPost.featuredImage)}
                alt={mainPost.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              {/* Featured Badge */}
              <div className="absolute top-4 left-4">
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                  <Star className="w-3 h-3" />
                  FEATURED
                </span>
              </div>

              {/* Stats Overlay */}
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <div className="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
                  <Eye className="w-3 h-3" />
                  {formatNumber(mainPost.views || 0)}
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
                  <Heart className="w-3 h-3" />
                  {formatNumber(mainPost.likesCount || 0)}
                </div>
              </div>
            </div>
          )}
          
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
              {mainPost.title}
            </h3>
            <p className="text-slate-400 mb-4 line-clamp-3">
              {cleanContent(mainPost.content)}...
            </p>
            
            {/* Bottom Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(mainPost.$createdAt).toLocaleDateString()}
                </span>
                <span>by {mainPost.userName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatNumber(mainPost.views || 0)} views
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {formatNumber(mainPost.likesCount || 0)} likes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Featured Posts */}
      <div className="space-y-4">
        {sidePosts.map((post, index) => (
          <div
            key={post.$id}
            className="group bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
            onClick={() => navigate(`/post/${post.$id}`)}
          >
            <div className="flex gap-3">
              {/* Small thumbnail for side posts */}
              {post.featuredImage && (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden relative">
                  <img
                    src={appwriteService.getFileView(post.featuredImage)}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {/* Mini stats overlay */}
                  <div className="absolute bottom-1 right-1 flex items-center gap-1">
                    <div className="flex items-center gap-1 px-1 py-0.5 bg-black/70 rounded text-white text-xs">
                      <Eye className="w-2 h-2" />
                      {formatNumber(post.views || 0)}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-yellow-400 font-medium">FEATURED #{index + 2}</span>
                </div>
                <h4 className="text-white font-semibold mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                  {cleanContent(post.content)}...
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>by {post.userName}</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatNumber(post.views || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {formatNumber(post.likesCount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedPosts;