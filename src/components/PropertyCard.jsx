import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { scaleIn, viewportOnce } from '../utils/animations';
import './PropertyCard.css';

const PURPOSE_LABELS = {
    stay: 'Short Stay',
    short_stay: 'Short Stay',
    'short stay': 'Short Stay',
    rent: 'For Rent',
    rental: 'For Rent',
    sale: 'For Sale',
    selling: 'For Sale',
    buy: 'For Sale',
};

const PropertyCard = ({ property, index = 0 }) => {
    const {
        slug,
        title,
        price,
        currency,
        location,
        images,
        bedrooms,
        bathrooms,
        sqft,
        type,
        purpose
    } = property;

    const navigate = useNavigate();

    const formatPrice = (amount, cur) => {
        if (!amount) return 'On Request';
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: cur || 'KES',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getBadgeLabel = () => {
        const key = (purpose || type || '').toLowerCase().trim();
        return PURPOSE_LABELS[key] || (purpose ? purpose.replace(/_/g, ' ') : 'Featured');
    };

    const getActionLabel = () => {
        const lowerPurpose = (purpose || '').toLowerCase();
        if (lowerPurpose === 'stay' || lowerPurpose === 'short_stay') return 'Book Now';
        if (lowerPurpose === 'rent') return 'Rent Now';
        if (lowerPurpose === 'sale') return 'Buy Now';
        return 'View';
    };

    const getPriceLabel = () => {
        const lowerPurpose = (purpose || '').toLowerCase();
        if (lowerPurpose === 'stay' || lowerPurpose === 'short_stay') return '/ night';
        if (lowerPurpose === 'rent') return '/ month';
        return '';
    };

    // Avoid "NAIVASHA, NAIVASHA" — only show area if different from city
    const locationText = (() => {
        const city = location?.city || '';
        const area = location?.area || '';
        if (!city && !area) return 'Kenya';
        if (!area || area.toLowerCase() === city.toLowerCase()) return city;
        return `${area}, ${city}`;
    })();

    return (
        <motion.div
            className="property-card-wrapper"
            onClick={() => navigate(`/property/${slug}`)}
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            custom={index}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
        >
            {/* Image */}
            <div className="property-card-image-box">
                <span className="property-card-badge">{getBadgeLabel()}</span>
                <motion.img
                    src={images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                    alt={title}
                    loading="lazy"
                    whileHover={{ scale: 1.06, transition: { duration: 0.45 } }}
                />
            </div>

            {/* Content */}
            <div className="property-card-content">
                <div className="property-card-meta">
                    <MapPin size={11} />
                    <span>{locationText}</span>
                </div>

                <h3 className="property-card-title">{title}</h3>

                <div className="property-card-details">
                    {sqft > 0 && (
                        <div className="property-detail-item">
                            <Maximize size={13} />
                            <span>{sqft.toLocaleString()} sqft</span>
                        </div>
                    )}
                    {bedrooms > 0 && (
                        <div className="property-detail-item">
                            <Bed size={13} />
                            <span>{bedrooms} Bed</span>
                        </div>
                    )}
                    {bathrooms > 0 && (
                        <div className="property-detail-item">
                            <Bath size={13} />
                            <span>{bathrooms} Bath</span>
                        </div>
                    )}
                    {!sqft && !bedrooms && !bathrooms && (
                        <div className="property-detail-item">
                            <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>Details available on request</span>
                        </div>
                    )}
                </div>

                <div className="property-card-footer">
                    <div className="property-card-price">
                        <span className="price-value">{formatPrice(price, currency)}</span>
                        {getPriceLabel() && (
                            <span className="price-label">{getPriceLabel()}</span>
                        )}
                    </div>

                    <button className="property-card-btn">
                        {getActionLabel()}
                        <ArrowRight size={13} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default PropertyCard;
