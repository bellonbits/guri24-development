import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building,
    MessageSquare,
    User,
    LogOut,
    Menu,
    X,
    PlusCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AgentLayout.css';

const AgentLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '/', label: 'Home Page', icon: <LayoutDashboard size={20} /> },
        { path: '/agent', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/agent/properties', label: 'My Properties', icon: <Building size={20} /> },
        { path: '/agent/properties/add', label: 'Add Property', icon: <PlusCircle size={20} /> },
        { path: '/agent/messages', label: 'Messages', icon: <MessageSquare size={20} /> },
        { path: '/agent/profile', label: 'Profile', icon: <User size={20} /> },
    ];

    return (
        <div className="agent-layout">
            {/* Mobile Header - Simple & Clean */}
            <header className="agent-mobile-header">
                <div className="agent-brand">
                    <span className="brand-highlight">Guri24</span> Agent
                </div>
                {!sidebarOpen && (
                    <button className="agent-menu-toggle" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                )}
            </header>

            {/* Sidebar - Full Height Unified experience */}
            <aside className={`agent-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="agent-brand">
                        <span className="brand-highlight">Guri24</span> Agent
                    </div>
                    <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <div className="sidebar-content-scrollable">
                    <div className="user-profile-summary">
                        <div className="avatar-circle">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="user-info">
                            <p className="user-name">{user?.name || 'Agent'}</p>
                            <p className="user-role">Verified Agent</p>
                        </div>
                    </div>

                    <nav className="agent-nav">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`agent-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="sidebar-footer">
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay - Darkens background when sidebar open */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
            )}

            {/* Main Content Area */}
            <main className="agent-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AgentLayout;
