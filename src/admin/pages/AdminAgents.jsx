import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Eye, CheckCircle2, XCircle, Ban, UserCheck,
    BarChart3, Shield, FileText, Users, Clock, ShieldCheck, ShieldOff
} from 'lucide-react';
import adminApi from '../../utils/adminApi';
import { getProfileImageUrl } from '../../utils/imageUtils';
import './AdminAgents.css';

function AdminAgents() {
    const navigate = useNavigate();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [docModal, setDocModal] = useState(null);

    useEffect(() => { fetchAgents(); }, []);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getUsers({ role: 'agent' });
            setAgents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch agents:', err);
            setAgents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAgent = async (agentId) => {
        if (!confirm('Verify this agent? This will grant them the Verified Agent badge.')) return;
        try {
            await adminApi.verifyAgent(agentId);
            fetchAgents();
            setDocModal(null);
        } catch (err) { alert('Failed to verify agent: ' + err.message); }
    };

    const handleRejectAgent = async (agentId) => {
        if (!confirm('Reject this agent verification?')) return;
        try {
            await adminApi.rejectAgent(agentId);
            fetchAgents();
            setDocModal(null);
        } catch (err) { alert('Failed to reject agent: ' + err.message); }
    };

    const handleSuspendAgent = async (agentId) => {
        if (!confirm('Suspend this agent?')) return;
        try {
            await adminApi.updateAgentStatus(agentId, 'suspended');
            fetchAgents();
        } catch (err) { alert('Failed to suspend agent: ' + err.message); }
    };

    const handleActivateAgent = async (agentId) => {
        try {
            await adminApi.updateAgentStatus(agentId, 'active');
            fetchAgents();
        } catch (err) { alert('Failed to activate agent: ' + err.message); }
    };

    const handleViewPerformance = (agentId) => {
        navigate(`/admin/agents/${agentId}/profile`);
    };

    const handleImpersonate = async (agentId) => {
        if (!confirm("Access this agent's portal?")) return;
        try {
            const result = await adminApi.impersonateUser(agentId);
            sessionStorage.setItem('impersonating', JSON.stringify(result.impersonated_user));
            sessionStorage.setItem('admin_id', result.admin_id);
            navigate('/agent/dashboard');
        } catch (err) { alert('Failed to impersonate: ' + err.message); }
    };

    const handleViewProfile = (userId) => navigate(`/admin/users/${userId}/profile`);

    const filteredAgents = agents.filter(agent => {
        const matchesSearch =
            agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
        const matchesVerification = filterRole === 'all' || agent.agent_status === filterRole;
        return matchesSearch && matchesStatus && matchesVerification;
    });

    // Stats
    const total     = agents.length;
    const verified  = agents.filter(a => a.agent_status === 'verified').length;
    const pending   = agents.filter(a => a.agent_status === 'pending').length;
    const suspended = agents.filter(a => a.status === 'suspended').length;

    const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

    return (
        <div className="admin-agents">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Agent Management</h1>
                    <p>Manage and monitor all agents on the platform</p>
                </div>
            </div>

            {/* Stats Strip */}
            <div className="stats-strip">
                <div className="strip-card">
                    <div className="strip-card-icon blue"><Users size={20} /></div>
                    <div className="strip-card-info">
                        <h3>{total}</h3>
                        <p>Total Agents</p>
                    </div>
                </div>
                <div className="strip-card">
                    <div className="strip-card-icon green"><ShieldCheck size={20} /></div>
                    <div className="strip-card-info">
                        <h3>{verified}</h3>
                        <p>Verified</p>
                    </div>
                </div>
                <div className="strip-card">
                    <div className="strip-card-icon amber"><Clock size={20} /></div>
                    <div className="strip-card-info">
                        <h3>{pending}</h3>
                        <p>Pending Review</p>
                    </div>
                </div>
                <div className="strip-card">
                    <div className="strip-card-icon purple"><ShieldOff size={20} /></div>
                    <div className="strip-card-info">
                        <h3>{suspended}</h3>
                        <p>Suspended</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search agents by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select className="filter-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                    <option value="all">All Verification Status</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All Account Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <span>Loading agents...</span>
                </div>
            ) : (
                <div className="table-wrapper">
                    <div className="table-header">
                        <h3>All Agents</h3>
                        <span className="table-count">{filteredAgents.length} agents</span>
                    </div>
                    <div className="table-scroll">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Agent</th>
                                    <th>Contact</th>
                                    <th>Verification</th>
                                    <th>Account</th>
                                    <th>Member Since</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAgents.map(agent => (
                                    <tr key={agent.id}>
                                        <td>
                                            <div className="agent-cell">
                                                <div className="agent-avatar-sm">
                                                    {agent.avatar_url ? (
                                                        <img
                                                            src={getProfileImageUrl(agent.avatar_url)}
                                                            alt={agent.name}
                                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                        />
                                                    ) : null}
                                                    <span style={{ display: agent.avatar_url ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                                        {getInitials(agent.name)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="agent-name">
                                                        {agent.name}
                                                        {agent.agent_status === 'verified' && (
                                                            <Shield size={12} style={{ color: '#1a5f9e', marginLeft: 4, verticalAlign: 'middle' }} />
                                                        )}
                                                    </div>
                                                    <div className="agent-email">{agent.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.8125rem', color: '#1e293b' }}>{agent.email}</div>
                                            {agent.phone && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{agent.phone}</div>}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${agent.agent_status || 'none'}`}>
                                                {agent.agent_status === 'verified' && <ShieldCheck size={11} />}
                                                {agent.agent_status === 'pending'  && <Clock size={11} />}
                                                {agent.agent_status === 'rejected' && <XCircle size={11} />}
                                                {agent.agent_status || 'Not Requested'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${agent.status}`}>
                                                {agent.status}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                                            {new Date(agent.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {agent.agent_status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="action-btn documents"
                                                            onClick={() => setDocModal(agent)}
                                                            title="Review Documents"
                                                        >
                                                            <FileText size={15} />
                                                        </button>
                                                        <button
                                                            className="action-btn approve"
                                                            onClick={() => handleVerifyAgent(agent.id)}
                                                            title="Verify Agent"
                                                        >
                                                            <CheckCircle2 size={15} />
                                                        </button>
                                                        <button
                                                            className="action-btn reject"
                                                            onClick={() => handleRejectAgent(agent.id)}
                                                            title="Reject"
                                                        >
                                                            <XCircle size={15} />
                                                        </button>
                                                    </>
                                                )}
                                                {agent.status === 'active' ? (
                                                    <button className="action-btn" onClick={() => handleSuspendAgent(agent.id)} title="Suspend">
                                                        <Ban size={15} />
                                                    </button>
                                                ) : (
                                                    <button className="action-btn approve" onClick={() => handleActivateAgent(agent.id)} title="Activate">
                                                        <UserCheck size={15} />
                                                    </button>
                                                )}
                                                <button className="action-btn view" onClick={() => handleViewPerformance(agent.id)} title="Performance">
                                                    <BarChart3 size={15} />
                                                </button>
                                                <button className="action-btn view" onClick={() => handleImpersonate(agent.id)} title="Access Portal">
                                                    <Eye size={15} />
                                                </button>
                                                <button className="action-btn view" onClick={() => handleViewProfile(agent.id)} title="View Profile">
                                                    <UserCheck size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredAgents.length === 0 && (
                            <div className="empty-state">
                                <Users size={40} />
                                <h3>No agents found</h3>
                                <p>Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Document Review Modal */}
            {docModal && (
                <div className="admin-modal-overlay" onClick={() => setDocModal(null)}>
                    <div className="admin-modal document-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                <div className="strip-card-icon blue" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }}>
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h2>Verification Documents</h2>
                                    <p>Agent: <strong>{docModal.name}</strong></p>
                                </div>
                            </div>
                            <button className="btn-close" onClick={() => setDocModal(null)}>
                                <XCircle size={22} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Agent summary */}
                            <div className="agent-summary-card">
                                <div className="agent-avatar-sm" style={{ width: 52, height: 52, fontSize: '1.125rem' }}>
                                    {docModal.avatar_url
                                        ? <img src={getProfileImageUrl(docModal.avatar_url)} alt={docModal.name} />
                                        : getInitials(docModal.name)
                                    }
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>{docModal.name}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.8125rem' }}>{docModal.email}</div>
                                    {docModal.phone && <div style={{ color: '#64748b', fontSize: '0.8125rem' }}>{docModal.phone}</div>}
                                </div>
                                <span className="status-badge pending" style={{ marginLeft: 'auto' }}>
                                    <Clock size={11} /> Pending Review
                                </span>
                            </div>

                            <div className="docs-review-list">
                                {docModal.verification_documents?.length > 0 ? (
                                    docModal.verification_documents.map((doc, idx) => (
                                        <div key={idx} className="review-item">
                                            <div className="review-doc-info">
                                                <div className="review-doc-icon"><FileText size={22} /></div>
                                                <div>
                                                    <span className="doc-name">{doc.name}</span>
                                                    <span className="doc-meta">
                                                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <a href={doc.url} target="_blank" rel="noreferrer" className="btn-view-full">
                                                <Eye size={14} /> View Document
                                            </a>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-docs-notice">
                                        <FileText size={32} style={{ color: '#cbd5e1', marginBottom: 8 }} />
                                        <p>No documents uploaded yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <div className="verification-actions">
                                <button className="btn-approve-large" onClick={() => handleVerifyAgent(docModal.id)}>
                                    <CheckCircle2 size={16} /> Verify Agent
                                </button>
                                <button className="btn-reject-large" onClick={() => handleRejectAgent(docModal.id)}>
                                    <XCircle size={16} /> Reject
                                </button>
                            </div>
                            <button className="btn-cancel" onClick={() => setDocModal(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminAgents;
