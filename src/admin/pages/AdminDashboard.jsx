// dashboard-design: Question: "Is the platform healthy today, and what needs approval?"
// Entity hues: people/traffic = #1a5f9e, money = #0d7a52, attention = #b45309, healthy/neutral = slate #475569.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Building2,
    MessageSquare,
    AlertCircle,
    Eye,
    CheckCircle2,
    Clock,
    LogIn,
    Heart,
    XCircle,
    ArrowUpRight
} from 'lucide-react';
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
                const statsData = await adminApi.getDashboardStats();
                setStats(statsData);
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="admin-dashboard" aria-busy="true" aria-label="Loading platform overview">
                <div className="dashboard-toolbar">
                    <div className="skeleton-block" style={{ width: '180px', height: '24px' }} />
                    <div className="skeleton-block" style={{ width: '260px', height: '32px', borderRadius: '9999px' }} />
                </div>
                <div className="stats-grid">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="stat-card" style={{ pointerEvents: 'none' }}>
                            <div className="stat-card-top">
                                <div className="skeleton-block" style={{ width: '90px', height: '14px' }} />
                                <div className="skeleton-block" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                            </div>
                            <div className="skeleton-block" style={{ width: '64px', height: '28px', marginTop: '8px', marginBottom: '10px' }} />
                            <div className="skeleton-block" style={{ width: '120px', height: '12px' }} />
                        </div>
                    ))}
                </div>
                <div className="dashboard-main-grid">
                    <div className="recent-section">
                        <div className="skeleton-block" style={{ width: '140px', height: '18px', marginBottom: '16px' }} />
                        {[0, 1, 2, 3].map((r) => (
                            <div key={r} className="skeleton-block" style={{ width: '100%', height: '44px', marginBottom: '8px' }} />
                        ))}
                    </div>
                    <div className="recent-section">
                        <div className="skeleton-block" style={{ width: '120px', height: '18px', marginBottom: '16px' }} />
                        {[0, 1, 2, 3].map((r) => (
                            <div key={r} className="skeleton-block" style={{ width: '100%', height: '44px', marginBottom: '8px' }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="error-state" role="alert">
                    <AlertCircle size={32} strokeWidth={1.5} aria-hidden="true" />
                    <h3>Unable to load platform metrics</h3>
                    <p>{error}</p>
                    <button type="button" onClick={() => window.location.reload()}>Reload metrics</button>
                </div>
            </div>
        );
    }

    const pendingApprovals = stats?.pending_approvals ?? 0;
    const agentsTotal = stats?.agents?.total ?? null;
    const agentsVerified = stats?.agents?.verified ?? 0;
    const agentsPending = stats?.agents?.pending ?? 0;
    const propsTotal = stats?.properties?.total ?? null;
    const propsPublished = stats?.properties?.published ?? 0;
    const propsPending = stats?.properties?.pending ?? 0;
    const inquiriesTotal = stats?.inquiries?.total ?? null;
    const inquiriesNew = stats?.inquiries?.new ?? 0;

    return (
        <div className="admin-dashboard">
            {/* Compact Header + Pill Toolbar (dashboard-design House Style) */}
            <header className="dashboard-toolbar">
                <div className="dashboard-title-group">
                    <h1>Platform overview</h1>
                    <span className="status-live-pill" title="Live database metrics">
                        <span className="status-live-dot" aria-hidden="true" />
                        <span>Live</span>
                    </span>
                </div>

                <nav className="toolbar-pills" aria-label="Quick actions">
                    <button type="button" className="toolbar-pill" onClick={() => navigate('/admin/verifications')}>
                        <CheckCircle2 size={15} strokeWidth={1.5} aria-hidden="true" />
                        <span>Verifications</span>
                        {pendingApprovals > 0 && (
                            <span className="toolbar-pill-count tabular-nums">{pendingApprovals}</span>
                        )}
                    </button>
                    <button type="button" className="toolbar-pill" onClick={() => navigate('/admin/properties')}>
                        <Building2 size={15} strokeWidth={1.5} aria-hidden="true" />
                        <span>Properties</span>
                    </button>
                    <button type="button" className="toolbar-pill" onClick={() => navigate('/admin/agents')}>
                        <Users size={15} strokeWidth={1.5} aria-hidden="true" />
                        <span>Agents</span>
                    </button>
                    <button type="button" className="toolbar-pill" onClick={() => navigate('/admin/users')}>
                        <Eye size={15} strokeWidth={1.5} aria-hidden="true" />
                        <span>Users</span>
                    </button>
                </nav>
            </header>

            {/* KPI Cards — Wordless, tabular-nums, Quiet until attention needed */}
            <div className="stats-grid">
                {/* 1. Pending Approvals — Warm attention hue ONLY when pendingApprovals > 0 */}
                <button
                    type="button"
                    className={`stat-card ${pendingApprovals > 0 ? 'needs-attention' : ''}`}
                    onClick={() => navigate('/admin/verifications')}
                >
                    <div className="stat-card-top">
                        <span className="stat-label">Pending approvals</span>
                        <div className={`stat-icon ${pendingApprovals > 0 ? 'attention' : 'neutral'}`} aria-hidden="true">
                            <AlertCircle size={16} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="stat-number tabular-nums">
                        {pendingApprovals}
                    </div>
                    <div className="stat-meta">
                        {pendingApprovals > 0 ? (
                            <span className="meta-attention">
                                Review queue <ArrowUpRight size={13} strokeWidth={1.5} aria-hidden="true" />
                            </span>
                        ) : (
                            <span className="meta-neutral">All clear</span>
                        )}
                    </div>
                </button>

                {/* 2. Agents (Entity: People = Blue) */}
                <button
                    type="button"
                    className="stat-card"
                    onClick={() => navigate('/admin/agents')}
                >
                    <div className="stat-card-top">
                        <span className="stat-label">Agents</span>
                        <div className="stat-icon people" aria-hidden="true">
                            <Users size={16} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="stat-number tabular-nums">
                        {agentsTotal !== null ? agentsTotal.toLocaleString() : '—'}
                    </div>
                    <div className="stat-meta tabular-nums">
                        <span className="meta-neutral">{agentsVerified} verified</span>
                        {agentsPending > 0 && (
                            <>
                                <span className="meta-sep" aria-hidden="true">·</span>
                                <span className="meta-attention">{agentsPending} pending</span>
                            </>
                        )}
                    </div>
                </button>

                {/* 3. Properties (Entity: Inventory = Neutral Slate) */}
                <button
                    type="button"
                    className="stat-card"
                    onClick={() => navigate('/admin/properties')}
                >
                    <div className="stat-card-top">
                        <span className="stat-label">Properties</span>
                        <div className="stat-icon neutral" aria-hidden="true">
                            <Building2 size={16} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="stat-number tabular-nums">
                        {propsTotal !== null ? propsTotal.toLocaleString() : '—'}
                    </div>
                    <div className="stat-meta tabular-nums">
                        <span className="meta-neutral">{propsPublished} published</span>
                        {propsPending > 0 && (
                            <>
                                <span className="meta-sep" aria-hidden="true">·</span>
                                <span className="meta-attention">{propsPending} draft</span>
                            </>
                        )}
                    </div>
                </button>

                {/* 4. Inquiries (Entity: People/Traffic = Blue) */}
                <button
                    type="button"
                    className="stat-card"
                    onClick={() => navigate('/admin/inquiries')}
                >
                    <div className="stat-card-top">
                        <span className="stat-label">Inquiries</span>
                        <div className="stat-icon people" aria-hidden="true">
                            <MessageSquare size={16} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="stat-number tabular-nums">
                        {inquiriesTotal !== null ? inquiriesTotal.toLocaleString() : '—'}
                    </div>
                    <div className="stat-meta tabular-nums">
                        {inquiriesNew > 0 ? (
                            <span className="meta-people">{inquiriesNew} unread</span>
                        ) : (
                            <span className="meta-neutral">0 unread</span>
                        )}
                    </div>
                </button>
            </div>

            {/* Above-the-fold Main Monitoring Grid: Bookings Table + Activity Stream */}
            <div className="dashboard-main-grid">
                {/* Recent Bookings (Tabular right-aligned money, honest '—' when price missing) */}
                <section className="recent-section" aria-labelledby="admin-recent-bookings-heading">
                    <div className="section-head-row">
                        <h2 id="admin-recent-bookings-heading">Recent bookings</h2>
                        <span className="section-count-pill tabular-nums">
                            {stats?.recent_bookings?.length || 0}
                        </span>
                    </div>

                    {stats?.recent_bookings && stats.recent_bookings.length > 0 ? (
                        <div className="table-scroll-wrap">
                            <table className="recent-table">
                                <caption className="visually-hidden">Recent property bookings</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">Property &amp; Guest</th>
                                        <th scope="col">Dates</th>
                                        <th scope="col">Status</th>
                                        <th scope="col" className="num-col">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recent_bookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td>
                                                <div className="cell-primary">{booking.property_title || '—'}</div>
                                                <div className="cell-secondary">{booking.guest_name || booking.guest_email || '—'}</div>
                                            </td>
                                            <td className="tabular-nums cell-dates">
                                                {booking.check_in ? new Date(booking.check_in).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                                                {' → '}
                                                {booking.check_out ? new Date(booking.check_out).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                                            </td>
                                            <td>
                                                <span className={`booking-status ${booking.status || 'pending'}`}>
                                                    {booking.status || 'pending'}
                                                </span>
                                            </td>
                                            <td className="num-col tabular-nums booking-amount">
                                                {booking.total_price != null
                                                    ? `$${Number(booking.total_price).toLocaleString()}`
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="empty-state">No bookings recorded in this period.</p>
                    )}
                </section>

                {/* Activity Stream */}
                <section className="recent-section" aria-labelledby="admin-recent-activity-heading">
                    <div className="section-head-row">
                        <h2 id="admin-recent-activity-heading">Activity log</h2>
                        <span className="section-count-pill tabular-nums">
                            {stats?.recent_activity?.length || 0}
                        </span>
                    </div>

                    <div className="activity-list">
                        {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                            stats.recent_activity.map((activity, index) => (
                                <div key={index} className="activity-item">
                                    <div className="activity-icon" aria-hidden="true">
                                        {activity.type === 'user_registered' && <Users size={15} strokeWidth={1.5} />}
                                        {activity.type === 'user_login' && <LogIn size={15} strokeWidth={1.5} />}
                                        {activity.type === 'property_listed' && <Building2 size={15} strokeWidth={1.5} />}
                                        {activity.type === 'property_liked' && <Heart size={15} strokeWidth={1.5} />}
                                        {activity.type === 'property_viewed' && <Eye size={15} strokeWidth={1.5} />}
                                        {activity.type === 'booking_created' && <CheckCircle2 size={15} strokeWidth={1.5} />}
                                        {activity.type === 'inquiry_received' && <MessageSquare size={15} strokeWidth={1.5} />}
                                        {activity.type === 'agent_verified' && <CheckCircle2 size={15} strokeWidth={1.5} />}
                                        {activity.type === 'agent_rejected' && <XCircle size={15} strokeWidth={1.5} />}
                                        {!['user_registered', 'user_login', 'property_listed', 'property_liked', 'property_viewed', 'booking_created', 'inquiry_received', 'agent_verified', 'agent_rejected'].includes(activity.type) && <Clock size={15} strokeWidth={1.5} />}
                                    </div>
                                    <div className="activity-content">
                                        <p>{activity.description}</p>
                                        <span className="activity-time tabular-nums">
                                            {activity.timestamp
                                                ? new Date(activity.timestamp).toLocaleString('en-GB', {
                                                      day: '2-digit',
                                                      month: 'short',
                                                      hour: '2-digit',
                                                      minute: '2-digit'
                                                  })
                                                : '—'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-state">No recent events logged.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AdminDashboard;
