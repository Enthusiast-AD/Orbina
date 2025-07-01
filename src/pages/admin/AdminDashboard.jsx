import React, { useState, useEffect } from 'react';
import { 
    Users, 
    FileText, 
    MessageSquare, 
    Heart, 
    TrendingUp, 
    TrendingDown,
    Eye,
    Calendar,
    Activity,
    Star,
    Pin,
    RefreshCw,
    BarChart3,
    PieChart,
    Target,
    Zap,
    Award,
    Globe,
    Clock,
    ArrowUp,
    ArrowDown,
    Plus,
    Settings,
    Shield,
    AlertTriangle
} from 'lucide-react';
import adminService from '../../appwrite/admin';
import toast from 'react-hot-toast';


const AdminDashboard = () => {
    // State management for dashboard data
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState(7);

    
    const fetchDashboardData = async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true);
            else setLoading(true);

            const [dashboardStats, analyticsData] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getAnalytics(selectedTimeframe)
            ]);
            
            setStats(dashboardStats);
            setAnalytics(analyticsData);
            setLastUpdated(new Date());
            
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Initial data fetch and auto-refresh setup
    useEffect(() => {
        fetchDashboardData();
    }, [selectedTimeframe]);

    // Auto-refresh functionality
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchDashboardData(true);
        }, 60000); // Refresh every minute

        return () => clearInterval(interval);
    }, [autoRefresh, selectedTimeframe]);

    
    const handleRefresh = () => {
        fetchDashboardData(true);
        toast.success('Dashboard refreshed');
    };

    /**
     * Toggle auto-refresh functionality
     */
    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh);
        toast.success(`Auto-refresh ${!autoRefresh ? 'enabled' : 'disabled'}`);
    };

    /**
     * StatCard Component - Reusable statistics card
     */
    const StatCard = ({ 
        icon: Icon, 
        title, 
        value, 
        growth, 
        color, 
        subtitle,
        onClick,
        loading: cardLoading = false 
    }) => (
        <div 
            className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 transition-all duration-300 hover:border-slate-600/50 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-slate-400 text-sm mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white mb-2">
                        {cardLoading ? (
                            <div className="animate-pulse bg-slate-700 h-8 w-16 rounded"></div>
                        ) : (
                            value || 0
                        )}
                    </p>
                    
                    {subtitle && (
                        <p className="text-slate-500 text-xs mb-2">{subtitle}</p>
                    )}
                    
                    {growth !== undefined && (
                        <div className="flex items-center gap-1">
                            {growth >= 0 ? (
                                <ArrowUp className="w-4 h-4 text-green-400" />
                            ) : (
                                <ArrowDown className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {Math.abs(growth)}%
                            </span>
                            <span className="text-slate-500 text-xs">vs yesterday</span>
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    /**
     * QuickAction Component - Reusable quick action button
     */
    const QuickAction = ({ icon: Icon, title, description, color, onClick, count }) => (
        <button 
            onClick={onClick}
            className={`flex items-center gap-4 p-4 ${color} hover:bg-opacity-80 rounded-lg transition-all duration-200 border border-opacity-30 hover:border-opacity-50 border-current group`}
        >
            <div className="relative">
                <Icon className="w-6 h-6 text-current" />
                {count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {count > 99 ? '99+' : count}
                    </span>
                )}
            </div>
            <div className="flex-1 text-left">
                <h3 className="font-medium text-current">{title}</h3>
                <p className="text-current text-opacity-80 text-sm">{description}</p>
            </div>
            <div className="group-hover:translate-x-1 transition-transform">
                <ArrowUp className="w-4 h-4 text-current rotate-45" />
            </div>
        </button>
    );

    /**
     * TimeframeSelector Component
     */
    const TimeframeSelector = () => (
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
            {[7, 14, 30].map((days) => (
                <button
                    key={days}
                    onClick={() => setSelectedTimeframe(days)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedTimeframe === days
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                >
                    {days}d
                </button>
            ))}
        </div>
    );

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Shield className="w-8 h-8 text-purple-400" />
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Welcome back! Monitor your platform's performance and manage content efficiently.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <TimeframeSelector />
                    
                    <button
                        onClick={toggleAutoRefresh}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            autoRefresh 
                                ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                        <Activity className={`w-4 h-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
                        Auto-refresh
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

            {/* Last Updated Indicator */}
            <div className="flex items-center justify-between text-sm text-slate-400 bg-slate-800/30 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: {lastUpdated.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>System Online</span>
                    </div>
                    <div className="text-green-400 font-medium">
                        {stats?.systemHealth?.uptime || 99.9}% Uptime
                    </div>
                </div>
            </div>

            {/* Primary Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    title="Total Users"
                    value={stats?.totalUsers}
                    growth={stats?.usersGrowth}
                    color="bg-gradient-to-r from-blue-500 to-cyan-500"
                    subtitle={`${stats?.todayUsers || 0} joined today`}
                    onClick={() => window.location.href = '/admin/users'}
                />
                <StatCard
                    icon={FileText}
                    title="Total Posts"
                    value={stats?.totalPosts}
                    growth={stats?.postsGrowth}
                    color="bg-gradient-to-r from-green-500 to-emerald-500"
                    subtitle={`${stats?.activePosts || 0} published`}
                    onClick={() => window.location.href = '/admin/posts'}
                />
                <StatCard
                    icon={MessageSquare}
                    title="Messages Today"
                    value={stats?.todayMessages}
                    color="bg-gradient-to-r from-purple-500 to-pink-500"
                    subtitle={`${stats?.totalMessages || 0} total messages`}
                    onClick={() => window.location.href = '/admin/messages'}
                />
                <StatCard
                    icon={Heart}
                    title="Total Engagement"
                    value={(stats?.totalLikes || 0) + (stats?.totalBookmarks || 0)}
                    growth={stats?.engagementGrowth}
                    color="bg-gradient-to-r from-red-500 to-pink-500"
                    subtitle={`${stats?.todayLikes || 0} likes today`}
                />
            </div>

            {/* Secondary Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Star}
                    title="Featured Posts"
                    value={stats?.featuredPosts}
                    color="bg-gradient-to-r from-yellow-500 to-orange-500"
                    subtitle="Currently featured"
                />
                <StatCard
                    icon={Pin}
                    title="Pinned Posts"
                    value={stats?.pinnedPosts}
                    color="bg-gradient-to-r from-indigo-500 to-purple-500"
                    subtitle="Currently pinned"
                />
                <StatCard
                    icon={Target}
                    title="Draft Posts"
                    value={stats?.draftPosts}
                    color="bg-gradient-to-r from-gray-500 to-slate-500"
                    subtitle="Awaiting publication"
                />
                <StatCard
                    icon={Zap}
                    title="Active Rate"
                    value={`${stats?.activePosts && stats?.totalPosts ? 
                        ((stats.activePosts / stats.totalPosts) * 100).toFixed(1) : 0}%`}
                    color="bg-gradient-to-r from-teal-500 to-cyan-500"
                    subtitle="Posts published"
                />
            </div>

            {/* Quick Actions Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-6">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickAction
                        icon={Users}
                        title="Manage Users"
                        description="View and manage user accounts"
                        color="bg-blue-600/20 text-blue-300"
                        onClick={() => window.location.href = '/admin/users'}
                    />
                    <QuickAction
                        icon={FileText}
                        title="Review Posts"
                        description="Moderate and manage posts"
                        color="bg-green-600/20 text-green-300"
                        onClick={() => window.location.href = '/admin/posts'}
                        count={stats?.draftPosts || 0}
                    />
                    <QuickAction
                        icon={BarChart3}
                        title="View Analytics"
                        description="Platform performance metrics"
                        color="bg-purple-600/20 text-purple-300"
                        onClick={() => window.location.href = '/admin/analytics'}
                    />
                    <QuickAction
                        icon={AlertTriangle}
                        title="Check Reports"
                        description="Review reported content"
                        color="bg-red-600/20 text-red-300"
                        onClick={() => window.location.href = '/admin/reports'}
                    />
                </div>
            </div>

            {/* Analytics Overview */}
            {analytics?.dailyAnalytics && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-6 h-6 text-purple-400" />
                            <h3 className="text-xl font-semibold text-white">Activity Overview</h3>
                        </div>
                        <div className="text-sm text-slate-400">
                            Last {selectedTimeframe} days
                        </div>
                    </div>

                    {/* Simple activity metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                            <div className="text-2xl font-bold text-white mb-1">
                                {analytics.summary?.totalPosts || 0}
                            </div>
                            <div className="text-slate-400 text-sm">Posts Created</div>
                        </div>
                        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                            <div className="text-2xl font-bold text-white mb-1">
                                {analytics.summary?.totalUsers || 0}
                            </div>
                            <div className="text-slate-400 text-sm">New Users</div>
                        </div>
                        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                            <div className="text-2xl font-bold text-white mb-1">
                                {analytics.summary?.totalEngagement || 0}
                            </div>
                            <div className="text-slate-400 text-sm">Total Engagement</div>
                        </div>
                        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                            <div className="text-2xl font-bold text-white mb-1">
                                {analytics.summary?.engagementRate || 0}%
                            </div>
                            <div className="text-slate-400 text-sm">Engagement Rate</div>
                        </div>
                    </div>

                    {/* Top performing posts */}
                    {analytics?.topPosts?.length > 0 && (
                        <div>
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-yellow-400" />
                                Top Performing Posts
                            </h4>
                            <div className="space-y-3">
                                {analytics.topPosts.slice(0, 3).map((post, index) => (
                                    <div key={post.$id} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-white font-medium truncate">{post.title}</h5>
                                            <p className="text-slate-400 text-sm">by {post.userName}</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1 text-red-400">
                                                <Heart className="w-4 h-4" />
                                                {post.likesCount}
                                            </div>
                                            <div className="text-slate-400">
                                                Score: {post.performanceScore}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Posts */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-400" />
                        Recent Posts
                    </h3>
                    <div className="space-y-4">
                        {stats?.recentPosts?.slice(0, 5).map((post) => (
                            <div key={post.$id} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-medium truncate">{post.title}</h4>
                                    <p className="text-slate-400 text-sm">by {post.userName}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        post.status === 'active' 
                                            ? 'bg-green-500/20 text-green-400' 
                                            : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                        {post.status === 'active' ? 'Published' : 'Draft'}
                                    </span>
                                    <div className="text-slate-500 text-xs mt-1">
                                        {new Date(post.$createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        Recent Users
                    </h3>
                    <div className="space-y-4">
                        {stats?.recentUsers?.slice(0, 5).map((user) => (
                            <div key={user.$id} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                        {user.userName?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-medium">{user.userName || 'Anonymous'}</h4>
                                    <p className="text-slate-400 text-sm">
                                        Joined {new Date(user.$createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-slate-400 text-xs">
                                        New Member
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* System Status Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    System Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-1">
                            {stats?.systemHealth?.uptime || 99.9}%
                        </div>
                        <div className="text-slate-400">Uptime</div>
                        <div className="text-green-400 text-sm mt-1">All systems operational</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-1">
                            {stats?.systemHealth?.postsToday || 0}
                        </div>
                        <div className="text-slate-400">Posts Today</div>
                        <div className="text-blue-400 text-sm mt-1">Content creation active</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-1">
                            {stats?.systemHealth?.usersToday || 0}
                        </div>
                        <div className="text-slate-400">New Users Today</div>
                        <div className="text-purple-400 text-sm mt-1">Community growing</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;