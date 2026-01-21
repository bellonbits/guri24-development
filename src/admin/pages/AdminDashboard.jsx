import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, MessageSquare, AlertCircle, TrendingUp, Eye, CheckCircle2, Clock, LogIn, Heart, XCircle } from 'lucide-react';
import adminApi from '../../utils/adminApi';
import './AdminDashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch real dashboard stats from new endpoint
                const statsData = await adminApi.getDashboardStats();

                setStats(statsData);

            } catch (err) {
                console.error("Failed to load dashboard data:", err);
                setError(err.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="error-state">
                    <AlertCircle size={48} />
                    <h3>Failed to load dashboard</h3>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <p>Platform overview and management</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card" onClick={() => navigate('/admin/agents')}>
                    <div className="stat-icon agents">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.agents?.total || 0}</h3>
                        <p>Total Agents</p>
                        <div className="stat-meta">
                            <span className="verified">
                                <CheckCircle2 size={14} />
                                {stats?.agents?.verified || 0} verified
                            </span>
                            {stats?.agents?.pending > 0 && (
                                <span className="pending">
                                    <Clock size={14} />
                                    {stats.agents.pending} pending
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="stat-card" onClick={() => navigate('/admin/properties')}>
                    <div className="stat-icon properties">
                        <Building2 size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.properties?.total || 0}</h3>
                        <p>Total Properties</p>
                        <div className="stat-meta">
                            <span className="published">
                                <CheckCircle2 size={14} />
                                {stats?.properties?.published || 0} published
                            </span>
                            {stats?.properties?.pending > 0 && (
                                <span className="pending">
                                    <Clock size={14} />
                                    {stats.properties.pending} pending
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="stat-card" onClick={() => navigate('/admin/inquiries')}>
                    <div className="stat-icon inquiries">
                        <MessageSquare size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.inquiries?.total || 0}</h3>
                        <p>Total Inquiries</p>
                        <div className="stat-meta">
                            <span className="new">
                                <TrendingUp size={14} />
                                {stats?.inquiries?.new || 0} new
                            </span>
                        </div>
                    </div>
                </div>

                <div className="stat-card highlight" onClick={() => navigate('/admin/verifications')}>
                    <div className="stat-icon approvals">
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats?.pending_approvals || 0}</h3>
                        <p>Pending Approvals</p>
                        <div className="stat-meta">
                            <span className="urgent">Requires attention</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="dashboard-action-grid">
                    <button className="dashboard-action-btn" onClick={() => navigate('/admin/agents')}>
                        <Users size={20} />
                        <span>Manage Agents</span>
                    </button>
                    <button className="dashboard-action-btn" onClick={() => navigate('/admin/properties')}>
                        <Building2 size={20} />
                        <span>Manage Properties</span>
                    </button>
                    <button className="dashboard-action-btn" onClick={() => navigate('/admin/verifications')}>
                        <CheckCircle2 size={20} />
                        <span>Verify Agents</span>
                    </button>
                    <button className="dashboard-action-btn" onClick={() => navigate('/admin/users')}>
                        <Eye size={20} />
                        <span>View All Users</span>
                    </button>
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="recent-section">
                <h2>Recent Bookings</h2>
                <div className="bookings-list">
                    {stats?.recent_bookings && stats.recent_bookings.length > 0 ? (
                        stats.recent_bookings.map((booking) => (
                            <div key={booking.id} className="booking-card">
                                <div className="booking-info">
                                    <h4>{booking.property_title || 'Property'}</h4>
                                    <p className="booking-guest">{booking.guest_name || booking.guest_email}</p>
                                    <div className="booking-dates">
                                        <span>{new Date(booking.check_in).toLocaleDateString()}</span>
                                        <span>→</span>
                                        <span>{new Date(booking.check_out).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="booking-meta">
                                    <span className={`booking-status ${booking.status}`}>
                                        {booking.status}
                                    </span>
                                    <span className="booking-amount">
                                        ${booking.total_price?.toLocaleString() || '0'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="empty-state">No recent bookings to show.</p>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-section">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                    {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                        stats.recent_activity.map((activity, index) => (
                            <div key={index} className="activity-item">
                                <div className="activity-icon">
                                    {activity.type === 'user_registered' && <Users size={16} />}
                                    {activity.type === 'user_login' && <LogIn size={16} />}
                                    {activity.type === 'property_listed' && <Building2 size={16} />}
                                    {activity.type === 'property_liked' && <Heart size={16} />}
                                    {activity.type === 'property_viewed' && <Eye size={16} />}
                                    {activity.type === 'booking_created' && <CheckCircle2 size={16} />}
                                    {activity.type === 'inquiry_received' && <MessageSquare size={16} />}
                                    {activity.type === 'agent_verified' && <CheckCircle2 size={16} className="text-success" />}
                                    {activity.type === 'agent_rejected' && <XCircle size={16} className="text-danger" />}
                                    {!['user_registered', 'user_login', 'property_listed', 'property_liked', 'property_viewed', 'booking_created', 'inquiry_received', 'agent_verified', 'agent_rejected'].includes(activity.type) && <AlertCircle size={16} />}
                                </div>
                                <div className="activity-content">
                                    <p>{activity.description}</p>
                                    <span className="activity-time">
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="empty-state">No recent activity found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
