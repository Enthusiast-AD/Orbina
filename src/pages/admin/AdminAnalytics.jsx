import React, { useState, useEffect } from 'react';
import { 
    BarChart3, TrendingUp, Users, FileText, Heart, MessageSquare,
    Calendar, Download, RefreshCw, PieChart, Target, Bookmark,
    Clock
} from 'lucide-react';
import adminService from '../../appwrite/admin';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeframe, setTimeframe] = useState(30);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAnalytics(timeframe);
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [timeframe]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchAnalytics();
        toast.success('Analytics refreshed');
    };

    const exportData = () => {
        if (!analytics) return;
        
        const data = {
            timeframe: `${timeframe} days`,
            exportDate: new Date().toISOString(),
            summary: analytics.summary,
            topPosts: analytics.topPosts,
            engagementMetrics: analytics.engagementMetrics,
            dailyAnalytics: analytics.dailyAnalytics
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orbina-analytics-${timeframe}days-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Analytics data exported');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-purple-400" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Platform performance metrics and insights
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(Number(e.target.value))}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={14}>Last 14 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                    
                    <button
                        onClick={exportData}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-300 text-sm mb-1">Total Posts</p>
                            <p className="text-3xl font-bold text-white">{analytics?.summary?.totalPosts || 0}</p>
                            <p className="text-blue-400 text-xs mt-1">
                                Avg: {analytics?.summary?.averagePostsPerDay || 0}/day
                            </p>
                        </div>
                        <FileText className="w-12 h-12 text-blue-400" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-300 text-sm mb-1">New Users</p>
                            <p className="text-3xl font-bold text-white">{analytics?.summary?.totalUsers || 0}</p>
                            <p className="text-green-400 text-xs mt-1">
                                Avg: {analytics?.summary?.averageUsersPerDay || 0}/day
                            </p>
                        </div>
                        <Users className="w-12 h-12 text-green-400" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-300 text-sm mb-1">Total Engagement</p>
                            <p className="text-3xl font-bold text-white">{analytics?.summary?.totalEngagement || 0}</p>
                            <p className="text-purple-400 text-xs mt-1">
                                Rate: {analytics?.summary?.engagementRate || 0}%
                            </p>
                        </div>
                        <Heart className="w-12 h-12 text-purple-400" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-300 text-sm mb-1">Engagement Rate</p>
                            <p className="text-3xl font-bold text-white">{analytics?.engagementMetrics?.overallEngagement || 0}%</p>
                            <p className="text-yellow-400 text-xs mt-1">Platform average</p>
                        </div>
                        <Target className="w-12 h-12 text-yellow-400" />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Activity Chart */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        Daily Activity ({timeframe} days)
                    </h3>
                    <div className="space-y-4">
                        {analytics?.dailyAnalytics?.slice(-7).map((day, index) => (
                            <div key={day.date} className="flex items-center gap-4">
                                <div className="w-16 text-sm text-slate-400">
                                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-full bg-slate-700 rounded-full h-2">
                                            <div 
                                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${Math.min((day.posts / Math.max(...analytics.dailyAnalytics.map(d => d.posts))) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-white text-sm font-medium">{day.posts}</span>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {day.users} users, {day.engagement} engagement
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Engagement Metrics */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-400" />
                        Engagement Breakdown
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Heart className="w-5 h-5 text-red-400" />
                                <span className="text-white">Likes</span>
                            </div>
                            <div className="text-right">
                                <div className="text-white font-bold">{analytics?.engagementMetrics?.likesRate || 0}%</div>
                                <div className="text-red-400 text-sm">engagement rate</div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Bookmark className="w-5 h-5 text-green-400" />
                                <span className="text-white">Bookmarks</span>
                            </div>
                            <div className="text-right">
                                <div className="text-white font-bold">{analytics?.engagementMetrics?.bookmarksRate || 0}%</div>
                                <div className="text-green-400 text-sm">engagement rate</div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 text-blue-400" />
                                <span className="text-white">Messages</span>
                            </div>
                            <div className="text-right">
                                <div className="text-white font-bold">{analytics?.engagementMetrics?.messagesRate || 0}%</div>
                                <div className="text-blue-400 text-sm">engagement rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Performing Posts */}
            {analytics?.topPosts?.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Top Performing Posts
                    </h3>
                    <div className="space-y-4">
                        {analytics.topPosts.slice(0, 10).map((post, index) => (
                            <div key={post.$id} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white font-bold text-sm">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-white font-medium truncate">{post.title}</h5>
                                    <p className="text-slate-400 text-sm">by {post.userName}</p>
                                    <p className="text-slate-500 text-xs">
                                        {new Date(post.$createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-1 text-red-400">
                                        <Heart className="w-4 h-4" />
                                        {post.likesCount}
                                    </div>
                                    <div className="flex items-center gap-1 text-green-400">
                                        <Bookmark className="w-4 h-4" />
                                        {post.bookmarksCount}
                                    </div>
                                    <div className="text-slate-400 font-medium">
                                        Score: {post.performanceScore}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAnalytics;