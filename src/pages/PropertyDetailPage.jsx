import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PropertyDetailPage.css';
import analytics from '../utils/analytics';
import { MapPin, ChevronLeft, ChevronRight, Share2, Building2, ExternalLink, Check } from 'lucide-react';
import { propertyApi, transformProperty, formatPrice } from '../utils/propertyApi';
import PropertyCard from '../components/PropertyCard';
import Map from '../components/Map';
import ChatWidget from '../components/ChatWidget';
import { useAuth } from '../context/AuthContext';
import { trackUserView, createInquiry } from '../utils/api';
import { Row, Col, Spin, Tag, message } from 'antd';
import { getProfileImageUrl } from '../utils/imageUtils';
import StayBookingWidget from '../components/StayBookingWidget';

const getAmenityEmoji = (feature) => {
    const f = feature.toLowerCase();
    if (f.includes('wifi') || f.includes('internet')) return '📶';
    if (f.includes('pool') || f.includes('swimming')) return '🏊';
    if (f.includes('parking') || f.includes('garage')) return '🚗';
    if (f.includes('security') || f.includes('guarded') || f.includes('cctv')) return '🛡️';
    if (f.includes('ac') || f.includes('air') || f.includes('conditioning')) return '❄️';
    if (f.includes('tv') || f.includes('television')) return '📺';
    if (f.includes('gym') || f.includes('fitness')) return '💪';
    if (f.includes('kitchen') || f.includes('cooking')) return '🍳';
    if (f.includes('coffee') || f.includes('cafe')) return '☕';
    if (f.includes('garden') || f.includes('park') || f.includes('trees')) return '🌳';
    if (f.includes('balcony') || f.includes('terrace') || f.includes('rooftop')) return '🌅';
    if (f.includes('workspace') || f.includes('office')) return '💻';
    if (f.includes('water') || f.includes('borehole')) return '💧';
    if (f.includes('power') || f.includes('generator') || f.includes('solar')) return '⚡';
    if (f.includes('laundry') || f.includes('wash')) return '🧺';
    if (f.includes('elevator') || f.includes('lift')) return '🛗';
    if (f.includes('pets') || f.includes('pet')) return '🐾';
    if (f.includes('bar') || f.includes('lounge')) return '🍷';
    return '✨';
};

