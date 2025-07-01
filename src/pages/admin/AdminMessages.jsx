import React, { useState, useEffect, useCallback } from 'react';
import { 
    MessageSquare, Search, Filter, Eye, Trash2, Ban, 
    RefreshCw, User, Calendar, AlertTriangle, Users
} from 'lucide-react';
import adminService from '../../appwrite/admin';
import toast from 'react-hot-toast';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalMessages, setTotalMessages] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    const MESSAGES_PER_PAGE = 50;

    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true);
            const options = {
                limit: MESSAGES_PER_PAGE,
                offset: currentPage * MESSAGES_PER_PAGE,
                userId: userFilter,
                searchTerm,
                sortBy
            };

            const response = await adminService.getMessages(options);
            setMessages(response.documents);
            setTotalMessages(response.total);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentPage, userFilter, searchTerm, sortBy]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        setCurrentPage(0);
    }, [userFilter, searchTerm, sortBy]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMessages();
        toast.success('Messages refreshed');
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message permanently?')) return;

        try {
            await adminService.deleteMessage(messageId);
            setMessages(messages.filter(msg => msg.$id !== messageId));
            toast.success('Message deleted');
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const totalPages = Math.ceil(totalMessages / MESSAGES_PER_PAGE);
    const startIndex = currentPage * MESSAGES_PER_PAGE + 1;
    const endIndex = Math.min((currentPage + 1) * MESSAGES_PER_PAGE, totalMessages);

    const MessageRow = ({ message }) => (
        <tr className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="text-white font-medium">{message.senderId}</div>
                        <div className="text-slate-400 text-sm">to {message.receiverId}</div>
                    </div>
                </div>
            </td>
            
            <td className="px-6 py-4">
                <div className="max-w-xs">
                    <p className="text-slate-300 truncate">{message.message}</p>
                    {message.fileName && (
                        <div className="text-slate-500 text-xs mt-1">
                            📎 {message.fileName}
                        </div>
                    )}
                </div>
            </td>
            
            <td className="px-6 py-4 text-slate-400 text-sm">
                <div className="flex flex-col">
                    <span>{new Date(message.$createdAt).toLocaleDateString()}</span>
                    <span className="text-xs text-slate-500">
                        {new Date(message.$createdAt).toLocaleTimeString()}
                    </span>
                </div>
            </td>
            
            <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    message.isRead 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                    {message.isRead ? 'Read' : 'Unread'}
                </span>
            </td>
            
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button
                        className="p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-700/50"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                        onClick={() => handleDeleteMessage(message.$id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-700/50"
                        title="Delete Message"
                    >
                        <Trash2 className="w-4 h-4" />
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
                        <MessageSquare className="w-8 h-8 text-purple-400" />
                        Messages Management
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Monitor platform communications • {totalMessages} total messages
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
                        <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{totalMessages}</div>
                            <div className="text-slate-400 text-sm">Total Messages</div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                            <Eye className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">
                                {messages.filter(m => m.isRead).length}
                            </div>
                            <div className="text-slate-400 text-sm">Read Messages</div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">
                                {messages.filter(m => !m.isRead).length}
                            </div>
                            <div className="text-slate-400 text-sm">Unread Messages</div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">
                                {new Set([...messages.map(m => m.senderId), ...messages.map(m => m.receiverId)]).size}
                            </div>
                            <div className="text-slate-400 text-sm">Active Users</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Search Messages</label>
                            <div className="relative">
                                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search message content..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">User Filter</label>
                            <input
                                type="text"
                                placeholder="User ID..."
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
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
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Users
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Message
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Sent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
                                            <p className="text-slate-400">Loading messages...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : messages.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <MessageSquare className="w-12 h-12 text-slate-600 mb-4" />
                                            <h3 className="text-lg font-medium text-slate-300 mb-2">No messages found</h3>
                                            <p className="text-slate-400">Try adjusting your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                messages.map((message) => <MessageRow key={message.$id} message={message} />)
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                        Showing {startIndex} to {endIndex} of {totalMessages} messages
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

export default AdminMessages;