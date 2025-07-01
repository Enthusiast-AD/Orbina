import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Filter, Eye, Edit3, Trash2, CheckCircle, XCircle, MoreVertical,
    Calendar, Star, Pin, Heart, RefreshCw, FileText, TrendingUp, X, BarChart3
} from 'lucide-react';
import adminService from '../../appwrite/admin';
import appwriteService from '../../appwrite/config';
import toast from 'react-hot-toast';

const AdminPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [featuredFilter, setFeaturedFilter] = useState('all');
    const [pinnedFilter, setPinnedFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [totalPosts, setTotalPosts] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [likesEditingPost, setLikesEditingPost] = useState(null);
    const [likesAdjustment, setLikesAdjustment] = useState('');
    const [viewsEditingPost, setViewsEditingPost] = useState(null);
    const [viewsValue, setViewsValue] = useState('');
    const [actionMenuOpen, setActionMenuOpen] = useState(null);

    const POSTS_PER_PAGE = 20;

    // Fetch posts with filters
    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const options = {
                limit: POSTS_PER_PAGE,
                offset: currentPage * POSTS_PER_PAGE,
                status: statusFilter,
                featured: featuredFilter,
                pinned: pinnedFilter,
                searchTerm,
                sortBy
            };

            const response = await adminService.getAllPosts(options);
            setPosts(response.documents);
            setTotalPosts(response.total);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentPage, statusFilter, featuredFilter, pinnedFilter, searchTerm, sortBy]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        setCurrentPage(0);
    }, [statusFilter, featuredFilter, pinnedFilter, searchTerm, sortBy]);

    useEffect(() => {
        const handleClickOutside = () => setActionMenuOpen(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchPosts();
        toast.success('Posts refreshed');
    };

    const handleStatusChange = async (postId, newStatus) => {
        try {
            await adminService.updatePostStatus(postId, newStatus);
            setPosts(posts.map(post =>
                post.$id === postId ? { ...post, status: newStatus } : post
            ));
            toast.success(`Post ${newStatus === 'active' ? 'published' : 'unpublished'}`);
        } catch (error) {
            toast.error('Failed to update post status');
        }
    };

    const handleFeaturedToggle = async (postId, featured) => {
        try {
            await adminService.togglePostFeatured(postId, featured);
            setPosts(posts.map(post =>
                post.$id === postId ? { ...post, featured } : post
            ));
            toast.success(`Post ${featured ? 'featured' : 'unfeatured'}`);
        } catch (error) {
            toast.error('Failed to update featured status');
        }
    };

    const handlePinnedToggle = async (postId, pinned) => {
        try {
            await adminService.togglePostPinned(postId, pinned);
            setPosts(posts.map(post =>
                post.$id === postId ? { ...post, pinned } : post
            ));
            toast.success(`Post ${pinned ? 'pinned' : 'unpinned'}`);
        } catch (error) {
            toast.error('Failed to update pinned status');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this post permanently?')) return;

        try {
            await adminService.deletePost(postId);
            setPosts(posts.filter(post => post.$id !== postId));
            setSelectedPosts(selectedPosts.filter(id => id !== postId));
            toast.success('Post deleted successfully');
        } catch (error) {
            toast.error('Failed to delete post');
        }
    };

    const handleLikesAdjustment = async (postId, adjustment) => {
        try {
            if (!adjustment || isNaN(adjustment)) {
                toast.error('Please enter a valid number');
                return;
            }

            const numericAdjustment = parseInt(adjustment);
            if (numericAdjustment === 0) {
                toast.error('Adjustment cannot be zero');
                return;
            }

            const result = await adminService.adjustPostLikes(postId, numericAdjustment);

            // Update the post in the local state
            setPosts(posts.map(post =>
                post.$id === postId ? { ...post, likesCount: result.newCount } : post
            ));

            setLikesEditingPost(null);
            setLikesAdjustment('');

            toast.success(`Likes adjusted: ${result.previousCount} → ${result.newCount}`);
        } catch (error) {
            console.error('Error adjusting likes:', error);
            toast.error('Failed to adjust likes. Please try again.');
        }
    };

    const handleViewsUpdate = async (postId, views) => {
        try {
            await adminService.updatePostViews(postId, parseInt(views));
            setPosts(posts.map(post =>
                post.$id === postId ? { ...post, views: parseInt(views) } : post
            ));
            setViewsEditingPost(null);
            setViewsValue('');
            toast.success(`Views updated to ${views}`);
        } catch (error) {
            toast.error('Failed to update views');
        }
    };

    const handleBulkOperation = async (operation) => {
        if (selectedPosts.length === 0) {
            toast.error('No posts selected');
            return;
        }

        if (!window.confirm(`${operation} ${selectedPosts.length} post(s)?`)) return;

        try {
            const result = await adminService.bulkPostOperation(selectedPosts, operation);
            if (result.successful > 0) {
                toast.success(`Successfully ${operation}ed ${result.successful} post(s)`);
                await fetchPosts();
                setSelectedPosts([]);
            }
            if (result.failed > 0) {
                toast.error(`Failed to ${operation} ${result.failed} post(s)`);
            }
        } catch (error) {
            toast.error(`Failed to ${operation} posts`);
        }
    };

    const handleSelectAll = () => {
        setSelectedPosts(selectedPosts.length === posts.length ? [] : posts.map(post => post.$id));
    };

    const handlePostSelect = (postId) => {
        setSelectedPosts(prev =>
            prev.includes(postId)
                ? prev.filter(id => id !== postId)
                : [...prev, postId]
        );
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    const startIndex = currentPage * POSTS_PER_PAGE + 1;
    const endIndex = Math.min((currentPage + 1) * POSTS_PER_PAGE, totalPosts);

    const PostRow = ({ post }) => (
        <tr className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors group">
            <td className="px-6 py-4">
                <input
                    type="checkbox"
                    checked={selectedPosts.includes(post.$id)}
                    onChange={() => handlePostSelect(post.$id)}
                    className="rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
                />
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    {post.featuredImage && (
                        <img
                            src={appwriteService.getFileView(post.featuredImage)}
                            alt={post.title}
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-medium truncate max-w-xs">{post.title}</h3>
                            {post.featured && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                            {post.pinned && <Pin className="w-4 h-4 text-blue-400 fill-current" />}
                        </div>
                        <p className="text-slate-400 text-sm">by {post.userName}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {formatNumber(post.likesCount || 0)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {formatNumber(post.views || 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${post.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                    {post.status === 'active' ? 'Published' : 'Draft'}
                </span>
            </td>

            <td className="px-6 py-4 text-slate-400 text-sm">
                <div className="flex flex-col">
                    <span>{new Date(post.$createdAt).toLocaleDateString()}</span>
                    <span className="text-xs text-slate-500">
                        {new Date(post.$createdAt).toLocaleTimeString()}
                    </span>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => window.open(`/post/${post.$id}`, '_blank')}
                        className="p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-700/50"
                        title="View Post"
                    >
                        <Eye className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => window.open(`/edit-post/${post.$id}`, '_blank')}
                        className="p-2 text-slate-400 hover:text-green-400 transition-colors rounded-lg hover:bg-slate-700/50"
                        title="Edit Post"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => handleStatusChange(post.$id, post.status === 'active' ? 'inactive' : 'active')}
                        className="p-2 text-slate-400 hover:text-yellow-400 transition-colors rounded-lg hover:bg-slate-700/50"
                        title={post.status === 'active' ? 'Unpublish' : 'Publish'}
                    >
                        {post.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>

                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuOpen(actionMenuOpen === post.$id ? null : post.$id);
                            }}
                            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
                            title="More Actions"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {actionMenuOpen === post.$id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            handleFeaturedToggle(post.$id, !post.featured);
                                            setActionMenuOpen(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                                    >
                                        <Star className="w-4 h-4" />
                                        {post.featured ? 'Unfeature' : 'Feature'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            handlePinnedToggle(post.$id, !post.pinned);
                                            setActionMenuOpen(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                                    >
                                        <Pin className="w-4 h-4" />
                                        {post.pinned ? 'Unpin' : 'Pin'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setLikesEditingPost(post.$id);
                                            setActionMenuOpen(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                                    >
                                        <Heart className="w-4 h-4" />
                                        Adjust Likes ({formatNumber(post.likesCount || 0)})
                                    </button>

                                    <button
                                        onClick={() => {
                                            setViewsEditingPost(post.$id);
                                            setViewsValue(post.views || 0);
                                            setActionMenuOpen(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        Edit Views ({formatNumber(post.views || 0)})
                                    </button>

                                    <div className="border-t border-slate-700 my-1"></div>

                                    <button
                                        onClick={() => {
                                            handleDeletePost(post.$id);
                                            setActionMenuOpen(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-600/20 hover:text-red-300"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
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
                        <FileText className="w-8 h-8 text-green-400" />
                        Posts Management
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Manage all posts • {totalPosts} total posts
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${showFilters ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{totalPosts}</div>
                            <div className="text-slate-400 text-sm">Total Posts</div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                            <Star className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{posts.filter(p => p.featured).length}</div>
                            <div className="text-slate-400 text-sm">Featured</div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                            <Pin className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{posts.filter(p => p.pinned).length}</div>
                            <div className="text-slate-400 text-sm">Pinned</div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{posts.filter(p => p.status === 'active').length}</div>
                            <div className="text-slate-400 text-sm">Published</div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-600/20 rounded-lg flex items-center justify-center">
                            <Eye className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">
                                {formatNumber(posts.reduce((sum, p) => sum + (p.views || 0), 0))}
                            </div>
                            <div className="text-slate-400 text-sm">Total Views</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
                            <div className="relative">
                                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search posts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Published</option>
                                <option value="inactive">Draft</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Featured</label>
                            <select
                                value={featuredFilter}
                                onChange={(e) => setFeaturedFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Posts</option>
                                <option value="true">Featured Only</option>
                                <option value="false">Not Featured</option>
                            </select>
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
                                <option value="title">Title A-Z</option>
                                <option value="likes">Most Liked</option>
                                <option value="views">Most Viewed</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Actions */}
            {selectedPosts.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-medium">
                            {selectedPosts.length} post(s) selected
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleBulkOperation('publish')}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                                Publish
                            </button>
                            <button
                                onClick={() => handleBulkOperation('unpublish')}
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                            >
                                Unpublish
                            </button>
                            <button
                                onClick={() => handleBulkOperation('feature')}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Feature
                            </button>
                            <button
                                onClick={() => handleBulkOperation('delete')}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Posts Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={selectedPosts.length === posts.length && posts.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Post Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Created
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
                                            <p className="text-slate-400">Loading posts...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : posts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <FileText className="w-12 h-12 text-slate-600 mb-4" />
                                            <h3 className="text-lg font-medium text-slate-300 mb-2">No posts found</h3>
                                            <p className="text-slate-400">Try adjusting your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post) => <PostRow key={post.$id} post={post} />)
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                        Showing {startIndex} to {endIndex} of {totalPosts} posts
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
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
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-2 rounded-lg transition-colors ${currentPage === pageNum
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
                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={currentPage >= totalPages - 1}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Likes Adjustment Modal */}
            {likesEditingPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Adjust Likes</h3>
                            <button
                                onClick={() => setLikesEditingPost(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-slate-400 mb-4">
                            Current likes: {posts.find(p => p.$id === likesEditingPost)?.likesCount || 0}
                        </p>
                        <p className="text-slate-400 mb-4 text-sm">
                            Enter a positive number to add likes, or a negative number to remove likes.
                        </p>
                        <input
                            type="number"
                            placeholder="e.g., +10 or -5"
                            value={likesAdjustment}
                            onChange={(e) => setLikesAdjustment(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            autoFocus
                        />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleLikesAdjustment(likesEditingPost, likesAdjustment)}
                                disabled={!likesAdjustment}
                                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                            >
                                Apply
                            </button>
                            <button
                                onClick={() => {
                                    setLikesEditingPost(null);
                                    setLikesAdjustment('');
                                }}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Views Update Modal */}
            {viewsEditingPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Update Views</h3>
                            <button
                                onClick={() => setViewsEditingPost(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-slate-400 mb-4">
                            Current views: {posts.find(p => p.$id === viewsEditingPost)?.views || 0}
                        </p>
                        <p className="text-slate-400 mb-4 text-sm">
                            Enter the new view count for this post.
                        </p>
                        <input
                            type="number"
                            min="0"
                            placeholder="Enter new view count"
                            value={viewsValue}
                            onChange={(e) => setViewsValue(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            autoFocus
                        />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleViewsUpdate(viewsEditingPost, viewsValue)}
                                disabled={!viewsValue || parseInt(viewsValue) < 0}
                                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => {
                                    setViewsEditingPost(null);
                                    setViewsValue('');
                                }}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPosts;