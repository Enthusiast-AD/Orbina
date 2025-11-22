import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    FileText, 
    Users, 
    MessageSquare, 
    BarChart3, 
    Settings, 
    Shield,
    AlertTriangle,
    Database,
    Globe
} from 'lucide-react';

const AdminSidebar = () => {
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: FileText, label: 'Posts', path: '/admin/posts' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
        { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
        { icon: AlertTriangle, label: 'Reports', path: '/admin/reports' },
        { icon: Database, label: 'Database', path: '/admin/database' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div className="w-64 bg-card border-r border-border flex flex-col">
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-none flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-foreground font-bold text-lg">Admin Panel</h1>
                        <p className="text-muted-foreground text-sm">Orbina Management</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-200 ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-border">
                <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent hover:text-foreground rounded-none transition-all duration-200"
                >
                    <Globe className="w-5 h-5" />
                    <span>Back to Website</span>
                </Link>
            </div>
        </div>
    );
};

export default AdminSidebar;