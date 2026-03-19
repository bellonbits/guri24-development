import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, Award, Briefcase, Star, FileText, CloudUpload, CheckCircle, Trash2, Clock, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import propertyApi from '../../utils/propertyApi';
import './AgentProfile.css';

const AgentProfile = () => {
    const { user, updateUser, refreshUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        location: '',
        company: '',
        specialization: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                location: user.location || '',
                company: user.company || '',
                specialization: user.specialization || ''
            });
        }
    }, [user]);

    useEffect(() => {
        refreshUser();
    }, []);

    const normalizeDocUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http') || url.startsWith('https') || url.startsWith('blob:')) {
            return url;
        }
        // If it starts with /static, it's a legacy relative path
        if (url.startsWith('/')) {
            return `${api.defaults.baseURL}${url}`;
        }
        return url;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.put('/users/me', formData);
            updateUser(response);
            setSuccess('Profile updated successfully!');
            setEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError(err.response?.data?.detail || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            bio: user.bio || '',
            location: user.location || '',
            company: user.company || '',
            specialization: user.specialization || ''
        });
        setEditing(false);
        setError('');
    };

    const handleDeleteDocument = async (docId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        setLoading(true);
        setError('');
        try {
            await propertyApi.deleteVerificationDocument(docId);
            setSuccess('Document deleted successfully!');
            await refreshUser();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to delete document');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="agent-profile-page">
            {/* Header Section */}
            <div className="profile-banner">
                <div className="banner-gradient"></div>
                <div className="profile-header-content">
                    <div className="profile-avatar-section">
                        <div className="avatar-wrapper">
                            <div className="avatar-large">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <button className="avatar-upload-btn" title="Change photo">
                                <Camera size={18} />
                            </button>
                        </div>
                        <div className="profile-header-info">
                            <h1>{user?.name || 'Agent Name'}</h1>
                            <div className="profile-meta">
                                <span className="role-tag">
                                    <Award size={16} />
                                    {user?.role || 'Agent'}
                                </span>
                                <span className="member-since">
                                    <Calendar size={16} />
                                    Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                                </span>
                                {user?.role === 'agent' && (
                                    <span className={`verification-badge-header ${user?.agent_status || 'unverified'}`}>
                                        {user?.agent_status === 'verified' && <CheckCircle size={14} />}
                                        {user?.agent_status === 'pending' && <Clock size={14} />}
                                        {(!user?.agent_status || user?.agent_status === 'unverified') && <Shield size={14} />}
                                        {user?.agent_status ? user.agent_status.charAt(0).toUpperCase() + user.agent_status.slice(1) : 'Unverified'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="profile-actions">
                        {!editing ? (
                            <button onClick={() => setEditing(true)} className="btn-edit-profile">
                                <Edit2 size={18} />
                                <span>Edit Profile</span>
                            </button>
                        ) : (
                            <div className="editing-actions-header">
                                <button onClick={handleCancel} className="btn-cancel-profile">
                                    <X size={18} />
                                    <span>Cancel</span>
                                </button>
                                <button onClick={handleSubmit} disabled={loading} className="btn-save-profile">
                                    <Save size={18} />
                                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Main Content */}
            <div className="profile-main-content">
                {/* Left Column - Stats & Quick Info */}
                <aside className="profile-sidebar">
                    <div className="info-card">
                        <h3>Quick Info</h3>
                        <div className="info-list">
                            <div className="info-item">
                                <div>
                                    <span className="info-label"><Mail size={16} /> Email</span>
                                    <span className="info-value">{user?.email || 'Not set'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div>
                                    <span className="info-label"><Phone size={16} /> Phone</span>
                                    <span className="info-value">{formData.phone || 'Not set'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div>
                                    <span className="info-label"><MapPin size={16} /> Location</span>
                                    <span className="info-value">{formData.location || 'Not set'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div>
                                    <span className="info-label"><Briefcase size={16} /> Company</span>
                                    <span className="info-value">{formData.company || 'Not set'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div>
                                    <span className="info-label"><Star size={16} /> Specialization</span>
                                    <span className="info-value">{formData.specialization || 'Not set'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div>
                                    <span className="info-label"><Calendar size={16} /> Joined On</span>
                                    <span className="info-value">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div>
                                    <span className="info-label"><Clock size={16} /> Last Login</span>
                                    <span className="info-value">{user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div>
                                    <span className="info-label"><Shield size={16} /> ID</span>
                                    <span className="info-value mono-text">{user?.id || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="info-card">
                        <h3>Account Status</h3>
                        <div className="status-list">
                            <div className="status-item">
                                <span className="status-label">Email Verified</span>
                                <span className={`status-badge ${user?.email_verified ? 'verified' : 'unverified'}`}>
                                    {user?.email_verified ? '✓ Verified' : '✗ Not Verified'}
                                </span>
                            </div>
                            <div className="status-item">
                                <span className="status-label">Agent Verification</span>
                                <span className={`status-badge ${user?.agent_status || 'unverified'}`}>
                                    {user?.agent_status === 'verified' ? '✓ Verified' : user?.agent_status === 'pending' ? '⟳ Pending' : '✗ Unverified'}
                                </span>
                            </div>
                            <div className="status-item">
                                <span className="status-label">Profile Completion</span>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '75%' }}></div>
                                </div>
                                <span className="progress-text">75%</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Column - Editable Form */}
                <div className="profile-content-main">
                    <form onSubmit={handleSubmit} className="profile-edit-form">
                        <div className="form-section">
                            <div className="section-header">
                                <h2>Personal Information</h2>
                                <p>Update your personal details and contact information</p>
                            </div>

                            <div className="form-grid">
                                <div className="form-field">
                                    <label htmlFor="name">
                                        <User size={18} />
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!editing}
                                        required
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="email">
                                        <Mail size={18} />
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={!editing}
                                        required
                                        placeholder="your.email@example.com"
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="phone">
                                        <Phone size={18} />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!editing}
                                        placeholder="+254 712 345 678"
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="location">
                                        <MapPin size={18} />
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        disabled={!editing}
                                        placeholder="Nairobi, Kenya"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <div className="section-header">
                                <h2>Professional Details</h2>
                                <p>Share your professional background and expertise</p>
                            </div>

                            <div className="form-grid">
                                <div className="form-field">
                                    <label htmlFor="company">
                                        <Briefcase size={18} />
                                        Company/Agency
                                    </label>
                                    <input
                                        type="text"
                                        id="company"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        disabled={!editing}
                                        placeholder="Your company name"
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="specialization">
                                        <Star size={18} />
                                        Specialization
                                    </label>
                                    <input
                                        type="text"
                                        id="specialization"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        disabled={!editing}
                                        placeholder="e.g., Residential, Commercial"
                                    />
                                </div>

                                <div className="form-field full-width">
                                    <label htmlFor="bio">
                                        <User size={18} />
                                        Bio
                                    </label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        disabled={!editing}
                                        rows="4"
                                        placeholder="Tell us about yourself and your experience..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Verification Section - Only for Agents */}
                        {user?.role === 'agent' && (
                            <div className="form-section verification-section">
                                <div className="section-header">
                                    <div className="header-with-badge">
                                        <h2>Agent Verification</h2>
                                        {user?.agent_status === 'verified' && (
                                            <span className="premium-badge">
                                                <Award size={14} />
                                                Verified Pro
                                            </span>
                                        )}
                                    </div>
                                    <p>Submit identity and business documents to get the "Verified Agent" badge.</p>
                                </div>

                                <div className="verification-content">
                                    {user?.agent_status === 'verified' ? (
                                        <div className="verification-success-box">
                                            <CheckCircle size={40} className="success-icon" />
                                            <div>
                                                <h3>You are Verified!</h3>
                                                <p>Your account is fully verified. Your listings now show the verification badge.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="verification-grid">
                                            {/* Upload Form */}
                                            <div className="upload-box-wrapper">
                                                <div className="doc-upload-form">
                                                    <div className="form-field">
                                                        <label>Document Name</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g., ID Card, Real Estate License"
                                                            id="doc-name-input"
                                                        />
                                                    </div>
                                                    <div className="file-drop-zone" onClick={() => !loading && document.getElementById('doc-file-input').click()}>
                                                        <CloudUpload size={32} className={loading ? 'animate-pulse' : ''} />
                                                        <p>{loading ? 'Uploading documents...' : 'Click to upload documents'}</p>
                                                        <span className="file-info">PDF, JPG, PNG (Max 5MB per file)</span>
                                                        <input
                                                            type="file"
                                                            id="doc-file-input"
                                                            hidden
                                                            multiple
                                                            onChange={async (e) => {
                                                                const files = Array.from(e.target.files);
                                                                const baseName = document.getElementById('doc-name-input').value;

                                                                if (files.length === 0) return;

                                                                setLoading(true);
                                                                setError('');
                                                                setSuccess('');

                                                                let successCount = 0;
                                                                let failCount = 0;

                                                                try {
                                                                    for (const file of files) {
                                                                        // Use manual name if provided and it's a single file, 
                                                                        // otherwise use filename
                                                                        const name = (files.length === 1 && baseName)
                                                                            ? baseName
                                                                            : file.name.split('.').slice(0, -1).join('.') || 'Document';

                                                                        try {
                                                                            await propertyApi.uploadVerificationDocument(name, file);
                                                                            successCount++;
                                                                        } catch (err) {
                                                                            console.error(`Failed to upload ${file.name}:`, err);
                                                                            failCount++;
                                                                        }
                                                                    }

                                                                    if (successCount > 0) {
                                                                        setSuccess(`Successfully uploaded ${successCount} document${successCount > 1 ? 's' : ''}!`);
                                                                        document.getElementById('doc-name-input').value = '';
                                                                        await refreshUser();
                                                                    }

                                                                    if (failCount > 0) {
                                                                        setError(`Failed to upload ${failCount} file(s).`);
                                                                    }
                                                                } catch (err) {
                                                                    setError('Process failed. Please try again.');
                                                                } finally {
                                                                    setLoading(false);
                                                                    e.target.value = '';
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status & Documents List */}
                                            <div className="docs-list-wrapper">
                                                {/* Status Display */}
                                                {user?.agent_status === 'pending' && (
                                                    <div className="status-notice pending">
                                                        <Calendar size={20} />
                                                        <div>
                                                            <strong>Verification Pending</strong>
                                                            <p>Your documents are being reviewed. This usually takes 24-48 hours.</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {user?.agent_status === 'rejected' && (
                                                    <div className="status-notice rejected">
                                                        <X size={20} />
                                                        <div>
                                                            <strong>Verification Rejected</strong>
                                                            <p>Please upload new documents to try again.</p>
                                                            {user?.rejection_reason && (
                                                                <div className="rejection-reason">
                                                                    <strong>Reason:</strong> {user.rejection_reason}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Documents List */}
                                                <h3>Submitted Documents</h3>
                                                {user?.verification_documents?.length > 0 ? (
                                                    <div className="docs-list">
                                                        {user.verification_documents.map((doc, idx) => (
                                                            <div key={idx} className="doc-item">
                                                                <div className="doc-icon">
                                                                    <FileText size={20} />
                                                                </div>
                                                                <div className="doc-info">
                                                                    <span className="doc-name">{doc.name}</span>
                                                                    <span className="doc-meta">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                                                </div>
                                                                <div className="doc-actions">
                                                                    <a href={normalizeDocUrl(doc.url)} target="_blank" rel="noreferrer" className="btn-view-doc">
                                                                        View
                                                                    </a>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteDocument(doc.id)}
                                                                        className="btn-delete-doc"
                                                                        title="Delete Document"
                                                                        disabled={loading}
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="empty-docs">
                                                        <p>No documents uploaded yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {editing && (
                            <div className="form-actions">
                                <button type="button" onClick={handleCancel} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="btn-primary">
                                    <Save size={18} />
                                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AgentProfile;
