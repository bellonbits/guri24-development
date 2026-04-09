import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
        purpose,
    } = property;

    const navigate = useNavigate();
    const { t } = useTranslation();

    const lowerPurpose = useMemo(() => (purpose || '').toLowerCase(), [purpose]);

    const formattedPrice = useMemo(() => {
        if (!price) return t('property.on_request');
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: currency || 'KES',
            maximumFractionDigits: 0,
        }).format(price);
    }, [price, currency]);

    const badgeLabel = useMemo(() => {
        const key = (purpose || type || '').toLowerCase().trim();
        const PURPOSE_LABELS = {
            stay: t('property.short_stay'),
            short_stay: t('property.short_stay'),
            'short stay': t('property.short_stay'),
            rent: t('property.for_rent'),
            rental: t('property.for_rent'),
            sale: t('property.for_sale'),
            selling: t('property.for_sale'),
            buy: t('property.for_sale'),
        };
        return PURPOSE_LABELS[key] || (purpose ? purpose.replace(/_/g, ' ') : t('property.featured'));
    }, [purpose, type, t]);

    const actionLabel = useMemo(() => {
        if (lowerPurpose === 'stay' || lowerPurpose === 'short_stay') return t('property.book_now');
        if (lowerPurpose === 'rent') return t('property.rent_now');
        if (lowerPurpose === 'sale') return t('property.buy_now');
        return t('property.view');
    }, [lowerPurpose, t]);

    const priceLabel = useMemo(() => {
        if (lowerPurpose === 'stay' || lowerPurpose === 'short_stay') return t('property.per_night');
        if (lowerPurpose === 'rent') return t('property.per_month');
        return '';
    }, [lowerPurpose, t]);

    // Avoid "NAIVASHA, NAIVASHA" — only show area if different from city
    const locationText = useMemo(() => {
        const city = location?.city || '';
        const area = location?.area || '';
        if (!city && !area) return t('common.kenya');
        if (!area || area.toLowerCase() === city.toLowerCase()) return city;
        return `${area}, ${city}`;
    }, [location?.city, location?.area]);

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
                <span className="property-card-badge">{badgeLabel}</span>
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
                            <span>{t('property.sqft', { value: sqft.toLocaleString() })}</span>
                        </div>
                    )}
                    {bedrooms > 0 && (
                        <div className="property-detail-item">
                            <Bed size={13} />
                            <span>{t('property.bed', { count: bedrooms })}</span>
                        </div>
                    )}
                    {bathrooms > 0 && (
                        <div className="property-detail-item">
                            <Bath size={13} />
                            <span>{t('property.bath', { count: bathrooms })}</span>
                        </div>
                    )}
                    {!sqft && !bedrooms && !bathrooms && (
                        <div className="property-detail-item">
                            <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>{t('property.details_on_request')}</span>
                        </div>
                    )}
                </div>

                <div className="property-card-footer">
                    <div className="property-card-price">
                        <span className="price-value">{formattedPrice}</span>
                        {priceLabel && (
                            <span className="price-label">{priceLabel}</span>
                        )}
                    </div>

                    <button className="property-card-btn">
                        {actionLabel}
                        <ArrowRight size={13} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default PropertyCard;
