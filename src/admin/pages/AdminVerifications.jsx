import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader, Mail, Phone, Calendar, Info, FileText, Eye, ShieldCheck, User } from 'lucide-react';
import DataTable from '../components/DataTable';
import adminApi from '../../utils/adminApi';
import api from '../../utils/api';
import './AdminVerifications.css';

function AdminVerifications() {
    const navigate = useNavigate();
    const [pendingAgents, setPendingAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [docModal, setDocModal] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await adminApi.getPendingAgents();
            // Data handling: safely extract from response
            const agentsData = Array.isArray(res) ? res : (res?.data || []);
            setPendingAgents(agentsData);
        } catch (error) {
            console.error("Failed to load pending agents:", error);
            setError("Failed to load pending requests. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (userId) => {
        if (!window.confirm("Verify this agent? They will receive the Verified Agent badge.")) return;

        try {
            setProcessing(userId);
            await adminApi.verifyAgent(userId);
            setDocModal(null);
            await fetchData();
        } catch (error) {
            console.error("Verification failed:", error);
            alert("Failed to verify agent");
        } finally {
            setProcessing(null);
        }
    };

    const normalizeDocUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http') || url.startsWith('https') || url.startsWith('blob:')) {
            return url;
        }
        if (url.startsWith('/static')) {
            const apiBase = api.defaults.baseURL.split('/api/v1')[0];
            return `${apiBase}${url}`;
        }
        return url;
    };

    const handleReject = async (userId) => {
        const reason = window.prompt("Reason for rejection (optional):");
        if (reason === null) return; // Cancelled

        try {
            setProcessing(userId);
            await adminApi.rejectAgent(userId, { reason });
            setDocModal(null);
            await fetchData();
        } catch (error) {
            console.error("Rejection failed:", error);
            alert("Failed to reject agent");
        } finally {
            setProcessing(null);
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Agent Details',
            width: '35%',
            render: (value, row) => (
                <div className="user-cell">
                    <div className="user-avatar-small agent-pending">
                        {value ? value.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{value}</span>
                        <span className="user-email">{row.email}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'phone',
            label: 'Contact',
            width: '20%',
            render: (value) => (
                <div className="contact-cell">
                    <div className="contact-item">
                        <Phone size={14} />
                        <span>{value || 'No phone'}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'created_at',
            label: 'Requested On',
            width: '20%',
            render: (value) => (
                <div className="date-cell">
                    <Calendar size={14} />
                    <span>{new Date(value).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Review Actions',
            width: '25%',
            render: (_, row) => (
                <div className="action-buttons">
                    <button
                        className="btn-review"
                        onClick={() => setDocModal(row)}
                        title="Review Documents"
                    >
                        <FileText size={16} />
                        <span>Review Docs</span>
                    </button>
                    <button
                        className="btn-icon view"
                        title="View Profile"
                        onClick={() => navigate(`/admin/users/${row.id}/profile`)}
                    >
                        <User size={16} />
                    </button>
                    <button
                        className="btn-icon approve"
                        title="Quick Approve"
                        onClick={() => handleVerify(row.id)}
                        disabled={processing === row.id}
                    >
                        <CheckCircle2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="admin-verifications">
            <div className="page-header">
                <div className="header-info">
                    <h1>Agent Verifications</h1>
                    <p>Manage and verify property agent registrations and credentials</p>
                </div>
                <div className="header-stats">
                    <div className="stat-pill">
                        <ShieldCheck size={18} />
                        <span>{pendingAgents.length} Pending Requests</span>
                    </div>
                </div>
            </div>

            {error && <div className="error-notice">{error}</div>}

            {loading ? (
                <div className="loading-state">
                    <Loader className="animate-spin" size={32} />
                    <p>Fetching pending requests...</p>
                </div>
            ) : (
                <div className="table-container fade-in">
                    <DataTable
                        data={pendingAgents}
                        columns={columns}
                        emptyMessage="No pending agent verifications found."
                    />
                </div>
            )}

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
                            {/* Agent Info Section */}
                            <div className="agent-info-section">
                                <h3 className="section-label"><User size={16} /> Agent Information</h3>
                                <div className="agent-info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Full Name</span>
                                        <span className="info-value">{docModal.name || '—'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Email</span>
                                        <span className="info-value">{docModal.email || '—'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Phone</span>
                                        <span className="info-value">{docModal.phone || '—'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Requested On</span>
                                        <span className="info-value">{docModal.created_at ? new Date(docModal.created_at).toLocaleDateString() : '—'}</span>
                                    </div>
                                    {docModal.national_id_number && (
                                        <div className="info-item">
                                            <span className="info-label">National ID</span>
                                            <span className="info-value">{docModal.national_id_number}</span>
                                        </div>
                                    )}
                                    {docModal.date_of_birth && (
                                        <div className="info-item">
                                            <span className="info-label">Date of Birth</span>
                                            <span className="info-value">{docModal.date_of_birth}</span>
                                        </div>
                                    )}
                                    {docModal.location && (
                                        <div className="info-item">
                                            <span className="info-label">Location</span>
                                            <span className="info-value">{docModal.location}</span>
                                        </div>
                                    )}
                                    {docModal.motivation && (
                                        <div className="info-item full-width">
                                            <span className="info-label">Motivation</span>
                                            <span className="info-value motivation-text">{docModal.motivation}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Documents Section */}
                            <h3 className="section-label"><FileText size={16} /> Uploaded Documents</h3>
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
                                                href={normalizeDocUrl(doc.url)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn-view-full"
                                            >
                                                <Eye size={16} />
                                                View Document
                                            </a>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-docs-notice">
                                        <div className="notice-icon">
                                            <Info size={32} />
                                        </div>
                                        <p>No documents have been uploaded by this agent yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <div className="verification-actions">
                                <button
                                    className="btn-approve-large"
                                    onClick={() => handleVerify(docModal.id)}
                                    disabled={processing === docModal.id}
                                >
                                    {processing === docModal.id ? <Loader className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                    Verify Agent
                                </button>
                                <button
                                    className="btn-reject-large"
                                    onClick={() => handleReject(docModal.id)}
                                    disabled={processing === docModal.id}
                                >
                                    <XCircle size={18} />
                                    Reject
                                </button>
                            </div>
                            <button className="btn-cancel" onClick={() => setDocModal(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminVerifications;
