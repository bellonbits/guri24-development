import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera,
    Award, Briefcase, Star, FileText, CloudUpload, CheckCircle,
    Trash2, Shield, ArrowLeft, Loader, Clock
} from 'lucide-react';
import adminApi from '../../utils/adminApi';
import { getProfileImageUrl } from '../../utils/imageUtils';
import { useTranslation } from 'react-i18next';
import './AdminAgentProfile.css';

const AdminAgentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [userData, setUserData] = useState(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        location: '',
        company: '',
        specialization: '',
        role: ''
    });

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getUserById(id);
            setUserData(data);
            setFormData({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                bio: data.bio || '',
                location: data.location || '',
                company: data.company || '',
                specialization: data.specialization || '',
                role: data.role || ''
            });
        } catch (err) {
            console.error('Failed to fetch user:', err);
            setError('Failed to load user information');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaveLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await adminApi.updateUser(id, formData);
            setUserData(response);
            setSuccess('Profile updated successfully!');
            setEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError(err.response?.data?.detail || 'Failed to update profile');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            bio: userData.bio || '',
            location: userData.location || '',
            company: userData.company || '',
            specialization: userData.specialization || '',
            role: userData.role || ''
        });
        setEditing(false);
        setError('');
    };

    const normalizeDocUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http') || url.startsWith('https')) return url;
        return `https://api.guri24.com${url.startsWith('/') ? '' : '/'}${url}`;
    };

    if (loading) {
        return (
            <div className="admin-profile-loading">
                <Loader className="animate-spin" size={48} />
                <p>{t('common.loading', 'Loading...')}</p>
            </div>
        );
    }

    return (
        <div className="admin-agent-profile-page">
            {/* Header Section */}
            <div className="profile-banner">
                <div className="banner-gradient"></div>
                <div className="profile-header-content">
                    <div className="profile-avatar-section">
                        <button onClick={() => navigate('/admin/users')} className="btn-back">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="avatar-wrapper">
                            <div className="avatar-large">
                                {userData?.avatar_url ? (
                                    <img src={getProfileImageUrl(userData.avatar_url)} alt={userData.name} />
                                ) : (
                                    userData?.name?.charAt(0) || 'U'
                                )}
                            </div>
                        </div>
                        <div className="profile-header-info">
                            <h1>{userData?.name || 'User Name'}</h1>
                            <div className="profile-meta">
                                <span className="role-tag">
                                    <Shield size={16} />
                                    {userData?.role || 'User'}
                                </span>
                                <span className="member-since">
                                    <Calendar size={16} />
                                    Member since {userData?.created_at ? new Date(userData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                                </span>
                                {userData?.role === 'agent' && (
                                    <span className={`verification-badge-header ${userData?.agent_status || 'unverified'}`}>
                                        {userData?.agent_status === 'verified' && <CheckCircle size={14} />}
                                        {userData?.agent_status?.toLowerCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="profile-actions">
                        {!editing ? (
                            <button onClick={() => setEditing(true)} className="btn-edit-profile">
                                <Edit2 size={18} />
                                <span>{t('profile.edit_profile', 'Edit Profile')}</span>
                            </button>
                        ) : (
                            <button onClick={handleCancel} className="btn-cancel-profile">
                                <X size={18} />
                                <span>{t('profile.cancel', 'Cancel')}</span>
                            </button>
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
                        <h3>{t('agent_profile.quick_info', 'Quick Info')}</h3>
                        <div className="info-list">
                            <div className="info-item">
                                <div>
                                    <span className="info-label"><Mail size={16} /> Email</span>
                                    <span className="info-value">{formData.email || 'Not set'}</span>
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
                                    <span className="info-value">{userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div>
                                    <span className="info-label"><Clock size={16} /> Last Login</span>
                                    <span className="info-value">{userData?.last_login ? new Date(userData.last_login).toLocaleDateString() : 'Never'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div>
                                    <span className="info-label">ID</span>
                                    <span className="info-value mono-text">{userData?.id || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="info-card">
                        <h3>{t('agent_profile.account_status', 'Account Status')}</h3>
                        <div className="status-list">
                            <div className="status-item">
                                <span className="status-label">Email Verified</span>
                                <span className={`status-badge ${userData?.email_verified ? 'verified' : 'unverified'}`}>
                                    {userData?.email_verified ? '✓ Verified' : '✗ Not Verified'}
                                </span>
                            </div>
                            <div className="status-item">
                                <span className="status-label">Agent Verification</span>
                                <span className={`status-badge ${userData?.agent_status || 'unverified'}`}>
                                    {userData?.agent_status === 'verified' ? '✓ Verified' : userData?.agent_status?.toLowerCase() === 'pending' ? '⟳ Pending' : '✗ Unverified'}
                                </span>
                            </div>
                            <div className="status-item">
                                <span className="status-label">{t('agent_profile.account_type', 'Account Type')}</span>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    className="role-select"
                                >
                                    <option value="user">User</option>
                                    <option value="agent">Agent</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Column - Editable Form */}
                <div className="profile-content-main">
                    <form onSubmit={handleSubmit} className="profile-edit-form">
                        <div className="form-section">
                            <div className="section-header">
                                <h2>{t('profile.personal_info', 'Personal Information')}</h2>
                                <p>{t('agent_profile.admin_info_desc', "Update user's personal details and contact information")}</p>
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
                                        placeholder="Full name"
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
                                        placeholder="email@example.com"
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
                                        placeholder="+254..."
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
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <div className="section-header">
                                <h2>{t('profile.professional_details', 'Professional Details')}</h2>
                                <p>{t('agent_profile.admin_prof_desc', "User's professional background and expertise")}</p>
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
                                        placeholder="Company name"
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
                                        placeholder="User biography..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <div className="section-header">
                                <h2>{t('agent_profile.verification_docs', 'Verification Documents')}</h2>
                                <p>{t('agent_profile.admin_docs_desc', 'Documents submitted for agent verification')}</p>
                            </div>

                            {userData?.verification_documents?.length > 0 ? (
                                <div className="admin-docs-list">
                                    {userData.verification_documents.map((doc, idx) => (
                                        <div key={idx} className="admin-doc-item">
                                            <div className="doc-icon">
                                                <FileText size={20} />
                                            </div>
                                            <div className="doc-info">
                                                <span className="doc-name">{doc.name}</span>
                                                <span className="doc-meta">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                            </div>
                                            <a href={normalizeDocUrl(doc.url)} target="_blank" rel="noreferrer" className="btn-view-doc">
                                                {t('agent_profile.view_doc', 'View Document')}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-docs-text">{t('agent_profile.no_docs', 'No documents uploaded.')}</p>
                            )}
                        </div>

                        {editing && (
                            <div className="form-actions">
                                <button type="button" onClick={handleCancel} className="btn-secondary">
                                    {t('profile.cancel', 'Cancel')}
                                </button>
                                <button type="submit" disabled={saveLoading} className="btn-primary">
                                    <Save size={18} />
                                    <span>{saveLoading ? t('profile.saving', 'Saving...') : t('profile.save_changes', 'Save Changes')}</span>
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminAgentProfile;
