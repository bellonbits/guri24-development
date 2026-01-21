import { useState } from 'react'; // Add useState
import { Link, useNavigate } from 'react-router-dom'; // Add useNavigate
import { Star, Heart, Info, Plus, Check, ShieldCheck } from 'lucide-react';
import { formatPrice } from '../utils/propertyApi';
import analytics from '../utils/analytics';
import './PropertyCard.css';
import { useAuth } from '../context/AuthContext'; // Import Auth
import { saveProperty, unsaveProperty } from '../utils/api'; // Import API

import { useCompare } from '../context/CompareContext';

function PropertyCard({ property, initialSaved = false }) { // Accept initialSaved
    const { slug, title, type, price, currency, priceUnit, location, images } = property;
    const rating = (4.5 + Math.random() * 0.5).toFixed(2);

    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [loading, setLoading] = useState(false);

    // Use Context
    const { toggleCompare, isInCompare } = useCompare();
    const isSelected = isInCompare(property.id);

    const handlePropertyClick = () => {
        analytics.trackPropertyCardAction('details', slug);
    };

    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Stop navigation

        if (!user) {
            // Redirect to login if not authenticated
            navigate('/login');
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            if (isSaved) {
                await unsaveProperty(property.id);
                setIsSaved(false);
                analytics.trackPropertyCardAction('unsave', slug);
            } else {
                await saveProperty(property.id);
                setIsSaved(true);
                analytics.trackPropertyCardAction('save', slug);
            }
        } catch (error) {
            console.error('Failed to update favorite status', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompareClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        analytics.trackPropertyCardAction('compare', slug);
        toggleCompare(property);
    };

    return (
        <div className={`property-card bnb-style ${isSelected ? 'is-comparing' : ''}`}>
            <div className="property-image-container">
                <Link to={`/property/${slug}`} onClick={handlePropertyClick}>
                    <img src={images[0]} alt={title} loading="lazy" />
                </Link>
                <button className={`favorite-btn-overlay ${isSaved ? 'active' : ''}`} onClick={handleFavoriteClick} disabled={loading}>
                    <Heart size={18} color={isSaved ? "#ef4444" : "white"} fill={isSaved ? "#ef4444" : "rgba(0,0,0,0.5)"} />
                </button>
                <div className="badge-overlay">{type}</div>
            </div>

            <div className="property-info">
                <Link to={`/property/${slug}`} className="bnb-info-link" onClick={handlePropertyClick}>
                    <div className="bnb-header">
                        <h3 className="bnb-location">
                            {location?.city || 'Unknown'}, {location?.country || ''}
                            {property.agent?.agent_status === 'verified' && (
                                <ShieldCheck size={16} className="verified-badge-icon" title="Verified Agent" />
                            )}
                        </h3>
                        <div className="bnb-rating">
                            <Star size={14} fill="currentColor" />
                            <span>{rating}</span>
                        </div>
                    </div>
                    <p className="bnb-title">{title}</p>
                    <p className="bnb-distance">Added {property.views || 0} views recently</p>

                    <div className="bnb-footer">
                        <div className="bnb-price">
                            <span className="bnb-amount">{formatPrice(price, currency)}</span>
                            <span className="bnb-unit">
                                {property.purpose?.toLowerCase() === 'stay' ? ' / night' : (priceUnit ? ` ${priceUnit}` : '')}
                            </span>
                        </div>
                        {property.purpose?.toLowerCase() === 'stay' && (
                            <button className="bnb-book-btn">Book Now</button>
                        )}
                    </div>
                </Link>

                <div className="card-quick-actions">
                    <button
                        className={`action-dot ${isSelected ? 'active' : ''}`}
                        title={isSelected ? "Remove from Compare" : "Add to Compare"}
                        onClick={handleCompareClick}
                    >
                        {isSelected ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PropertyCard;
