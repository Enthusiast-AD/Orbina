import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Filter, 
    Eye, 
    Edit3, 
    Trash2, 
    CheckCircle, 
    XCircle,
    MoreVertical,
    Calendar
} from 'lucide-react';
import adminService from '../../appwrite/admin';
import appwriteService from '../../appwrite/config';
import toast from 'react-hot-toast';

const AdminPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedPosts, setSelectedPosts] = useState([]);

    const POSTS_PER_PAGE = 20;

    useEffect(() => {
        fetchPosts();
    }, [currentPage]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllPosts(POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);
            setPosts(response.documents);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (postId, newStatus) => {
        try {
            await adminService.updatePostStatus(postId, newStatus);
            setPosts(posts.map(post => 
                post.$id === postId ? { ...post, status: newStatus } : post
            ));
            toast.success(`Post ${newStatus === 'active' ? 'published' : 'unpublished'}`);
        } catch (error) {
            console.error('Error updating post status:', error);
            toast.error('Failed to update post status');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        try {
            await adminService.deletePost(postId);
            setPosts(posts.filter(post => post.$id !== postId));
            toast.success('Post deleted successfully');
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Failed to delete post');
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.userName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const PostRow = ({ post }) => (
        <tr className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
            <td className="px-6 py-4">
                <input
                    type="checkbox"
                    checked={selectedPosts.includes(post.$id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedPosts([...selectedPosts, post.$id]);
                        } else {
                            setSelectedPosts(selectedPosts.filter(id => id !== post.$id));
                        }
                    }}
                    className="rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
                />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    {post.featuredImage && (
                        <img
                            src={appwriteService.getFileView(post.featuredImage)}
                            alt={post.title}
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                    )}
                    <div>
                        <h3 className="text-white font-medium truncate max-w-xs">{post.title}</h3>
                        <p className="text-slate-400 text-sm">by {post.userName}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    post.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                    {post.status === 'active' ? 'Published' : 'Draft'}
                </span>
            </td>
            <td className="px-6 py-4 text-slate-400 text-sm">
                {new Date(post.$createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.open(`/post/${post.$id}`, '_blank')}
                        className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                        title="View Post"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => window.open(`/edit-post/${post.$id}`, '_blank')}
                        className="p-2 text-slate-400 hover:text-green-400 transition-colors"
                        title="Edit Post"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleStatusChange(post.$id, post.status === 'active' ? 'inactive' : 'active')}
                        className="p-2 text-slate-400 hover:text-yellow-400 transition-colors"
                        title={post.status === 'active' ? 'Unpublish' : 'Publish'}
                    >
                        {post.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => handleDeletePost(post.$id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Post"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Posts Management</h1>
                    <p className="text-slate-400 mt-1">Manage all posts across the platform</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Published</option>
                        <option value="inactive">Draft</option>
                    </select>
                </div>
            </div>

            {/* Posts Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedPosts(filteredPosts.map(post => post.$id));
                                            } else {
                                                setSelectedPosts([]);
                                            }
                                        }}
                                        className="rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                    Post
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
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        No posts found
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map((post) => (
                                    <PostRow key={post.$id} post={post} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedPosts.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300">
                            {selectedPosts.length} post(s) selected
                        </span>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                                Publish Selected
                            </button>
                            <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                                Unpublish Selected
                            </button>
                            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                                Delete Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPosts;