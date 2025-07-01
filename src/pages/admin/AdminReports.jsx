import React, { useState, useEffect } from 'react';
import { 
    AlertTriangle, Search, Filter, Eye, CheckCircle, XCircle,
    RefreshCw, Calendar, User, Flag, Ban
} from 'lucide-react';
import adminService from '../../appwrite/admin';
import toast from 'react-hot-toast';

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await adminService.getReportedContent({ status: statusFilter });
            setReports(response.documents);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [statusFilter]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchReports();
        toast.success('Reports refreshed');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                        Reports & Moderation
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Review reported content and moderate platform activity
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">All Reports</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                    </select>
                    
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
                        <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{reports.length}</div>
                            <div className="text-slate-400 text-sm">Total Reports</div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">0</div>
                            <div className="text-slate-400 text-sm">Pending Review</div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">0</div>
                            <div className="text-slate-400 text-sm">Resolved</div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-600/20 rounded-lg flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">0</div>
                            <div className="text-slate-400 text-sm">Dismissed</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="p-12 text-center">
                    <Flag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">No Reports Found</h3>
                    <p className="text-slate-400 mb-6">
                        Great news! There are currently no reported items that need your attention.
                    </p>
                    <div className="text-sm text-slate-500">
                        Reports will appear here when users flag content for review.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;