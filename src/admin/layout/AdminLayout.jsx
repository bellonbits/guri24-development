import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BarChart3,
    Building2,
    Users,
    Activity,
    Settings,
    Menu,
    X,
    LogOut,
    ExternalLink,
    UserCheck,
    MessageSquare,
    UserCheck2,
    HelpCircle
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProfileImageUrl } from '../../utils/imageUtils';
import './AdminLayout.css';
import '../pages/AdminShared.css';

function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();

    const navSections = [
        {
            title: 'Overview',
            items: [
                { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
                { path: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={19} /> },
            ]
        },
        {
            title: 'Management',
            items: [
                { path: '/admin/properties', label: 'Properties', icon: <Building2 size={19} /> },
                { path: '/admin/inquiries', label: 'Inquiries', icon: <HelpCircle size={19} /> },
                { path: '/admin/messages', label: 'Messages / Chat', icon: <MessageSquare size={19} /> },
                { path: '/admin/users', label: 'Users', icon: <Users size={19} /> },
                { path: '/admin/agents', label: 'Agents', icon: <UserCheck2 size={19} /> },
                { path: '/admin/verifications', label: 'Verifications', icon: <UserCheck size={19} /> },
            ]
        },
        {
            title: 'System',
            items: [
                { path: '/admin/monitoring', label: 'Monitoring', icon: <Activity size={19} /> },
                { path: '/admin/settings', label: 'Settings', icon: <Settings size={19} /> },
            ]
        }
    ];

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin' || location.pathname === '/admin/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src="https://guri24.com/logo.png" alt="Guri24" style={{ height: '32px', objectFit: 'contain' }} onError={(e) => { e.target.src = '/logo.png'; }} />
                        {sidebarOpen && (
                            <div className="logo-badge-group">
                                <span className="logo-text">Guri<span style={{ color: '#0c6759' }}>24</span></span>
                                <span className="admin-badge">Admin</span>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {/* Live Website Link */}
                    <div className="sidebar-util-link">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nav-item live-site-link"
                            title="Open live website"
                        >
                            <span className="nav-icon"><ExternalLink size={18} /></span>
                            {sidebarOpen && <span className="nav-label">View Live Site ↗</span>}
                        </a>
                    </div>

                    {navSections.map((section, sIdx) => (
                        <div key={sIdx} className="sidebar-section">
                            {sidebarOpen && <div className="sidebar-section-title">{section.title}</div>}
                            {section.items.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    title={!sidebarOpen ? item.label : undefined}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {sidebarOpen && <span className="nav-label">{item.label}</span>}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-user">
                        <div className="user-avatar">
                            {user?.avatar_url ? (
                                <img
                                    src={getProfileImageUrl(user.avatar_url)}
                                    alt={user.name}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className="user-initials" style={{ display: user?.avatar_url ? 'none' : 'flex' }}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                        </div>
                        {sidebarOpen && (
                            <div className="user-info">
                                <span className="user-name">{user?.name || 'Platform Admin'}</span>
                                <span className="user-role">Super Administrator</span>
                            </div>
                        )}
                    </div>
                    <button className="logout-btn" onClick={logout} title="Logout">
                        <LogOut size={18} />
                        {sidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="admin-main">
                {/* Header */}
                <header className="admin-header">
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        <Menu size={22} />
                    </button>

                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>

                    <div className="header-actions">
                        <a href="/" target="_blank" rel="noopener noreferrer" className="header-pill-link">
                            <ExternalLink size={15} />
                            <span>Live Site</span>
                        </a>

                        <div className="admin-user-menu">
                            <div className="user-avatar-sm">
                                {user?.avatar_url ? (
                                    <img src={getProfileImageUrl(user.avatar_url)} alt={user.name} />
                                ) : (
                                    <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
                                )}
                            </div>
                            <span className="user-menu-name">{user?.name || 'Administrator'}</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}

export default AdminLayout;
