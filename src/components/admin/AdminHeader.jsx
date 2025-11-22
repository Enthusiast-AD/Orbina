import React from 'react';
import { useSelector } from 'react-redux';
import { Bell, Search, User } from 'lucide-react';

const AdminHeader = () => {
    const userData = useSelector((state) => state.auth.userData);

    return (
        <header className="bg-background/80 backdrop-blur-sm border-b border-border p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-foreground">Admin Dashboard</h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 bg-background border border-input rounded-none text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-sm font-medium">
                                {userData?.name?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-foreground text-sm font-medium">{userData?.name}</p>
                            <p className="text-muted-foreground text-xs">Administrator</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;