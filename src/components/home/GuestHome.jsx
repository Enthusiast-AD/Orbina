import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  MessageCircle, Heart, BookOpen, Users, ArrowRight, Star,
  Eye, Lock, Zap, Award, Sparkles, TrendingUp, Plus,
  Search, Play, CheckCircle, Globe, Timer, Target,
  PieChart, BarChart3, UserPlus, Pen, LayoutGrid, Share2
} from 'lucide-react';
import { Container, PostCard } from '../index';
import FeaturedPosts from './FeaturedPosts';
import PostSkeleton from './PostSkeleton';

const GuestHome = ({ posts, featuredPosts, pinnedPosts, loading }) => {
  const navigate = useNavigate();
  const searchTerm = useSelector((state) => state.search.term);
  const [activeTab, setActiveTab] = useState('featured');
  const [displayedContent, setDisplayedContent] = useState([]);

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

  useEffect(() => {
    const codeLines = [
      { text: "# The Future of Writing", className: "text-purple-500 font-bold" },
      { text: "" },
      { text: "Writing on Orbina is simple.", className: "text-foreground" },
      { text: "Just focus on your story.", className: "text-foreground" },
      { text: "" },
      { text: "```javascript", className: "text-green-500" },
      { text: "const createStory = () => {", className: "text-blue-400" },
      { text: '  return "Magic happens";', className: "text-yellow-400" },
      { text: "}", className: "text-blue-400" },
      { text: "```", className: "text-green-500" },
    ];

    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let currentLines = [{ text: "", className: codeLines[0].className }];
    let timeoutId;
    let isMounted = true;

    const type = () => {
      if (!isMounted) return;

      if (currentLineIndex >= codeLines.length) {
        timeoutId = setTimeout(() => {
            if (!isMounted) return;
            currentLineIndex = 0;
            currentCharIndex = 0;
            currentLines = [{ text: "", className: codeLines[0].className }];
            setDisplayedContent([...currentLines]);
            type();
        }, 5000);
        return;
      }

      const targetLine = codeLines[currentLineIndex];
      
      if (currentCharIndex < targetLine.text.length) {
        currentLines[currentLineIndex].text += targetLine.text[currentCharIndex];
        setDisplayedContent([...currentLines]);
        currentCharIndex++;
        timeoutId = setTimeout(type, 30 + Math.random() * 30);
      } else {
        currentLineIndex++;
        currentCharIndex = 0;
        if (currentLineIndex < codeLines.length) {
            currentLines.push({ text: "", className: codeLines[currentLineIndex].className });
            setDisplayedContent([...currentLines]);
            timeoutId = setTimeout(type, 100);
        } else {
            type();
        }
      }
    };

    type();
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Container>
      <div className="py-12 space-y-24">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-border bg-card">
          <div className="lg:col-span-7 p-12 lg:p-20 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-border">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium tracking-wider uppercase">
                The Future of Blogging
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight tracking-tight">
              Share Stories. <br />
              <span className="text-muted-foreground">Build Community.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl">
              Orbina is a professional platform for writers and readers. 
              Distraction-free, elegant, and built for content that matters.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="group flex items-center gap-3 px-8 py-4 bg-foreground text-background hover:bg-foreground/90 font-semibold transition-all duration-300 rounded-none"
              >
                Start Writing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 border border-border text-foreground hover:bg-accent font-semibold transition-colors rounded-none"
              >
                Log In
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-accent/20 p-12 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-4 opacity-10">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="bg-foreground/20 w-full h-full"></div>
                ))}
             </div>
             <div className="relative z-10 space-y-8">
                <div className="bg-card border border-border p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-primary/20 flex items-center justify-center">
                      <Pen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Rich Editor</div>
                      <div className="text-xs text-muted-foreground">Write with ease</div>
                    </div>
                  </div>
                  <div className="h-2 bg-accent w-3/4 mb-2"></div>
                  <div className="h-2 bg-accent w-1/2"></div>
                </div>

                <div className="bg-card border border-border p-6 shadow-sm ml-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-blue-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Community</div>
                      <div className="text-xs text-muted-foreground">Connect instantly</div>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 bg-accent border-2 border-card rounded-full"></div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Interactive Features Section */}
        <div>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Orbina?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Everything you need to create, share, and grow your audience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  id: 'write',
                  icon: Pen,
                  title: "Professional Publishing",
                  desc: "Distraction-free editor with markdown support and rich media integration.",
                  color: "text-blue-500",
                  bg: "bg-blue-500/10"
                },
                {
                  id: 'connect',
                  icon: Users,
                  title: "Vibrant Community",
                  desc: "Connect with thousands of writers and readers who share your passion.",
                  color: "text-green-500",
                  bg: "bg-green-500/10"
                },
                {
                  id: 'grow',
                  icon: TrendingUp,
                  title: "Analytics & Growth",
                  desc: "Track your performance with detailed insights and engagement metrics.",
                  color: "text-purple-500",
                  bg: "bg-purple-500/10"
                }
              ].map((feature, idx) => (
                <div 
                  key={feature.id}
                  className="group flex gap-6 p-6 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-300 cursor-pointer"
                >
                  <div className={`w-14 h-14 rounded-full ${feature.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                      {feature.title}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative h-[600px] bg-card border border-border rounded-xl overflow-hidden shadow-2xl flex flex-col">
              {/* Window Controls */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="text-xs text-muted-foreground font-mono">orbina-editor.md</div>
                <div className="w-16"></div>
              </div>
              
              {/* Editor Content */}
              <div className="flex-1 p-6 font-mono text-sm md:text-base overflow-hidden relative bg-card">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                
                {displayedContent.map((line, i) => (
                  <div key={i} className="flex min-h-[1.5em]">
                    <span className="text-muted-foreground/50 select-none w-8 text-right mr-4 shrink-0">{i + 1}</span>
                    <span className={`${line.className} relative`}>
                      {line.text}
                      {i === displayedContent.length - 1 && (
                        <span className="absolute -right-2 top-0 bottom-0 w-2 bg-primary animate-pulse"></span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Status Bar */}
              <div className="bg-primary text-primary-foreground px-4 py-1 text-xs flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span>master*</span>
                  <span>Orbina Editor</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Ln {displayedContent.length}, Col {displayedContent[displayedContent.length-1]?.text.length || 0}</span>
                  <span>UTF-8</span>
                  <span>Markdown</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-y border-border bg-card/50 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">{platformStats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Writers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">{platformStats.totalPosts.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Stories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">{(platformStats.totalReads / 1000000).toFixed(1)}M+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Reads</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">{platformStats.dailyActiveUsers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Active Now</div>
            </div>
          </div>
        </div>

        {/* Featured & Pinned Posts Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
            <h2 className="text-3xl font-bold text-foreground">Discover</h2>
            
            {/* Tab Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('featured')}
                className={`pb-4 text-sm font-medium transition-all duration-200 cursor-pointer border-b-2 -mb-[17px] ${
                  activeTab === 'featured'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Featured
              </button>
              <button
                onClick={() => setActiveTab('latest')}
                className={`pb-4 text-sm font-medium transition-all duration-200 cursor-pointer border-b-2 -mb-[17px] ${
                  activeTab === 'latest'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Latest
              </button>
              {pinnedPosts.length > 0 && (
                <button
                  onClick={() => setActiveTab('pinned')}
                  className={`pb-4 text-sm font-medium transition-all duration-200 cursor-pointer border-b-2 -mb-[17px] ${
                    activeTab === 'pinned'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                   Pinned
                </button>
              )}
            </div>
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
                  <div className="text-center py-20 border border-dashed border-border bg-card/50">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Featured Stories Yet</h3>
                    <p className="text-muted-foreground">Check back later for curated content.</p>
                  </div>
                )
              )}

              {activeTab === 'latest' && (
                filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                      <div key={post.$id} className="group">
                        <PostCard {...post} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 border border-dashed border-border bg-card/50">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {searchTerm ? 'No matching stories found' : 'No stories available'}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? 'Try different search terms.'
                        : 'Be the first to share your story!'}
                    </p>
                  </div>
                )
              )}

              {activeTab === 'pinned' && (
                pinnedPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pinnedPosts.map((post) => (
                      <div key={post.$id} className="group">
                        <PostCard {...post} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 border border-dashed border-border bg-card/50">
                    <h3 className="text-lg font-medium text-foreground mb-2">No Pinned Stories</h3>
                    <p className="text-muted-foreground">Important announcements and featured content will appear here</p>
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* Call-to-Action Section */}
        {posts.length > 6 && (
          <div className="mt-16">
            <div className="bg-card/50 backdrop-blur-sm p-8 border border-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 blur-xl"></div>
              
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </div>
                
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  Unlock the Full Experience
                </h3>
                
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
                  You've explored just a taste of our {posts.length}+ amazing stories. 
                  Join our thriving community to access unlimited content, connect with writers, 
                  and share your own stories!
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                  <button
                    onClick={() => navigate('/signup')}
                    className="group flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl cursor-pointer rounded-none"
                  >
                    <Star className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Join Free - Read All {posts.length} Stories
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-4 border-2 border-muted-foreground/20 text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 font-semibold transition-colors backdrop-blur-sm cursor-pointer rounded-none"
                  >
                    Welcome Back
                  </button>
                </div>

                {/* Feature Benefits */}
                <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-blue-500" />
                    </div>
                    <span className="text-muted-foreground text-sm">Message Writers</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-red-500/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-red-500" />
                    </div>
                    <span className="text-muted-foreground text-sm">Like & Save Stories</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-green-500/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-green-500" />
                    </div>
                    <span className="text-muted-foreground text-sm">Publish Your Stories</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Join Community Benefits */}
        <div className="mt-16 py-12 relative">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">Why Join Orbina?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Discover what makes our community special and why thousands of writers choose Orbina
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Central Tree Trunk */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 -translate-x-1/2 hidden md:block rounded-full"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16 relative">
              {[
                {
                  icon: UserPlus,
                  title: "Free Forever",
                  desc: "No hidden fees, no premium tiers. Everything is free for everyone.",
                  color: "text-primary",
                  bg: "bg-primary/10",
                  side: "left"
                },
                {
                  icon: Globe,
                  title: "Global Community",
                  desc: "Connect with writers from around the world and share diverse perspectives.",
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                  side: "right"
                },
                {
                  icon: Timer,
                  title: "Instant Publishing",
                  desc: "Write and publish your stories instantly. No waiting, no approval process.",
                  color: "text-green-500",
                  bg: "bg-green-500/10",
                  side: "left"
                },
                {
                  icon: Target,
                  title: "Reach Your Audience",
                  desc: "Built-in discovery features help readers find and engage with your content.",
                  color: "text-yellow-500",
                  bg: "bg-yellow-500/10",
                  side: "right"
                }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className={`group relative flex items-center gap-6 ${
                    item.side === 'right' ? 'md:flex-row-reverse md:text-right' : 'md:flex-row md:text-left'
                  } ${item.side === 'right' ? 'md:col-start-2' : 'md:col-start-1'}`}
                >
                  {/* Branch Connector (Desktop) */}
                  <div className={`hidden md:block absolute top-1/2 w-12 h-0.5 bg-border group-hover:bg-primary transition-colors duration-500 ${
                    item.side === 'left' ? '-right-12' : '-left-12'
                  }`}>
                    <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-primary bg-background ${
                      item.side === 'left' ? '-right-1.5' : '-left-1.5'
                    }`}></div>
                  </div>

                  {/* Icon Node */}
                  <div className={`relative z-10 w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border group-hover:border-primary/50 group-hover:bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <h4 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default GuestHome;