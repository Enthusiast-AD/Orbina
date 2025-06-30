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
    Activity
} from 'lucide-react';
import adminService from '../../appwrite/admin';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [dashboardStats, analyticsData] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getAnalytics(7)
            ]);
            
            setStats(dashboardStats);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, title, value, growth, color }) => (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-sm mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white">{value || 0}</p>
                    {growth !== undefined && (
                        <div className="flex items-center gap-1 mt-2">
                            {growth >= 0 ? (
                                <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`text-sm ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {Math.abs(growth)}%
                            </span>
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                    <p className="text-slate-400 mt-1">Welcome back, manage your platform efficiently</p>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Last updated: {new Date().toLocaleString()}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    title="Total Users"
                    value={stats?.totalUsers}
                    color="bg-gradient-to-r from-blue-500 to-cyan-500"
                />
                <StatCard
                    icon={FileText}
                    title="Total Posts"
                    value={stats?.totalPosts}
                    growth={stats?.postsGrowth}
                    color="bg-gradient-to-r from-green-500 to-emerald-500"
                />
                <StatCard
                    icon={MessageSquare}
                    title="Messages"
                    value={stats?.totalMessages}
                    color="bg-gradient-to-r from-purple-500 to-pink-500"
                />
                <StatCard
                    icon={Heart}
                    title="Total Likes"
                    value={stats?.totalLikes}
                    color="bg-gradient-to-r from-red-500 to-pink-500"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors border border-blue-500/30">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-300 font-medium">Manage Users</span>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors border border-green-500/30">
                        <FileText className="w-5 h-5 text-green-400" />
                        <span className="text-green-300 font-medium">Review Posts</span>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors border border-purple-500/30">
                        <Activity className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-300 font-medium">View Analytics</span>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors border border-red-500/30">
                        <Eye className="w-5 h-5 text-red-400" />
                        <span className="text-red-300 font-medium">Check Reports</span>
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Posts */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-semibold text-white mb-4">Recent Posts</h3>
                    <div className="space-y-4">
                        {stats?.recentPosts?.slice(0, 5).map((post) => (
                            <div key={post.$id} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-medium truncate">{post.title}</h4>
                                    <p className="text-slate-400 text-sm">by {post.userName}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        post.status === 'active' 
                                            ? 'bg-green-500/20 text-green-400' 
                                            : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                        {post.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-semibold text-white mb-4">Recent Users</h3>
                    <div className="space-y-4">
                        {stats?.recentUsers?.slice(0, 5).map((user) => (
                            <div key={user.$id} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium">
                                        {user.userName?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-medium">{user.userName}</h4>
                                    <p className="text-slate-400 text-sm">
                                        Joined {new Date(user.$createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Today's Summary */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-white mb-4">Today's Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-400">{stats?.todayPosts || 0}</div>
                        <div className="text-slate-400">Posts Created Today</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400">{stats?.totalUsers || 0}</div>
                        <div className="text-slate-400">Active Users</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400">{stats?.totalMessages || 0}</div>
                        <div className="text-slate-400">Messages Sent</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;