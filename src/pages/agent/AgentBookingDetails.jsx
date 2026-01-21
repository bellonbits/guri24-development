import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyApi } from '../../utils/propertyApi';
import { getProfileImageUrl } from '../../utils/imageUtils';
import { Calendar, User, Mail, MapPin, DollarSign, MessageSquare, ArrowLeft, CheckCircle, XCircle, AlertCircle, Phone } from 'lucide-react';
import './AgentBookingDetails.css';

const AgentBookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const data = await propertyApi.getBookingDetails(id);
                setBooking(data);
            } catch (err) {
                console.error("Failed to fetch booking details:", err);
                setError('Failed to load booking details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBooking();
        }
    }, [id]);

    const handleMessageGuest = async () => {
        try {
            navigate('/agent/messages', {
                state: {
                    guestId: guest.id,
                    propertyId: property.id,
                    guestName: guest.name,
                    propertyTitle: property.title
                }
            });

        } catch (error) {
            console.error("Error navigating to chat", error);
        }
    };

    if (loading) return <div className="loading-state">Loading booking details...</div>;
    if (error) return <div className="error-state">{error}</div>;
    if (!booking) return <div className="error-state">Booking not found.</div>;

    const property = booking.property || {};
    const guest = booking.user || {};

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'text-green-500 bg-green-100 border-green-200';
            case 'pending': return 'text-yellow-500 bg-yellow-100 border-yellow-200';
            case 'cancelled': return 'text-red-500 bg-red-100 border-red-200';
            default: return 'text-gray-500 bg-gray-100 border-gray-200';
        }
    };

    return (
        <div className="agent-booking-details-page">
            <div className="details-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={20} />
                    Back
                </button>
                <h1>Booking Details</h1>
                <span className={`status-badge ${getStatusColor(booking.status)}`}>
                    {booking.status}
                </span>
            </div>

            <div className="details-grid">
                {/* Property Card */}
                <div className="detail-card property-card-mini">
                    <h2>Property Info</h2>
                    <div className="card-content">
                        <h3>{property.title}</h3>
                        <div className="detail-row">
                            <MapPin size={16} />
                            <span>{property.location}</span>
                        </div>
                        <div className="detail-row">
                            <strong>Type:</strong> {property.type}
                        </div>
                        <button className="view-property-btn" onClick={() => navigate(`/property/${property.slug || property.id}`)}>
                            View Live Listing
                        </button>
                    </div>
                </div>

                {/* Guest Info */}
                <div className="detail-card guest-card">
                    <h2>Guest Information</h2> {/* Added back the H2 */}
                    <div className="section-content">
                        <div className="guest-profile">
                            <div className="guest-avatar">
                                {booking.user?.avatar_url ? (
                                    <img
                                        src={getProfileImageUrl(booking.user.avatar_url)}
                                        alt={booking.user.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <User size={24} />
                                )}
                            </div>
                            <div className="guest-info">
                                <h3>{booking.user?.name || 'Guest User'}</h3>
                                <div className="contact-row">
                                    <Mail size={16} />
                                    <span>{booking.user?.email}</span>
                                </div>
                                {booking.user?.phone && (
                                    <div className="contact-row">
                                        <Phone size={16} />
                                        <span>{booking.user.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="message-action">
                            <button className="btn-message" onClick={handleMessageGuest}>
                                <MessageSquare size={18} />
                                Message Guest
                            </button>
                        </div>
                    </div>
                </div> {/* Closing div for detail-card guest-card */}

                {/* Booking Timeline & Price */}
                <div className="detail-card booking-summary">
                    <h2>Reservation Summary</h2>
                    <div className="card-content">
                        <div className="summary-row">
                            <div className="summary-item">
                                <label>Check-in</label>
                                <div className="date-box">
                                    <Calendar size={18} />
                                    <span>{new Date(booking.check_in).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="summary-arrow line">➝</div>
                            <div className="summary-item">
                                <label>Check-out</label>
                                <div className="date-box">
                                    <Calendar size={18} />
                                    <span>{new Date(booking.check_out).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="price-breakdown">
                            <div className="price-row">
                                <span>Guest Count</span>
                                <span>{booking.guest_count} People</span>
                            </div>
                            <div className="price-row total">
                                <span>Total Payout</span>
                                <span>KES {parseFloat(booking.total_price).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentBookingDetails;
