import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, CheckCircle2, XCircle, Ban, UserCheck, BarChart3, Shield, FileText } from 'lucide-react';
import adminApi from '../../utils/adminApi';
import api from '../../utils/api';
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

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const params = { role: 'agent' };
            const data = await adminApi.getUsers(params);

            if (Array.isArray(data)) {
                setAgents(data);
            } else {
                console.error('Expected array from getUsers, got:', data);
                setAgents([]);
            }
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
        } catch (err) {
            alert('Failed to verify agent: ' + err.message);
        }
    };

    const handleRejectAgent = async (agentId) => {
        if (!confirm('Reject this agent verification?')) return;

        try {
            await adminApi.rejectAgent(agentId);
            fetchAgents();
            setDocModal(null);
        } catch (err) {
            alert('Failed to reject agent: ' + err.message);
        }
    };

    const handleSuspendAgent = async (agentId) => {
        if (!confirm('Suspend this agent?')) return;

        try {
            await adminApi.updateAgentStatus(agentId, 'suspended');
            fetchAgents();
        } catch (err) {
            alert('Failed to suspend agent: ' + err.message);
        }
    };

    const handleActivateAgent = async (agentId) => {
        try {
            await adminApi.updateAgentStatus(agentId, 'active');
            fetchAgents();
        } catch (err) {
            alert('Failed to activate agent: ' + err.message);
        }
    };

    const handleViewPerformance = async (agentId) => {
        try {
            const performance = await adminApi.getAgentPerformance(agentId);
            alert(`Agent Performance: \n\nProperties: ${performance.properties} \nInquiries: ${performance.inquiries} \nBookings: ${performance.bookings} `);
        } catch (err) {
            alert('Failed to load performance: ' + err.message);
        }
    };

    const handleImpersonate = async (agentId) => {
        if (!confirm('Access this agent\'s portal? You will be able to see their dashboard.')) return;

        try {
            const result = await adminApi.impersonateUser(agentId);
            // Store impersonation data
            sessionStorage.setItem('impersonating', JSON.stringify(result.impersonated_user));
            sessionStorage.setItem('admin_id', result.admin_id);

            // Navigate to agent dashboard
            navigate('/agent/dashboard');
        } catch (err) {
            alert('Failed to impersonate: ' + err.message);
        }
    };

    const handleViewProfile = (userId) => {
        navigate(`/admin/users/${userId}/profile`);
    };

    const filteredAgents = agents.filter(agent => {
        const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
        const matchesAgentStatus = filterRole === 'all' || agent.agent_status === filterRole;

        return matchesSearch && matchesStatus && matchesAgentStatus;
    });

    return (
        <div className="admin-agents">
            <div className="page-header">
                <h1>Agent Management</h1>
                <p>Manage and monitor all agents on the platform</p>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search agents by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                    <option value="all">All Verification Status</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                </select>

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All Account Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                </select>
            </div>

            {/* Agents Table */}
            {loading ? (
                <div className="loading-state">Loading agents...</div>
            ) : (
                <div className="agents-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Agent</th>
                                <th>Contact</th>
                                <th>Verification</th>
                                <th>Status</th>
                                <th>Member Since</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAgents.map(agent => (
                                <tr key={agent.id}>
                                    <td>
                                        <div className="agent-cell">
                                            <div className="agent-avatar-small">
                                                {agent.avatar_url ? (
                                                    <img
                                                        src={getProfileImageUrl(agent.avatar_url)}
                                                        alt={agent.name}
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    agent.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <strong>{agent.name}</strong>
                                                {agent.agent_status === 'verified' && (
                                                    <Shield size={14} className="verified-icon" />
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <div>{agent.email}</div>
                                            {agent.phone && <div className="phone">{agent.phone}</div>}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge verification - ${agent.agent_status || 'none'} `}>
                                            {agent.agent_status || 'Not Requested'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge status - ${agent.status} `}>
                                            {agent.status}
                                        </span>
                                    </td>
                                    <td>{new Date(agent.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {agent.agent_status === 'pending' && (
                                                <button
                                                    className="btn-icon documents"
                                                    onClick={() => setDocModal(agent)}
                                                    title="Review Documents"
                                                >
                                                    <FileText size={16} />
                                                </button>
                                            )}

                                            {agent.agent_status === 'pending' && (
                                                <>
                                                    <button
                                                        className="btn-icon approve"
                                                        onClick={() => handleVerifyAgent(agent.id)}
                                                        title="Verify Agent"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                    <button
                                                        className="btn-icon reject"
                                                        onClick={() => handleRejectAgent(agent.id)}
                                                        title="Reject"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}

                                            {agent.status === 'active' ? (
                                                <button
                                                    className="btn-icon suspend"
                                                    onClick={() => handleSuspendAgent(agent.id)}
                                                    title="Suspend"
                                                >
                                                    <Ban size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn-icon activate"
                                                    onClick={() => handleActivateAgent(agent.id)}
                                                    title="Activate"
                                                >
                                                    <UserCheck size={16} />
                                                </button>
                                            )}

                                            <button
                                                className="btn-icon performance"
                                                onClick={() => handleViewPerformance(agent.id)}
                                                title="View Performance"
                                            >
                                                <BarChart3 size={16} />
                                            </button>

                                            <button
                                                className="btn-icon impersonate"
                                                onClick={() => handleImpersonate(agent.id)}
                                                title="Access Agent Portal"
                                            >
                                                <Eye size={16} />
                                            </button>

                                            <button
                                                className="btn-icon view"
                                                onClick={() => handleViewProfile(agent.id)}
                                                title="View Full Profile"
                                            >
                                                <UserCheck size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {
                        filteredAgents.length === 0 && (
                            <div className="empty-state">
                                <p>No agents found matching your filters.</p>
                            </div>
                        )
                    }
                </div >
            )
            }

            {/* Document Review Modal */}
            {docModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal document-modal">
                        <div className="modal-header">
                            <div>
                                <h2>Review Verification Documents</h2>
                                <p>Agent: <strong>{docModal.name}</strong></p>
                            </div>
                            <button className="btn-close" onClick={() => setDocModal(null)}>
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="docs-review-list">
                                {docModal.verification_documents && docModal.verification_documents.length > 0 ? (
                                    docModal.verification_documents.map((doc, idx) => (
                                        <div key={idx} className="review-item">
                                            <div className="review-doc-info">
                                                <div className="review-doc-icon">
                                                    <FileText size={24} />
                                                </div>
                                                <div>
                                                    <span className="doc-name">{doc.name}</span>
                                                    <span className="doc-meta">
                                                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn-view-full"
                                            >
                                                <Eye size={16} />
                                                View Full Document
                                            </a>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-docs-notice">
                                        No documents uploaded.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <div className="verification-actions">
                                <button
                                    className="btn-approve-large"
                                    onClick={() => handleVerifyAgent(docModal.id)}
                                >
                                    <CheckCircle2 size={18} />
                                    Verify Agent
                                </button>
                                <button
                                    className="btn-reject-large"
                                    onClick={() => handleRejectAgent(docModal.id)}
                                >
                                    <XCircle size={18} />
                                    Reject Verification
                                </button>
                            </div>
                            <button className="btn-cancel" onClick={() => setDocModal(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}

export default AdminAgents;
