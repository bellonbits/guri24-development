import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
    X, Mail, Phone, MapPin, Calendar, Shield, User,
    CheckCircle, AlertCircle, FileText, ExternalLink,
    Award, Briefcase, Activity
} from 'lucide-react';
import adminApi from '../../utils/adminApi';
import { getProfileImageUrl } from '../../utils/imageUtils';
import './UserProfileModal.css';

const UserProfileModal = ({ isOpen, onClose, userId }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Manage Page Scrolling
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserDetails();
        }
    }, [isOpen, userId]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await adminApi.getUserById(userId);
            setUserData(data);
        } catch (err) {
            console.error('Failed to fetch user details:', err);
            setError('Failed to load user information.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const normalizeDocUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http') || url.startsWith('https')) return url;
        return `https://api.guri24.com${url.startsWith('/') ? '' : '/'}${url}`;
    };

    // Use Portal to ensure modal is at body level for correct "Page Scroll"
    return ReactDOM.createPortal(
        <div className="user-profile-modal-overlay" onClick={onClose}>
            {/* Flattened: modal-content is now the main container */}
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>
                    <X size={24} />
                </button>

                {loading ? (
                    <div className="modal-loading">
                        <div className="spinner"></div>
                        <p>Loading profile details...</p>
                    </div>
                ) : error ? (
                    <div className="modal-error">
                        <AlertCircle size={48} />
                        <p>{error}</p>
                        <button onClick={fetchUserDetails} className="btn-retry">Retry</button>
                    </div>
                ) : userData && (
                    <>
                        {/* Premium Header Section */}
                        <div className="modal-header-premium">
                            <div className="profile-banner">
                                <div className="banner-gradient"></div>
                                <div className="profile-header-content">
                                    <div className="profile-avatar-section">
                                        <div className="avatar-wrapper">
                                            <div className="avatar-large">
                                                {userData.avatar_url ? (
                                                    <img src={getProfileImageUrl(userData.avatar_url)} alt={userData.name} />
                                                ) : (
                                                    userData.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className={`status-indicator-ring ${userData.status}`}></div>
                                        </div>
                                        <div className="profile-header-info">
                                            <h1>{userData.name}</h1>
                                            <div className="profile-meta">
                                                <span className="role-tag">
                                                    {userData.role === 'agent' ? <Briefcase size={14} /> : <User size={14} />}
                                                    {userData.role}
                                                </span>
                                                <span className="member-since">
                                                    <Calendar size={14} />
                                                    Joined {new Date(userData.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                </span>
                                                {userData.agent_status && (
                                                    <span className={`verification-badge-header ${userData.agent_status}`}>
                                                        {userData.agent_status === 'verified' && <Award size={14} />}
                                                        {userData.agent_status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Layout */}
                        <div className="profile-main-content-modal">
                            {/* Left Column - Stats & Quick Info */}
                            <aside className="profile-sidebar-modal">
                                <div className="info-card-modal">
                                    <h3>Account Overview</h3>
                                    <div className="info-list-modal">
                                        <div className="info-item-modal">
                                            <span className="info-label"><Mail size={14} /> Email</span>
                                            <span className="info-value">{userData.email}</span>
                                        </div>
                                        <div className="info-item-modal">
                                            <span className="info-label"><Phone size={14} /> Phone</span>
                                            <span className="info-value">{userData.phone || '—'}</span>
                                        </div>
                                        <div className="info-item-modal">
                                            <span className="info-label"><MapPin size={14} /> Location</span>
                                            <span className="info-value">{userData.location || '—'}</span>
                                        </div>
                                        <div className="info-item-modal">
                                            <span className="info-label"><Activity size={14} /> Last Login</span>
                                            <span className="info-value">{userData.last_login ? new Date(userData.last_login).toLocaleDateString() : 'Never'}</span>
                                        </div>
                                        <div className="info-item-modal">
                                            <span className="info-label"><Shield size={14} /> User ID</span>
                                            <span className="info-value mono-text">{userData.id}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-card-modal">
                                    <h3>Verification Status</h3>
                                    <div className="status-list-modal">
                                        <div className="status-item-modal">
                                            <span className="status-label">Email</span>
                                            <span className={`status-badge-modal ${userData.email_verified ? 'verified' : 'unverified'}`}>
                                                {userData.email_verified ? 'Verified' : 'Unverified'}
                                            </span>
                                        </div>
                                        <div className="status-item-modal">
                                            <span className="status-label">Agent Status</span>
                                            <span className={`status-badge-modal ${userData.agent_status || 'none'}`}>
                                                {userData.agent_status || 'Not Requested'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            {/* Right Column - User Details */}
                            <div className="profile-content-main-modal">
                                <div className="unified-section-modal">
                                    <h3 className="section-title-modal">Professional Biography</h3>
                                    <p className="unified-bio-text-modal">{userData.bio || 'No biography provided.'}</p>
                                </div>

                                {userData.role === 'agent' && (
                                    <div className="unified-section-modal">
                                        <h3 className="section-title-modal">Company & Specialization</h3>
                                        <div className="detail-grid-modal">
                                            <div className="detail-item-modal">
                                                <span className="detail-label"><Briefcase size={14} /> Company</span>
                                                <span className="detail-value">{userData.company || '—'}</span>
                                            </div>
                                            <div className="detail-item-modal">
                                                <span className="detail-label"><Award size={14} /> Specialization</span>
                                                <span className="detail-value">{userData.specialization || '—'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="unified-section-modal">
                                    <h3 className="section-title-modal">Verification Documents</h3>
                                    {userData.verification_documents && userData.verification_documents.length > 0 ? (
                                        <div className="unified-docs-list-modal">
                                            {userData.verification_documents.map((doc, idx) => (
                                                <div key={idx} className="unified-doc-item-modal">
                                                    <div className="doc-icon-box-modal">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="doc-meta-modal">
                                                        <span className="doc-name-modal">{doc.name}</span>
                                                        <span className="doc-date-modal">Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <a href={normalizeDocUrl(doc.url)} target="_blank" rel="noreferrer" className="btn-view-doc-modal">
                                                        View <ExternalLink size={12} />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="unified-no-docs-modal">
                                            <p>No verification documents attached.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};

export default UserProfileModal;
