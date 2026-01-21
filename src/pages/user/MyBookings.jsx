import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, MapPin, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { getProfileImageUrl } from '../../utils/imageUtils';
import { propertyApi, formatPrice } from '../../utils/propertyApi';
import { useAuth } from '../../context/AuthContext';
import ChatWidget from '../../components/ChatWidget';
import HostContactModal from '../../components/HostContactModal';
import './MyBookings.css';

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showHostModal, setShowHostModal] = useState(false);
    const [selectedHost, setSelectedHost] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await propertyApi.getUserBookings();
            setBookings(data);
        } catch (err) {
            console.error("Failed to fetch bookings", err);
            setError("Could not load bookings. Please try again.");
        } finally {
            setLoading(false);
        }
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

    if (loading) {
        return (
            <div className="bookings-loading">
                <Loader className="animate-spin" size={32} />
                <p>Loading your bookings...</p>
            </div>
        );
    }

    return (
        <div className="my-bookings-page">
            <div className="container">
                <div className="bookings-header">
                    <h1>My Bookings</h1>
                    <p>Manage your upcoming and past stays.</p>
                </div>

                {error && (
                    <div className="error-banner">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {bookings.length === 0 && !error ? (
                    <div className="empty-bookings">
                        <Calendar size={48} />
                        <h3>No bookings yet</h3>
                        <p>You haven't made any reservations. Start exploring!</p>
                        <Link to="/listings" className="btn btn-primary">Browse Properties</Link>
                    </div>
                ) : (
                    <div className="bookings-list">
                        {bookings.map(booking => (
                            <div key={booking.id} className="booking-ticket">
                                {/* Left: Property Info */}
                                <div className="ticket-info">
                                    <div className="info-header">
                                        <Link to={`/property/${booking.property.slug || booking.property.id}`} className="property-title">
                                            {booking.property.title}
                                        </Link>
                                        <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="property-location">
                                        <MapPin size={16} />
                                        <span>
                                            {typeof booking.property.location === 'object'
                                                ? `${booking.property.location.city}, ${booking.property.location.country}`
                                                : booking.property.location}
                                        </span>
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
                                                <strong>{booking.guest_count} {booking.guest_count === 1 ? 'Guest' : 'Guests'}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Pricing & Action */}
                                <div className="ticket-pricing">
                                    <div className="price-box">
                                        <label>Total Price</label>
                                        <strong className="price-amount">
                                            {formatPrice(booking.total_price, booking.property.currency)}
                                        </strong>
                                    </div>
                                    <div className="ticket-actions">
                                        <button className="btn btn-outline-primary btn-sm">View Details</button>
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
                )}
            </div>

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
        </div>
    );
};

export default MyBookings;
