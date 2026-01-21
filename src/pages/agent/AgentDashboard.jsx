import React, { useEffect, useState } from 'react';
import { Building, Eye, MessageSquare, TrendingUp, Plus, Home, AlertCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { propertyApi } from '../../utils/propertyApi';
import { getProfileImageUrl } from '../../utils/imageUtils';
import api from '../../utils/api';
import './AgentDashboard.css';

const StatCard = ({ title, value, icon, trend, color, to }) => {
    const content = (
        <div className="stat-card">
            <div className="stat-header">
                <span className="stat-title">{title}</span>
                <div className={`stat-icon icon-${color}`}>
                    {icon}
                </div>
            </div>
            <div className="stat-value">{value}</div>
            {trend && (
                <div className="stat-trend positive">
                    <TrendingUp size={16} />
                    <span>{trend} this month</span>
                </div>
            )}
        </div>
    );

    if (to) {
        return <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</Link>;
    }
    return content;
};

const AgentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        listings: 0,
        views: 0,
        inquiries: 0,
        bookings: 0,
        listingsTrend: '+0',
        viewsTrend: '+0%',
        inquiriesTrend: '+0'
    });
    const [loading, setLoading] = useState(true);
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        const fetchAgentStats = async () => {
            try {
                // Fetch agent's properties
                const propertiesRes = await api.get('/properties', {
                    params: { agent_id: user?.id }
                });
                const properties = propertiesRes?.properties || (Array.isArray(propertiesRes) ? propertiesRes : []);

                // Fetch agent's inquiries
                const inquiriesRes = await api.get('/inquiries');
                const inquiries = inquiriesRes || [];
                const agentInquiries = Array.isArray(inquiries) ? inquiries.filter(inq =>
                    properties.some(prop => prop.id === inq.property_id)
                ) : [];

                // Fetch agent's received bookings
                let bookingsCount = 0;
                let bookingsList = [];
                try {
                    const bookings = await propertyApi.getAgentReceivedBookings();
                    if (Array.isArray(bookings)) {
                        bookingsCount = bookings.length;
                        bookingsList = bookings.slice(0, 5); // Take top 5 recent
                    }
                } catch (bError) {
                    console.warn("Failed to fetch bookings count", bError);
                }

                // Calculate total views
                const totalViews = properties.reduce((sum, prop) => sum + (prop.views || 0), 0);

                setStats({
                    listings: properties.length,
                    views: totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews,
                    inquiries: agentInquiries.length,
                    bookings: bookingsCount,
                    listingsTrend: '+2',
                    viewsTrend: '+18%',
                    inquiriesTrend: '+3'
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
        }
    }, [user]);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0] || 'Agent'}! 👋</h1>
                    <p className="page-subtitle">Here's what's happening with your listings today.</p>
                </div>
            </div>

            {/* Verification Status Banner */}
            {user?.agent_status === 'pending' && (
                <div className="verification-banner pending">
                    <div className="banner-icon">
                        <AlertCircle size={24} />
                    </div>
                    <div className="banner-content">
                        <h4>Account Under Review</h4>
                        <p>Your agent account is currently being verified by our administrators. You'll be able to post listings once approved.</p>
                    </div>
                </div>
            )}

            {user?.agent_status === 'rejected' && (
                <div className="verification-banner rejected">
                    <div className="banner-icon">
                        <XCircle size={24} />
                    </div>
                    <div className="banner-content">
                        <h4>Verification Rejected</h4>
                        <p>Your agent verification request was not approved. Please contact support for more information.</p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    title="Active Listings"
                    value={loading ? '...' : stats.listings}
                    icon={<Building size={24} />}
                    color="blue"
                    trend={stats.listingsTrend}
                    to="/agent/properties"
                />
                <StatCard
                    title="Total Views"
                    value={loading ? '...' : stats.views}
                    icon={<Eye size={24} />}
                    color="green"
                    trend={stats.viewsTrend}
                />
                <StatCard
                    title="Total Bookings"
                    value={loading ? '...' : stats.bookings}
                    icon={<Home size={24} />}
                    color="orange"
                // to="/agent/properties" -> No main bookings page yet, but could be added
                />
                <StatCard
                    title="New Messages"
                    value={loading ? '...' : stats.inquiries}
                    icon={<MessageSquare size={24} />}
                    color="purple"
                    trend={stats.inquiriesTrend}
                    to="/agent/messages"
                />
            </div>

            {/* Recent Activity Section (Bookings) */}
            <div className="dashboard-section">
                <h2 className="section-title">Recent Bookings</h2>
                <div className="activity-list">
                    {recentBookings.length === 0 ? (
                        <div className="empty-state">
                            <p>No recent bookings to show.</p>
                        </div>
                    ) : (
                        <div className="booking-list-dashboard">
                            {recentBookings.map(booking => (
                                <Link to={`/agent/bookings/${booking.id}`} key={booking.id} className="booking-row-link">
                                    <div className="booking-row">
                                        <div className="b-info">
                                            <span className="b-guest">{booking.user?.name || 'Guest'}</span>
                                            <span className="b-prop">{booking.property?.title}</span>
                                        </div>
                                        <div className="b-details">
                                            <span className="b-dates">
                                                {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                                            </span>
                                            <span className={`b-status ${booking.status.toLowerCase()}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
