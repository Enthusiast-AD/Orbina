import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  MessageCircle, Heart, BookOpen, Users, ArrowRight, Star,
  Eye, Lock, Zap, Award, Sparkles, TrendingUp, Plus,
  Search, Play, CheckCircle, Globe, Timer, Target,
  PieChart, BarChart3, UserPlus, Pen
} from 'lucide-react';
import { Container, PostCard } from '../index';
import FeaturedPosts from './FeaturedPosts';
import PostSkeleton from './PostSkeleton';

const GuestHome = ({ posts, featuredPosts, pinnedPosts, loading }) => {
  const navigate = useNavigate();
  const searchTerm = useSelector((state) => state.search.term);
  const [activeTab, setActiveTab] = useState('featured');

  // Filter posts based on search
  const filteredPosts = useMemo(() => {
    if (!searchTerm) return posts.slice(0, 6); // Show only 6 posts for guests
    
    return posts.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.userName.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 6);
  }, [posts, searchTerm]);

  // Platform statistics (can be real or mock data)
  const platformStats = {
    totalUsers: 15420,
    totalPosts: 48391,
    totalReads: 2540000,
    dailyActiveUsers: 8290
  };

  return (
    <Container>
      <div className="py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-3xl p-12 border border-slate-600/50 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400 font-semibold">Welcome to the Future of Blogging</span>
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
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

              {/* Live Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{platformStats.totalUsers.toLocaleString()}+</div>
                  <div className="text-slate-400 text-sm">Active Writers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{platformStats.totalPosts.toLocaleString()}+</div>
                  <div className="text-slate-400 text-sm">Stories Shared</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{(platformStats.totalReads / 1000000).toFixed(1)}M+</div>
                  <div className="text-slate-400 text-sm">Reads Daily</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{platformStats.dailyActiveUsers.toLocaleString()}</div>
                  <div className="text-slate-400 text-sm">Online Now</div>
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

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
              <Pen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Write & Publish</h3>
            <p className="text-slate-400 leading-relaxed">
              Create beautiful stories with our rich text editor. Publish instantly and reach thousands of readers.
            </p>
            <div className="mt-4 flex items-center text-purple-400 text-sm">
              <Play className="w-4 h-4 mr-2" />
              Try our editor
            </div>
          </div>

          <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Connect & Chat</h3>
            <p className="text-slate-400 leading-relaxed">
              Message other writers, collaborate on projects, and build meaningful relationships in our community.
            </p>
            <div className="mt-4 flex items-center text-blue-400 text-sm">
              <Users className="w-4 h-4 mr-2" />
              Join {platformStats.dailyActiveUsers.toLocaleString()} active users
            </div>
          </div>

          <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Grow & Earn</h3>
            <p className="text-slate-400 leading-relaxed">
              Build your audience, get featured, and turn your passion for writing into a rewarding experience.
            </p>
            <div className="mt-4 flex items-center text-green-400 text-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Start growing today
            </div>
          </div>
        </div>

        {/* Featured & Pinned Posts Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">Discover Amazing Content</h2>
              <div className="flex items-center gap-1 text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                <Eye className="w-4 h-4" />
                <span>Preview Mode</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'featured'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Star className="w-4 h-4 inline mr-2" />
              Featured Stories ({featuredPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('latest')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'latest'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Latest Stories
            </button>
            {pinnedPosts.length > 0 && (
              <button
                onClick={() => setActiveTab('pinned')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'pinned'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                 Pinned ({pinnedPosts.length})
              </button>
            )}
          </div>

          {/* Tab Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <PostSkeleton key={index} />
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'featured' && (
                featuredPosts.length > 0 ? (
                  <FeaturedPosts posts={featuredPosts} />
                ) : (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">No Featured Stories Yet</h3>
                    <p className="text-slate-400">Check back later for curated content from our community!</p>
                  </div>
                )
              )}

              {activeTab === 'latest' && (
                filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                      <div key={post.$id} className="transform hover:scale-105 transition-transform duration-200">
                        <PostCard {...post} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">
                      {searchTerm ? 'No matching stories found' : 'No stories available'}
                    </h3>
                    <p className="text-slate-400">
                      {searchTerm 
                        ? 'Try different search terms or join to see more content'
                        : 'Be the first to share your story!'}
                    </p>
                  </div>
                )
              )}

              {activeTab === 'pinned' && (
                pinnedPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pinnedPosts.map((post) => (
                      <div key={post.$id} className="transform hover:scale-105 transition-transform duration-200">
                        <PostCard {...post} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">No Pinned Stories</h3>
                    <p className="text-slate-400">Important announcements and featured content will appear here</p>
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* Call-to-Action Section */}
        {posts.length > 6 && (
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
                  You've explored just a taste of our {posts.length}+ amazing stories. 
                  Join our thriving community to access unlimited content, connect with writers, 
                  and share your own stories!
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                  <button
                    onClick={() => navigate('/signup')}
                    className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl"
                  >
                    <Star className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Join Free - Read All {posts.length} Stories
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-4 border-2 border-slate-500 text-slate-300 hover:text-white hover:border-slate-400 rounded-xl font-semibold transition-colors backdrop-blur-sm"
                  >
                    Welcome Back
                  </button>
                </div>

                {/* Feature Benefits */}
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

        {/* Join Community Benefits */}
        <div className="mt-16 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Why Join Orbina?</h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Discover what makes our community special and why thousands of writers choose Orbina
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Free Forever</h4>
              <p className="text-slate-400 text-sm">No hidden fees, no premium tiers. Everything is free for everyone.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Global Community</h4>
              <p className="text-slate-400 text-sm">Connect with writers from around the world and share diverse perspectives.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Timer className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Instant Publishing</h4>
              <p className="text-slate-400 text-sm">Write and publish your stories instantly. No waiting, no approval process.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Reach Your Audience</h4>
              <p className="text-slate-400 text-sm">Built-in discovery features help readers find and engage with your content.</p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default GuestHome;