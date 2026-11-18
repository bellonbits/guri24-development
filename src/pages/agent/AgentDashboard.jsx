// dashboard-design: Question: "How are my listings performing, and which bookings or messages need action?"
// Entity hues: people/traffic = #1a5f9e, money/bookings = #0d7a52, attention = #b45309, inventory = neutral #475569.
import React, { useEffect, useState } from 'react';
import { Building, Eye, MessageSquare, Plus, Home, AlertCircle, XCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { propertyApi } from '../../utils/propertyApi';
import api from '../../utils/api';
import './AgentDashboard.css';

const StatCard = ({ title, value, icon, baseline, entity = 'neutral', to, loading }) => {
    const content = (
        <div className="agent-stat-card">
            <div className="agent-stat-header">
                <span className="agent-stat-title">{title}</span>
                <div className={`agent-stat-icon entity-${entity}`} aria-hidden="true">
                    {icon}
                </div>
            </div>
            {loading ? (
                <>
                    <div className="skeleton-block" style={{ width: '56px', height: '28px', margin: '8px 0' }} />
                    <div className="skeleton-block" style={{ width: '96px', height: '12px' }} />
                </>
            ) : (
                <>
                    <div className="agent-stat-value tabular-nums">{value}</div>
                    <div className="agent-stat-baseline tabular-nums">{baseline}</div>
                </>
            )}
        </div>
    );

    if (to) {
        return <Link to={to} className="agent-stat-link">{content}</Link>;
    }
    return content;
};

const AgentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        listings: 0,
        publishedCount: 0,
        views: 0,
        avgViews: 0,
        inquiries: 0,
        bookings: 0,
        pendingBookings: 0,
    });
    const [loading, setLoading] = useState(true);
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        const fetchAgentStats = async () => {
            try {
                const propertiesRes = await api.get('/properties', {
                    params: { agent_id: user?.id }
                });
                const properties = propertiesRes?.properties || (Array.isArray(propertiesRes) ? propertiesRes : []);

                const inquiriesRes = await api.get('/inquiries');
                const inquiries = inquiriesRes || [];
                const agentInquiries = Array.isArray(inquiries)
                    ? inquiries.filter(inq => properties.some(prop => prop.id === inq.property_id))
                    : [];

                let bookingsCount = 0;
                let pendingBookingsCount = 0;
                let bookingsList = [];
                try {
                    const bookings = await propertyApi.getAgentReceivedBookings();
                    if (Array.isArray(bookings)) {
                        bookingsCount = bookings.length;
                        pendingBookingsCount = bookings.filter(b => (b.status || '').toLowerCase() === 'pending').length;
                        bookingsList = bookings.slice(0, 5);
                    }
                } catch (bError) {
                    console.warn('Failed to fetch bookings count', bError);
                }

                const totalViews = properties.reduce((sum, prop) => sum + (prop.views || 0), 0);
                const publishedCount = properties.filter(p => (p.status || '').toLowerCase() === 'published').length;
                const avgViews = properties.length > 0 ? Math.round(totalViews / properties.length) : 0;

                setStats({
                    listings: properties.length,
                    publishedCount,
                    views: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews.toLocaleString(),
                    avgViews,
                    inquiries: agentInquiries.length,
                    bookings: bookingsCount,
                    pendingBookings: pendingBookingsCount,
                });
                setRecentBookings(bookingsList);
            } catch (error) {
                console.error('Failed to fetch agent stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchAgentStats();
        } else {
            setLoading(false);
        }
    }, [user]);

    return (
        <div className="dashboard-container">
            {/* Compact Header + Pill Toolbar */}
            <header className="dashboard-header">
                <div className="agent-title-group">
                    <h1 className="page-title">{user?.name?.split(' ')[0] || 'Agent'} overview</h1>
                    <span className="agent-live-pill">
                        <span className="agent-live-dot" aria-hidden="true" />
                        <span>Live</span>
                    </span>
                </div>

                <div className="agent-toolbar-actions">
                    <Link to="/agent/properties/new" className="btn-primary-agent">
                        <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
                        <span>Add property</span>
                    </Link>
                </div>
            </header>

            {/* Verification Status Banner (only shown when action/attention is required) */}
            {user?.agent_status?.toLowerCase() === 'pending' && (
                <div className="verification-banner pending" role="status">
                    <div className="banner-icon" aria-hidden="true">
                        <AlertCircle size={18} strokeWidth={1.5} />
                    </div>
                    <div className="banner-content">
                        <h4>Verification pending review</h4>
                        <p>Compliance review takes up to 24 hours. Listings go live once approved.</p>
                    </div>
                    <Link to="/agent/profile" className="banner-action-link">
                        <span>Check documents</span>
                        <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                </div>
            )}

            {user?.agent_status?.toLowerCase() === 'rejected' && (
                <div className="verification-banner rejected" role="alert">
                    <div className="banner-icon" aria-hidden="true">
                        <XCircle size={18} strokeWidth={1.5} />
                    </div>
                    <div className="banner-content">
                        <h4>Verification requires update</h4>
                        <p>Please re-upload valid identification in your profile settings.</p>
                    </div>
                    <Link to="/agent/profile" className="banner-action-link">
                        <span>Update profile</span>
                        <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                </div>
            )}

            {/* KPI Grid — Wordless, Honest Baselines, Entity-based Hues */}
            <div className="stats-grid">
                <StatCard
                    title="Listings"
                    value={stats.listings}
                    icon={<Building size={16} strokeWidth={1.5} />}
                    entity="neutral"
                    baseline={`${stats.publishedCount} published`}
                    to="/agent/properties"
                    loading={loading}
                />
                <StatCard
                    title="Total views"
                    value={stats.views}
                    icon={<Eye size={16} strokeWidth={1.5} />}
                    entity="people"
                    baseline={`${stats.avgViews} avg / listing`}
                    loading={loading}
                />
                <StatCard
                    title="Bookings"
                    value={stats.bookings}
                    icon={<Home size={16} strokeWidth={1.5} />}
                    entity={stats.pendingBookings > 0 ? 'attention' : 'money'}
                    baseline={stats.pendingBookings > 0 ? `${stats.pendingBookings} pending action` : '0 pending'}
                    loading={loading}
                />
                <StatCard
                    title="Inquiries"
                    value={stats.inquiries}
                    icon={<MessageSquare size={16} strokeWidth={1.5} />}
                    entity="people"
                    baseline="Direct messages"
                    to="/agent/messages"
                    loading={loading}
                />
            </div>

            {/* Recent Bookings Table */}
            <section className="dashboard-section" aria-labelledby="agent-recent-bookings-title">
                <div className="section-header">
                    <h2 id="agent-recent-bookings-title" className="section-title">Recent bookings</h2>
                    <span className="agent-count-pill tabular-nums">{recentBookings.length}</span>
                </div>
                <div className="activity-list">
                    {loading ? (
                        <div style={{ padding: '16px' }}>
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="skeleton-block" style={{ width: '100%', height: '44px', marginBottom: '8px' }} />
                            ))}
                        </div>
                    ) : recentBookings.length === 0 ? (
                        <div className="empty-state">
                            <p>No bookings recorded yet</p>
                            <span>New short stay and viewing reservations will appear here.</span>
                        </div>
                    ) : (
                        <div className="booking-list-dashboard">
                            {recentBookings.map(booking => (
                                <Link to={`/agent/bookings/${booking.id}`} key={booking.id} className="booking-row-link">
                                    <div className="booking-row">
                                        <div className="b-info">
                                            <span className="b-guest">{booking.user?.name || 'Guest'}</span>
                                            <span className="b-prop">{booking.property?.title || '—'}</span>
                                        </div>
                                        <div className="b-details tabular-nums">
                                            <span className="b-dates">
                                                {booking.check_in ? new Date(booking.check_in).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                                                {' → '}
                                                {booking.check_out ? new Date(booking.check_out).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                                            </span>
                                            <span className={`b-status ${(booking.status || 'pending').toLowerCase()}`}>
                                                {booking.status || 'pending'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AgentDashboard;
