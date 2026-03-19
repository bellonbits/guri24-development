import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Users, Mail, Phone, MapPin, Edit2, Save, X, LogOut, Heart, Home, Calendar, CheckCircle, Clock, Shield, Award, FileText, Upload as CloudUpload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSavedProperties, getUserStats } from '../utils/api';
import { propertyApi } from '../utils/propertyApi';
import { getProfileImageUrl } from '../utils/imageUtils';
import PropertyCard from '../components/PropertyCard';
import ChatWidget from '../components/ChatWidget';
import HostContactModal from '../components/HostContactModal';
function ProfilePage() {
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
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(result.error || 'Failed to update profile');
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
            setError('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            setError('Image size should be less than 5MB');
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

            setSuccess('Profile photo updated!');
            window.location.reload(); // Simple way to refresh user context

        } catch (err) {
            console.error(err);
            setError('Failed to upload image');
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
                        <button className="avatar-edit-btn" title="Change photo" onClick={handleAvatarClick}>
                            <Edit2 size={16} />
                        </button>
                    </div>
                    <div className="profile-header-info">
                        <h1>{user?.name || 'User'}</h1>
                        <p className="profile-email">{user?.email}</p>
                        <div className="profile-badges">
                            <span className="badge">Member since {new Date().getFullYear()}</span>
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
                                Edit Profile
                            </button>
                        ) : (
                            <button className="btn btn-secondary" onClick={handleCancel}>
                                <X size={18} />
                                Cancel
                            </button>
                        )}
                        <button className="btn btn-outline-danger" onClick={handleLogout}>
                            <LogOut size={18} />
                            Logout
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
                        <h2>Personal Information</h2>
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name</label>
                                    <div className="input-wrapper">
                                        <User size={20} className="input-icon" />
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
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <div className="input-wrapper">
                                        <Mail size={20} className="input-icon" />
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
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <div className="input-wrapper">
                                        <Phone size={20} className="input-icon" />
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="location">Location</label>
                                    <div className="input-wrapper">
                                        <MapPin size={20} className="input-icon" />
                                        <input
                                            type="text"
                                            id="location"
                                            name="location"
                                            placeholder="City, Country"
                                            value={formData.location}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="bio">Bio</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows="4"
                                    placeholder="Tell us about yourself..."
                                    value={formData.bio}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            {/* Professional Details */}
                            <div className="professional-details-section">
                                <h3 className="section-subtitle">Professional Details</h3>
                                <p className="section-hint">Share your professional background and expertise</p>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="company">Company / Agency</label>
                                        <div className="input-wrapper">
                                            <Shield size={20} className="input-icon" />
                                            <input
                                                type="text"
                                                id="company"
                                                name="company"
                                                placeholder="e.g., Guri24 Real Estate"
                                                value={formData.company}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="specialization">Specialization</label>
                                        <div className="input-wrapper">
                                            <Award size={20} className="input-icon" />
                                            <input
                                                type="text"
                                                id="specialization"
                                                name="specialization"
                                                placeholder="e.g., Luxury Villas, Commercial"
                                                value={formData.specialization}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? (
                                            'Saving...'
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Save Changes
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
                                <h2>My Documents</h2>
                                <p>Your uploaded verification documents</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => navigate('/profile/documents')}>
                                <FileText size={18} />
                                Manage Documents
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
                                                {doc.status === 'pending' && 'Pending'}
                                                {doc.status === 'approved' && 'Approved'}
                                                {doc.status === 'rejected' && 'Rejected'}
                                            </span>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="empty-documents">
                                    <FileText size={48} />
                                    <p>No documents uploaded yet.</p>
                                    <span>Upload your IDs, Licenses, or Deeds to keep them organized.</span>
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
                                    Become a Guri24 Agent
                                </h2>
                                <p>Submit a formal application to list and manage properties on our platform.</p>
                            </div>

                            <div className="application-status-container">
                                {user?.agent_status === 'PENDING' ? (
                                    <div className="status-notice pending">
                                        <Clock size={32} />
                                        <div>
                                            <h3>Application Under Review</h3>
                                            <p>Your formal application is currently being reviewed by our team. We'll get back to you within 24-48 hours.</p>
                                        </div>
                                    </div>
                                ) : user?.agent_status === 'REJECTED' ? (
                                    <div className="status-notice rejected">
                                        <X size={32} />
                                        <div>
                                            <h3>Application Rejected</h3>
                                            <p>Unfortunately, your application was not approved at this time.</p>
                                            {user?.rejection_reason && (
                                                <div className="rejection-reason">
                                                    <strong>Reason:</strong> {user.rejection_reason}
                                                </div>
                                            )}
                                            <button className="btn btn-outline-primary mt-2" onClick={() => navigate('/apply-agent')}>
                                                Re-apply with Updates
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="apply-promo">
                                        <div className="promo-features">
                                            <div className="feature">
                                                <CheckCircle size={18} />
                                                <span>List unlimited properties</span>
                                            </div>
                                            <div className="feature">
                                                <CheckCircle size={18} />
                                                <span>Access agent dashboard</span>
                                            </div>
                                            <div className="feature">
                                                <CheckCircle size={18} />
                                                <span>Professional verification badge</span>
                                            </div>
                                        </div>
                                        <button className="btn btn-primary" onClick={() => navigate('/apply-agent')}>
                                            Start Application
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
                                Agent Verification
                                {user?.agent_status === 'verified' && (
                                    <span className="verified-badge-inline">
                                        <Award size={16} /> Verified Pro
                                    </span>
                                )}
                            </h2>
                            <p className="section-description">
                                Submit identity and business documents to get the "Verified Agent" badge.
                            </p>

                            <div className="verification-content">
                                {user?.agent_status === 'verified' ? (
                                    <div className="verification-status-box success">
                                        <CheckCircle size={40} />
                                        <div>
                                            <h3>You are Verified!</h3>
                                            <p>Your account is fully verified. Your listings now show the verification badge.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="verification-layout">
                                        <div className="verification-upload">
                                            <div className="form-group">
                                                <label>Document Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., ID Card, Real Estate License"
                                                    id="profile-doc-name"
                                                    className="profile-input"
                                                />
                                            </div>
                                            <div className="upload-dropzone" onClick={() => document.getElementById('profile-doc-file').click()}>
                                                <CloudUpload size={32} />
                                                <p>Click to upload proof document</p>
                                                <span className="file-info">PDF, JPG, PNG (Max 5MB)</span>
                                                <input
                                                    type="file"
                                                    id="profile-doc-file"
                                                    hidden
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        const name = document.getElementById('profile-doc-name').value;
                                                        if (!file || !name) {
                                                            alert('Please provide a document name and select a file.');
                                                            return;
                                                        }
                                                        setLoading(true);
                                                        try {
                                                            const updatedUser = await propertyApi.uploadVerificationDocument(name, file);
                                                            // Usually we would update the auth context user here if we had a setUser method
                                                            setSuccess('Document uploaded successfully! Verification is now pending.');
                                                            document.getElementById('profile-doc-name').value = '';
                                                            // Reload to refresh user state
                                                            setTimeout(() => window.location.reload(), 1500);
                                                        } catch (err) {
                                                            setError(err.response?.data?.detail || 'Failed to upload document');
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
                                                            <div className="rejection-reason-box">
                                                                <strong>Reason:</strong> {user.rejection_reason}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <h3>Submitted Documents</h3>
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
                                                                View
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="empty-docs-placeholder">
                                                    No documents uploaded yet.
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

                    {/* My Bookings */}
                    <div className="profile-section">
                        <h2>My Bookings</h2>
                        {loadingSaved ? (
                            <p>Loading bookings...</p>
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
                                                <span>{booking.property?.location || 'Location N/A'}</span>
                                            </div>
                                            <div className="booking-ref">Ref: {booking.id.slice(0, 8)}</div>
                                        </div>

                                        {/* Middle: Specs */}
                                        <div className="ticket-specs">
                                            <div className="spec-card">
                                                <div className="spec-item">
                                                    <Calendar size={18} />
                                                    <div className="spec-content">
                                                        <label>Booking Dates:</label>
                                                        <strong>{new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}</strong>
                                                    </div>
                                                </div>
                                                <div className="spec-item">
                                                    <Users size={18} />
                                                    <div className="spec-content">
                                                        <label>Total Guests:</label>
                                                        <strong>{booking.guest_count} Guest{booking.guest_count > 1 ? 's' : ''}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Pricing & Action */}
                                        <div className="ticket-pricing">
                                            <div className="price-box">
                                                <label>Total Price</label>
                                                <strong className="price-amount">KSh {parseFloat(booking.total_price).toLocaleString()}</strong>
                                            </div>
                                            <div className="ticket-actions">
                                                <button className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/my-bookings`)}>
                                                    View Details
                                                </button>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleContactHost(booking)}
                                                >
                                                    Contact Host
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Calendar size={48} />
                                <p>You haven't made any bookings yet</p>
                                <button className="btn btn-primary" onClick={() => navigate('/stays')}>
                                    Find a Stay
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Saved Properties */}
                    <div className="profile-section">
                        <h2>Saved Properties</h2>
                        {loadingSaved ? (
                            <p>Loading saved properties...</p>
                        ) : savedProperties.length > 0 ? (
                            <div className="properties-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                                {savedProperties.map(property => (
                                    <PropertyCard key={property.id} property={property} initialSaved={true} />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Heart size={48} />
                                <p>You haven't saved any properties yet</p>
                                <button className="btn btn-primary" onClick={() => navigate('/listings')}>
                                    Browse Properties
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
