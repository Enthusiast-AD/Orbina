import React, { useState, useEffect, useCallback } from 'react';
import { 
    Search, Filter, User, Mail, Calendar, MessageSquare, 
    FileText, Heart, MoreVertical, RefreshCw, Users, Ban, CheckCircle
} from 'lucide-react';
import adminService from '../../appwrite/admin';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    const USERS_PER_PAGE = 20;

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const options = {
                limit: USERS_PER_PAGE,
                offset: currentPage * USERS_PER_PAGE,
                searchTerm,
                sortBy
            };

            const response = await adminService.getAllUsers(options);
            setUsers(response.documents);
            setTotalUsers(response.total);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentPage, searchTerm, sortBy]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm, sortBy]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchUsers();
        toast.success('Users refreshed');
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
    const startIndex = currentPage * USERS_PER_PAGE + 1;
    const endIndex = Math.min((currentPage + 1) * USERS_PER_PAGE, totalUsers);

    const UserRow = ({ user }) => (
        <tr className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                            {user.userName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-white font-medium">{user.userName || 'Anonymous'}</h3>
                        <p className="text-slate-400 text-sm">{user.userId}</p>
                    </div>
                </div>
            </td>
            
            <td className="px-6 py-4">
                <div className="text-slate-300">{user.email || 'N/A'}</div>
            </td>
            
            <td className="px-6 py-4 text-slate-400 text-sm">
                {new Date(user.$createdAt).toLocaleDateString()}
            </td>
            
            <td className="px-6 py-4 text-center">
                <div className="text-white font-medium">{user.postsCount || 0}</div>
            </td>
            
            <td className="px-6 py-4 text-center">
                <div className="text-white font-medium">{user.likesReceived || 0}</div>
            </td>
            
            <td className="px-6 py-4 text-center">
                <div className="text-white font-medium">{user.messagesCount || 0}</div>
            </td>
            
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.open(`/messages/${user.userId}`, '_blank')}
                        className="p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-700/50"
                        title="Message User"
                    >
                        <MessageSquare className="w-4 h-4" />
                    </button>
                    
                    <button
                        className="p-2 text-slate-400 hover:text-green-400 transition-colors rounded-lg hover:bg-slate-700/50"
                        title="View Profile"
                    >
                        <User className="w-4 h-4" />
                    </button>
                    
                    <button
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-700/50"
                        title="More Actions"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-400" />
                        Users Management
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Manage all users • {totalUsers} total users
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            showFilters ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
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

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{totalUsers}</div>
                            <div className="text-slate-400 text-sm">Total Users</div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{users.filter(u => u.postsCount > 0).length}</div>
                            <div className="text-slate-400 text-sm">Active Writers</div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">
                                {users.filter(u => {
                                    const week = new Date();
                                    week.setDate(week.getDate() - 7);
                                    return new Date(u.$createdAt) >= week;
                                }).length}
                            </div>
                            <div className="text-slate-400 text-sm">New This Week</div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                            <Heart className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">
                                {users.reduce((sum, u) => sum + (u.likesReceived || 0), 0)}
                            </div>
                            <div className="text-slate-400 text-sm">Total Likes</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
                            <div className="relative">
                                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name">Name A-Z</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Posts
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Likes
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Messages
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
                                            <p className="text-slate-400">Loading users...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <Users className="w-12 h-12 text-slate-600 mb-4" />
                                            <h3 className="text-lg font-medium text-slate-300 mb-2">No users found</h3>
                                            <p className="text-slate-400">Try adjusting your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => <UserRow key={user.$id} user={user} />)
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                        Showing {startIndex} to {endIndex} of {totalUsers} users
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                            Previous
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
                                if (pageNum >= totalPages) return null;
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-2 rounded-lg transition-colors ${
                                            currentPage === pageNum
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                        }`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;