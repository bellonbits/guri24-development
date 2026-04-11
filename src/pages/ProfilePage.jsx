import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Users, Mail, Phone, MapPin, Edit2, Save, X, LogOut, Heart, Home, Calendar, CheckCircle, Clock, Shield, Award, FileText, Upload as CloudUpload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getSavedProperties, getUserStats } from '../utils/api';
import { propertyApi } from '../utils/propertyApi';
import { getProfileImageUrl } from '../utils/imageUtils';
import PropertyCard from '../components/PropertyCard';
import ChatWidget from '../components/ChatWidget';
import HostContactModal from '../components/HostContactModal';
import './ProfilePage.css';
function ProfilePage() {
    const { t } = useTranslation();
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');


    // Saved Properties State
    const [savedProperties, setSavedProperties] = useState([]);
    const [stats, setStats] = useState({
        saved_properties: 0,
        properties_viewed: 0,
        scheduled_visits: 0
    });
    const [loadingSaved, setLoadingSaved] = useState(true);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        bio: user?.bio || '',
        company: user?.company || '',
        specialization: user?.specialization || '',
    });

    const [bookings, setBookings] = useState([]);
    const [showHostModal, setShowHostModal] = useState(false);
    const [selectedHost, setSelectedHost] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [properties, userStats, myBookings] = await Promise.all([
                    getSavedProperties(),
                    getUserStats(),
                    propertyApi.getUserBookings()
                ]);
                setSavedProperties(properties);
                setStats(userStats);
                setBookings(myBookings);
            } catch (err) {
                console.error("Failed to fetch profile data", err);
            } finally {
                setLoadingSaved(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    // ... existing handlers ...

    // ... render return ...

    {/* Activity Stats */ }
    <div className="profile-section">
        <h2>Activity</h2>
        <div className="activity-stats">
            <div className="stat-card">
                <div className="stat-icon">
                    <Heart size={24} />
                </div>
                <div className="stat-info">
                    <h3>{stats.saved_properties}</h3>
                    <p>Saved Properties</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">
                    <Home size={24} />
                </div>
                <div className="stat-info">
                    <h3>{stats.properties_viewed}</h3>
                    <p>Properties Viewed</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">
                    <Calendar size={24} />
                </div>
                <div className="stat-info">
                    <h3>{stats.scheduled_visits}</h3>
                    <p>Scheduled Visits</p>
                </div>
            </div>
        </div>
    </div>

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const result = await updateProfile(formData);

        if (result.success) {
            setSuccess(t('profile.profile_updated'));
            setIsEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(result.error || t('profile.profile_update_failed'));
        }

        setLoading(false);
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            location: user?.location || '',
            bio: user?.bio || '',
            company: user?.company || '',
            specialization: user?.specialization || '',
        });
        setIsEditing(false);
        setError('');
    };

    // Avatar Upload
    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            setError(t('profile.not_image'));
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            setError(t('profile.image_too_large'));
            return;
        }

        try {
            setLoading(true);
            const response = await propertyApi.uploadAvatar(file);

            // Force reload user or update context?
            // The response contains the updated user object
            // We might need to update the auth context user
            // usually login/updateProfile updates context. 
            // Let's assume updateProfile does it or we need to refresh.
            // For now, let's just show success message.
            // Ideally we need a 'setUser' from useAuth to update local state immediately.
            // Checking AuthContext usage... access 'user'. 
            // If useAuth exposes a way to update user, use it. 
            // If not, we might need to reload page or refetch /me.

            // Since updateProfile is available from useAuth, maybe there is a setUser?
            // I'll assume I can just reload the page for now or better, 
            // if `updateProfile` updates context, I should use that mechanism?
            // Wait, `updateProfile` in AuthContext usually calls API then sets User.
            // Here I called API directly.
            // I should probably manually trigger a context refresh if possible.
            // Let's reload window for simplicity in this step, or just show success.

            setSuccess(t('profile.photo_updated'));
            window.location.reload(); // Simple way to refresh user context

        } catch (err) {
            console.error(err);
            setError(t('profile.photo_failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleContactHost = (booking) => {
        setSelectedHost(booking.property.agent);
        setSelectedProperty(booking.property);
        setShowHostModal(true);
    };

    const handleStartChat = () => {
        setShowHostModal(false);
        setIsChatOpen(true);
    };

    return (
        <div className="profile-page">
            {/* Blue gradient banner at top */}
            <div className="profile-banner" />
            <div className="profile-container">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        <div className="avatar-circle" style={user?.avatar_url ? { padding: 0, overflow: 'hidden', border: 'none' } : {}}>
                            {user?.avatar_url ? (
                                <img
                                    src={getProfileImageUrl(user.avatar_url)}
                                    alt={user.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        // We can't easily revert parent style here without refs or state, 
                                        // but hiding the broken image reveals the background.
                                        // Ideal would be to show initials if image fails.
                                    }}
                                />
                            ) : (
                                user?.name?.charAt(0).toUpperCase() || 'U'
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                        <button className="avatar-edit-btn" title={t('profile.change_photo')} onClick={handleAvatarClick}>
                            <Edit2 size={16} />
                        </button>
                    </div>
                    <div className="profile-header-info">
                        <h1>{user?.name || 'User'}</h1>
                        <p className="profile-email">{user?.email}</p>
                        <div className="profile-badges">
                            <span className="badge">{t('profile.member_since', { year: new Date().getFullYear() })}</span>
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
                    <div className="profile-actions">
                        {!isEditing ? (
                            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                                <Edit2 size={18} />
                                {t('profile.edit_profile')}
                            </button>
                        ) : (
                            <button className="btn btn-secondary" onClick={handleCancel}>
                                <X size={18} />
                                {t('profile.cancel')}
                            </button>
                        )}
                        <button className="btn btn-outline-danger" onClick={handleLogout}>
                            <LogOut size={18} />
                            {t('profile.logout')}
                        </button>
                    </div>
                </div>

                {/* Messages */}
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Profile Content */}


                <div className="profile-content">
                    {/* Personal Information */}
                    <div className="profile-section">
                        <h2>{t('profile.personal_info')}</h2>
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name"><User size={14} className="label-icon" />{t('profile.full_name')}</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email"><Mail size={14} className="label-icon" />{t('profile.email_address')}</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="phone"><Phone size={14} className="label-icon" />{t('profile.phone_number')}</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="location"><MapPin size={14} className="label-icon" />{t('profile.location')}</label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        placeholder={t('profile.location_placeholder')}
                                        value={formData.location}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="bio">{t('profile.bio')}</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows="4"
                                    placeholder={t('profile.bio_placeholder')}
                                    value={formData.bio}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            {/* Professional Details */}
                            <div className="professional-details-section">
                                <h3 className="section-subtitle">{t('profile.professional_details')}</h3>
                                <p className="section-hint">{t('profile.professional_hint')}</p>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="company"><Shield size={14} className="label-icon" />{t('profile.company')}</label>
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            placeholder={t('profile.company_placeholder')}
                                            value={formData.company}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="specialization"><Award size={14} className="label-icon" />{t('profile.specialization')}</label>
                                        <input
                                            type="text"
                                            id="specialization"
                                            name="specialization"
                                            placeholder={t('profile.specialization_placeholder')}
                                            value={formData.specialization}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? (
                                            t('profile.saving')
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                {t('profile.save_changes')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Documents Center */}
                    <div className="profile-section documents-hub">
                        <div className="hub-header">
                            <div>
                                <h2>{t('profile.documents')}</h2>
                                <p>{t('profile.documents_desc')}</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => navigate('/profile/documents')}>
                                <FileText size={18} />
                                {t('profile.manage_documents')}
                            </button>
                        </div>

                        <div className="documents-list-preview">
                            {user?.verification_documents && user.verification_documents.length > 0 ? (
                                <>
                                    {user.verification_documents.map((doc) => (
                                        <div key={doc.id} className="document-preview-card">
                                            <div className="doc-icon">
                                                <FileText size={24} />
                                            </div>
                                            <div className="doc-details">
                                                <h4>{doc.name}</h4>
                                                <span className="doc-date">
                                                    {new Date(doc.uploaded_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <span className={`doc-status-badge ${doc.status}`}>
                                                {doc.status === 'pending' && t('profile.doc_pending')}
                                                {doc.status === 'approved' && t('profile.doc_approved')}
                                                {doc.status === 'rejected' && t('profile.doc_rejected')}
                                            </span>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="empty-documents">
                                    <FileText size={48} />
                                    <p>{t('profile.no_documents')}</p>
                                    <span>{t('profile.no_documents_hint')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Agent Application Section - For non-agents */}
                    {user?.role !== 'agent' && user?.role !== 'admin' && user?.role !== 'super_admin' && (
                        <div className="profile-section agent-application-section">
                            <div className="section-header">
                                <h2>
                                    <Shield size={24} />
                                    {t('profile.become_agent')}
                                </h2>
                                <p>{t('profile.become_agent_desc')}</p>
                            </div>

                            <div className="application-status-container">
                                {user?.agent_status === 'PENDING' ? (
                                    <div className="status-notice pending">
                                        <Clock size={32} />
                                        <div>
                                            <h3>{t('profile.application_reviewing')}</h3>
                                            <p>{t('profile.application_reviewing_desc')}</p>
                                        </div>
                                    </div>
                                ) : user?.agent_status === 'REJECTED' ? (
                                    <div className="status-notice rejected">
                                        <X size={32} />
                                        <div>
                                            <h3>{t('profile.application_rejected')}</h3>
                                            <p>{t('profile.application_rejected_desc')}</p>
                                            {user?.rejection_reason && (
                                                <div className="rejection-reason">
                                                    <strong>{t('profile.rejection_reason')}</strong> {user.rejection_reason}
                                                </div>
                                            )}
                                            <button className="btn btn-outline-primary mt-2" onClick={() => navigate('/apply-agent')}>
                                                {t('profile.reapply')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="apply-promo">
                                        <div className="promo-features">
                                            <div className="feature">
                                                <CheckCircle size={18} />
                                                <span>{t('profile.list_unlimited')}</span>
                                            </div>
                                            <div className="feature">
                                                <CheckCircle size={18} />
                                                <span>{t('profile.access_dashboard')}</span>
                                            </div>
                                            <div className="feature">
                                                <CheckCircle size={18} />
                                                <span>{t('profile.verification_badge')}</span>
                                            </div>
                                        </div>
                                        <button className="btn btn-primary" onClick={() => navigate('/apply-agent')}>
                                            {t('profile.start_application')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Verification Section - Only for Verified Agents */}
                    {user?.role === 'agent' && (
                        <div className="profile-section verification-section">
                            <h2>
                                <Shield size={24} />
                                {t('profile.agent_verification')}
                                {user?.agent_status === 'verified' && (
                                    <span className="verified-badge-inline">
                                        <Award size={16} /> {t('profile.verified_pro')}
                                    </span>
                                )}
                            </h2>
                            <p className="section-description">
                                {t('profile.verification_desc')}
                            </p>

                            <div className="verification-content">
                                {user?.agent_status === 'verified' ? (
                                    <div className="verification-status-box success">
                                        <CheckCircle size={40} />
                                        <div>
                                            <h3>{t('profile.you_are_verified')}</h3>
                                            <p>{t('profile.verified_desc')}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="verification-layout">
                                        <div className="verification-upload">
                                            <div className="form-group">
                                                <label>{t('profile.doc_name_label')}</label>
                                                <input
                                                    type="text"
                                                    placeholder={t('profile.doc_name_placeholder')}
                                                    id="profile-doc-name"
                                                    className="profile-input"
                                                />
                                            </div>
                                            <div className="upload-dropzone" onClick={() => document.getElementById('profile-doc-file').click()}>
                                                <CloudUpload size={32} />
                                                <p>{t('profile.upload_doc')}</p>
                                                <span className="file-info">{t('profile.file_info')}</span>
                                                <input
                                                    type="file"
                                                    id="profile-doc-file"
                                                    hidden
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        const name = document.getElementById('profile-doc-name').value;
                                                        if (!file || !name) {
                                                            alert(t('profile.provide_name_and_file'));
                                                            return;
                                                        }
                                                        setLoading(true);
                                                        try {
                                                            const updatedUser = await propertyApi.uploadVerificationDocument(name, file);
                                                            // Usually we would update the auth context user here if we had a setUser method
                                                            setSuccess(t('profile.doc_uploaded'));
                                                            document.getElementById('profile-doc-name').value = '';
                                                            // Reload to refresh user state
                                                            setTimeout(() => window.location.reload(), 1500);
                                                        } catch (err) {
                                                            setError(err.response?.data?.detail || t('profile.doc_upload_failed'));
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="verification-status">
                                            {user?.agent_status === 'pending' && (
                                                <div className="status-notice pending">
                                                    <Clock size={20} />
                                                    <div>
                                                        <strong>{t('profile.verification_pending')}</strong>
                                                        <p>{t('profile.verification_pending_desc')}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {user?.agent_status === 'rejected' && (
                                                <div className="status-notice rejected">
                                                    <X size={20} />
                                                    <div>
                                                        <strong>{t('profile.verification_rejected')}</strong>
                                                        <p>{t('profile.verification_rejected_desc')}</p>
                                                        {user?.rejection_reason && (
                                                            <div className="rejection-reason-box">
                                                                <strong>Reason:</strong> {user.rejection_reason}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <h3>{t('profile.submitted_documents')}</h3>
                                            {user?.verification_documents?.length > 0 ? (
                                                <div className="profile-doc-list">
                                                    {user.verification_documents.map((doc, idx) => (
                                                        <div key={idx} className="profile-doc-item">
                                                            <FileText size={20} />
                                                            <div className="doc-details">
                                                                <span className="name">{doc.name}</span>
                                                                <span className="date">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                                            </div>
                                                            <a href={doc.url} target="_blank" rel="noreferrer" className="view-link">
                                                                {t('profile.view')}
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="empty-docs-placeholder">
                                                    {t('profile.no_docs_yet')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Activity Stats */}
                    <div className="profile-section">
                        <h2>{t('profile.activity')}</h2>
                        <div className="activity-stats">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <Heart size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.saved_properties}</h3>
                                    <p>{t('profile.saved_properties')}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <Home size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.properties_viewed}</h3>
                                    <p>{t('profile.properties_viewed')}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <Calendar size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.scheduled_visits}</h3>
                                    <p>{t('profile.scheduled_visits')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* My Bookings */}
                    <div className="profile-section">
                        <h2>{t('profile.my_bookings')}</h2>
                        {loadingSaved ? (
                            <p>{t('profile.loading_bookings')}</p>
                        ) : bookings.length > 0 ? (
                            <div className="bookings-list">
                                {bookings.map(booking => (
                                    <div key={booking.id} className="booking-ticket">
                                        {/* Left: Property Info */}
                                        <div className="ticket-info">
                                            <div className="info-header">
                                                {booking.property ? (
                                                    <Link to={`/property/${booking.property.slug || booking.property.id}`} className="property-title">
                                                        {booking.property.title}
                                                    </Link>
                                                ) : (
                                                    <h3 className="property-title">Booking</h3>
                                                )}
                                                <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                                    {booking.status}
                                                </span>
                                            </div>

                                            <div className="property-location">
                                                <MapPin size={16} />
                                                <span>{booking.property?.location || t('profile.location_na')}</span>
                                            </div>
                                            <div className="booking-ref">{t('profile.booking_ref')} {booking.id.slice(0, 8)}</div>
                                        </div>

                                        {/* Middle: Specs */}
                                        <div className="ticket-specs">
                                            <div className="spec-card">
                                                <div className="spec-item">
                                                    <Calendar size={18} />
                                                    <div className="spec-content">
                                                        <label>{t('profile.booking_dates')}</label>
                                                        <strong>{new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}</strong>
                                                    </div>
                                                </div>
                                                <div className="spec-item">
                                                    <Users size={18} />
                                                    <div className="spec-content">
                                                        <label>{t('profile.total_guests')}</label>
                                                        <strong>{booking.guest_count > 1 ? t('profile.guest_plural', { count: booking.guest_count }) : t('profile.guest_singular', { count: booking.guest_count })}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Pricing & Action */}
                                        <div className="ticket-pricing">
                                            <div className="price-box">
                                                <label>{t('profile.total_price')}</label>
                                                <strong className="price-amount">KSh {parseFloat(booking.total_price).toLocaleString()}</strong>
                                            </div>
                                            <div className="ticket-actions">
                                                <button className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/my-bookings`)}>
                                                    {t('profile.view_details')}
                                                </button>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleContactHost(booking)}
                                                >
                                                    {t('profile.contact_host')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Calendar size={48} />
                                <p>{t('profile.no_bookings')}</p>
                                <button className="btn btn-primary" onClick={() => navigate('/stays')}>
                                    {t('profile.find_stay')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Saved Properties */}
                    <div className="profile-section">
                        <h2>{t('profile.saved_properties')}</h2>
                        {loadingSaved ? (
                            <p>{t('profile.loading_saved')}</p>
                        ) : savedProperties.length > 0 ? (
                            <div className="properties-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                                {savedProperties.map(property => (
                                    <PropertyCard key={property.id} property={property} initialSaved={true} />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Heart size={48} />
                                <p>{t('profile.no_saved')}</p>
                                <button className="btn btn-primary" onClick={() => navigate('/listings')}>
                                    {t('profile.browse_properties')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div >

            {/* Host Contact Modal Component */}
            <HostContactModal
                isOpen={showHostModal}
                onClose={() => setShowHostModal(false)}
                host={selectedHost}
                onStartChat={handleStartChat}
            />

            {/* Chat Widget Integration */}
            {selectedProperty && selectedHost && (
                <ChatWidget
                    propertyId={selectedProperty.id}
                    propertyTitle={selectedProperty.title}
                    agentName={selectedHost.name}
                    agentId={selectedHost.id}
                    externalOpen={isChatOpen}
                    setExternalOpen={setIsChatOpen}
                />
            )}
        </div >
    );
}

export default ProfilePage;
