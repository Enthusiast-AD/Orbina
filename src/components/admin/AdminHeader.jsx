import React from 'react';
import { useSelector } from 'react-redux';
import { Bell, Search, User } from 'lucide-react';

const AdminHeader = () => {
    const userData = useSelector((state) => state.auth.userData);

    return (
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-white">Admin Dashboard</h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {userData?.name?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-white text-sm font-medium">{userData?.name}</p>
                            <p className="text-slate-400 text-xs">Administrator</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;