function PropertyDetailPage() {
    const { slug } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedProperties, setRelatedProperties] = useState([]);
    const [currentImage, setCurrentImage] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showInquiry, setShowInquiry] = useState(false);

    const { user } = useAuth();
    const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                setLoading(true);
                const data = await propertyApi.getPropertyBySlug(slug);
                if (!data) throw new Error('Property not found');

                let propertyData = data;
                if (data.items) propertyData = data.items;
                else if (data.property) propertyData = data.property;
                else if (data.properties) propertyData = data.properties;

                if (Array.isArray(propertyData)) propertyData = propertyData[0];
                if (!propertyData) throw new Error('Invalid property data');

                const transformed = transformProperty(propertyData);
                setProperty(transformed);

                if (propertyData.type) {
                    try {
                        const relatedResponse = await propertyApi.getPropertiesByType(propertyData.type, 1, 4);
                        let relatedList = [];
                        if (Array.isArray(relatedResponse)) relatedList = relatedResponse;
                        else if (relatedResponse?.items && Array.isArray(relatedResponse.items)) relatedList = relatedResponse.items;
                        else if (relatedResponse?.properties && Array.isArray(relatedResponse.properties)) relatedList = relatedResponse.properties;

                        setRelatedProperties(
                            relatedList.filter(p => p.slug !== slug).map(transformProperty).slice(0, 3)
                        );
                    } catch (_) {}
                }
            } catch (error) {
                console.error('Failed to fetch property:', error);
                setProperty(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [slug]);

    useEffect(() => {
        if (property) {
            analytics.trackPropertyView(property);
            if (user && property.id) trackUserView(property.id).catch(() => {});
        }
    }, [property, user]);

    useEffect(() => {
        if (user) {
            setInquiryForm(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    const handleInquirySubmit = async (e) => {
        e.preventDefault();
        if (inquiryForm.message.length < 10) {
            message.error('Message must be at least 10 characters.');
            return;
        }
        setSubmitting(true);
        try {
            await createInquiry({ property_id: property.id, ...inquiryForm });
            message.success('Inquiry sent! An agent will contact you soon.');
            setInquiryForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', message: '' });
            setShowInquiry(false);
        } catch {
            message.error('Failed to send inquiry. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        message.success('Link copied!');
    };

    if (loading) {
        return (
            <div className="pd-loading-screen">
                <Spin size="large" />
                <p>Loading property...</p>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="pd-not-found-screen">
                <div className="pd-not-found-card">
                    <div className="pd-nf-icon">
                        <Building2 size={40} color="#ef4444" />
                    </div>
                    <h1>Property Not Found</h1>
                    <p>The property you're looking for doesn't exist or has been removed.</p>
                    <Link to="/listings" className="pd-nf-btn">Back to Listings</Link>
                </div>
            </div>
        );
    }

    const images = property.images?.length > 0 ? property.images : ['/placeholder-property.jpg'];
    const nextImage = () => setCurrentImage(p => (p + 1) % images.length);
    const prevImage = () => setCurrentImage(p => (p - 1 + images.length) % images.length);

    const purposeLabel = property.purpose ? property.purpose.charAt(0).toUpperCase() + property.purpose.slice(1) : 'For Sale';
    const typeLabel = property.type ? property.type.charAt(0).toUpperCase() + property.type.slice(1) : 'Property';
    const statusLabel = property.status ? property.status.charAt(0).toUpperCase() + property.status.slice(1) : 'Available';

    return (
        <div className="property-detail-page">
            <div className="pd-container">

                {/* Breadcrumbs */}
                <nav className="pd-breadcrumb">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <Link to="/listings">Properties</Link>
                    <span>/</span>
                    <span>{property.title}</span>
                </nav>

                {/* Page Title Row */}
                <div className="pd-title-row">
                    <div>
                        <h1 className="pd-title">{property.title}</h1>
                        <div className="pd-meta-row">
                            <MapPin size={15} color="#6b7280" />
                            <span>{property.location.city}{property.location.area ? `, ${property.location.area}` : ''}</span>
                            <Tag color="blue" style={{ marginLeft: 8 }}>{purposeLabel}</Tag>
                            <Tag color="default">{typeLabel}</Tag>
                            <Tag color={property.status === 'available' ? 'green' : 'orange'}>{statusLabel}</Tag>
                        </div>
                    </div>
                    <div className="pd-title-actions">
                        <button className="pd-action-btn" onClick={handleShare}>
                            <Share2 size={18} />
                            <span>Share</span>
                        </button>
                        <div className="pd-price-pill">
                            {formatPrice(property.price, property.currency)}
                        </div>
                    </div>
                </div>

                {/* Gallery */}
                <div className="pd-gallery">
                    <div className="pd-gallery-main">
                        <img src={images[currentImage]} alt={property.title} />
                        {images.length > 1 && (
                            <>
                                <button className="pd-gallery-btn pd-gallery-prev" onClick={prevImage}>
                                    <ChevronLeft size={22} />
                                </button>
                                <button className="pd-gallery-btn pd-gallery-next" onClick={nextImage}>
                                    <ChevronRight size={22} />
                                </button>
                                <div className="pd-image-counter">{currentImage + 1} / {images.length}</div>
                            </>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="pd-gallery-thumbs">
                            {images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`pd-thumb ${currentImage === idx ? 'active' : ''}`}
                                    onClick={() => setCurrentImage(idx)}
                                >
                                    <img src={img} alt="" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Body: 2-column layout */}
                <div className="pd-body">
                    {/* Left: Content */}
                    <div className="pd-content">

                        {/* Quick Specs */}
                        <div className="pd-specs-bar">
                            <div className="pd-spec">
                                <span className="pd-spec-val">{property.bedrooms ?? 0}</span>
                                <span className="pd-spec-lbl">Bedrooms</span>
                            </div>
                            <div className="pd-spec-divider" />
                            <div className="pd-spec">
                                <span className="pd-spec-val">{property.bathrooms ?? 0}</span>
                                <span className="pd-spec-lbl">Bathrooms</span>
                            </div>
                            <div className="pd-spec-divider" />
                            <div className="pd-spec">
                                <span className="pd-spec-val">{property.size || 'N/A'}</span>
                                <span className="pd-spec-lbl">Area</span>
                            </div>
                            {property.floors && (
                                <>
                                    <div className="pd-spec-divider" />
                                    <div className="pd-spec">
                                        <span className="pd-spec-val">{property.floors}</span>
                                        <span className="pd-spec-lbl">Floors</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* About */}
                        <section className="pd-section">
                            <h2 className="pd-section-title">About this property</h2>
                            <p className="pd-description">{property.description || 'No description available. Contact the agent for more details.'}</p>
                        </section>

                        {/* Property Details */}
                        <section className="pd-section">
                            <h2 className="pd-section-title">Property Details</h2>
                            <div className="pd-details-grid">
                                {[
                                    { label: 'Type', value: typeLabel },
                                    { label: 'Purpose', value: purposeLabel },
                                    { label: 'Status', value: statusLabel },
                                    { label: 'Address', value: property.address || `${property.location.city}, Kenya` },
                                    ...(property.bedrooms != null ? [{ label: 'Bedrooms', value: property.bedrooms }] : []),
                                    ...(property.bathrooms != null ? [{ label: 'Bathrooms', value: property.bathrooms }] : []),
                                    ...(property.area_sqft ? [{ label: 'Area', value: `${property.area_sqft.toLocaleString()} sq ft` }] : []),
                                    ...(property.year_built ? [{ label: 'Year Built', value: property.year_built }] : []),
                                ].map((row, i) => (
                                    <div className="pd-detail-row" key={i}>
                                        <span className="pd-detail-label">{row.label}</span>
                                        <span className="pd-detail-value">{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Amenities */}
                        <section className="pd-section">
                            <h2 className="pd-section-title">
                                Amenities
                                {property.features?.length > 0 && (
                                    <span className="pd-amenity-count">{property.features.length} features</span>
                                )}
                            </h2>
                            {property.features?.length > 0 ? (
                                <div className="pd-amenities-grid">
                                    {property.features.map((feature, i) => (
                                        <div className="pd-amenity-item" key={i}>
                                            <span className="pd-amenity-emoji">{getAmenityEmoji(feature)}</span>
                                            <span className="pd-amenity-name">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="pd-amenities-empty">
                                    <Check size={20} color="#9ca3af" />
                                    <span>Standard amenities included. Contact agent for full list.</span>
                                </div>
                            )}
                        </section>

                        {/* Location / Map */}
                        <section className="pd-section">
                            <h2 className="pd-section-title">Location</h2>
                            <div className="pd-map-box">
                                <Map
                                    center={property.coordinates}
                                    address={property.address || property.title}
                                />
                            </div>
                            <div className="pd-map-footer">
                                <MapPin size={15} />
                                <span>{property.location.city}{property.location.area ? `, ${property.location.area}` : ''}, Kenya</span>
                                {!property.coordinates && (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((property.address || property.title) + ' ' + property.location.city)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="pd-map-link"
                                    >
                                        <ExternalLink size={14} />
                                        Open in Maps
                                    </a>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right: Sticky Sidebar */}
                    <aside className="pd-sidebar">
                        {/* Price Card / Booking Widget */}
                        {(property.purpose === 'stay' || property.purpose === 'short_stay') ? (
                            <StayBookingWidget
                                propertyId={property.id}
                                price={property.price}
                                currency={property.currency}
                                title={property.title}
                            />
                        ) : (
                        <div className="pd-sidebar-card">
                            <div className="pd-sidebar-price">
                                <span className="pd-price-label">Price</span>
                                <span className="pd-price-value">{formatPrice(property.price, property.currency)}</span>
                                {property.priceUnit && property.priceUnit !== '/ month' ? null : (
                                    property.purpose === 'rent' && <span className="pd-price-unit">/ month</span>
                                )}
                            </div>

                            <button className="pd-cta-btn" onClick={() => setIsChatOpen(true)}>
                                Request a Tour
                                <span className="pd-cta-sub">Earliest available tomorrow</span>
                            </button>

                            <button
                                className="pd-secondary-btn"
                                onClick={() => setShowInquiry(prev => !prev)}
                            >
                                {showInquiry ? 'Hide Form' : 'Send Inquiry'}
                            </button>

                            {showInquiry && (
                                <form className="pd-inquiry-form" onSubmit={handleInquirySubmit}>
                                    <input
                                        className="pd-input"
                                        placeholder="Your name"
                                        value={inquiryForm.name}
                                        onChange={e => setInquiryForm(p => ({ ...p, name: e.target.value }))}
                                        required
                                    />
                                    <input
                                        className="pd-input"
                                        type="email"
                                        placeholder="Email address"
                                        value={inquiryForm.email}
                                        onChange={e => setInquiryForm(p => ({ ...p, email: e.target.value }))}
                                        required
                                    />
                                    <input
                                        className="pd-input"
                                        placeholder="Phone number"
                                        value={inquiryForm.phone}
                                        onChange={e => setInquiryForm(p => ({ ...p, phone: e.target.value }))}
                                    />
                                    <textarea
                                        className="pd-input pd-textarea"
                                        placeholder="I'm interested in this property..."
                                        value={inquiryForm.message}
                                        onChange={e => setInquiryForm(p => ({ ...p, message: e.target.value }))}
                                        rows={3}
                                        required
                                    />
                                    <button className="pd-cta-btn" type="submit" disabled={submitting}>
                                        {submitting ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            )}
                        </div>
                        )}

                        {/* Agent Card */}
                        <div className="pd-sidebar-card pd-agent-card">
                            <p className="pd-agent-label">Listed by</p>
                            <Link
                                to={property.agent?.id ? `/agents/${property.agent.id}` : '#'}
                                className="pd-agent-link"
                            >
                                <div className="pd-agent-row">
                                    <img
                                        className="pd-agent-avatar"
                                        src={getProfileImageUrl(property.agent?.avatar_url)}
                                        alt={property.agent?.name}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div className="pd-agent-name">{property.agent?.name || 'Guri Agent'}</div>
                                        <div className="pd-agent-role">
                                            {property.agent?.specialization || 'Professional Agent'}
                                        </div>
                                    </div>
                                    <span className="pd-agent-view">View →</span>
                                </div>
                            </Link>
                            {property.agent?.phone && (
                                <a href={`tel:${property.agent.phone}`} className="pd-agent-phone">
                                    {property.agent.phone}
                                </a>
                            )}
                        </div>
                    </aside>
                </div>
            </div>

            {/* Similar Properties */}
            {relatedProperties.length > 0 && (
                <div className="pd-similar-section">
                    <div className="pd-container">
                        <div className="pd-similar-header">
                            <div>
                                <div className="pd-similar-label">You might also like</div>
                                <h2 className="pd-similar-title">Similar Properties</h2>
                            </div>
                            <Link to="/listings" className="pd-view-all">View All</Link>
                        </div>
                        <Row gutter={[28, 28]}>
                            {relatedProperties.map(prop => (
                                <Col xs={24} md={12} lg={8} key={prop.id}>
                                    <PropertyCard property={prop} />
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>
            )}

            <ChatWidget
                propertyId={property.id}
                propertyTitle={property.title}
                agentName={property.agent?.name}
                agentId={property.agent?.id}
                externalOpen={isChatOpen}
                setExternalOpen={setIsChatOpen}
            />
        </div>
    );
}

export default PropertyDetailPage;
