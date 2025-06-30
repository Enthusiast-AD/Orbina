import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const ADMIN_EMAILS = [
    'ansh@orbina.net',
    'admin@orbina.net',
    'enthusiast.ad@gmail.com'
];

const AdminLayout = () => {
    const userData = useSelector((state) => state.auth.userData);
    
    const isAdmin = userData && ADMIN_EMAILS.includes(userData.email.toLowerCase());

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-900 flex">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                <AdminHeader />
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;