import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Star, Calendar } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { propertyApi, transformProperty } from '../utils/propertyApi';
import './StaysPage.css';

function StaysPage() {
    const { t } = useTranslation();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [showGuestPicker, setShowGuestPicker] = useState(false);

    useEffect(() => {
        const fetchStays = async () => {
            try {
                setLoading(true);
                const response = await propertyApi.getProperties({
                    purpose: 'stay',
                    page_size: 100
                });

                // Robust extraction of the array
                let propertiesList = [];
                if (Array.isArray(response)) {
                    propertiesList = response;
                } else if (response?.items?.properties && Array.isArray(response.items.properties)) {
                    propertiesList = response.items.properties;
                } else if (response && Array.isArray(response.items)) {
                    propertiesList = response.items;
                } else if (response && Array.isArray(response.properties)) {
                    propertiesList = response.properties;
                }

                const transformed = propertiesList.map(transformProperty);
                setProperties(transformed);
            } catch (error) {
                console.error('Failed to fetch stays:', error);
                setProperties([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStays();
    }, []);

    const handleSearch = () => {
        // Logic for advanced search can go here if backend supports it
        // For now, it filters the current local properties list
        console.log('Searching for:', { searchQuery, checkIn, checkOut, guests });
    };

    const filteredStays = properties.filter(stay => {
        // Handle potential undefined values
        const title = stay.title || '';
        const area = stay.location?.area || '';
        const city = stay.location?.city || '';

        const matchesQuery = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            area.toLowerCase().includes(searchQuery.toLowerCase()) ||
            city.toLowerCase().includes(searchQuery.toLowerCase());

        // Normalize purpose for comparison
        const normalizedPurpose = stay.purpose?.toLowerCase();
        return matchesQuery && normalizedPurpose === 'stay';
    });

    return (
        <div className="stays-page">
            <header className="stays-hero">
                <div className="stays-hero-bg"></div>
                <div className="container">
                    <div className="stays-hero-content">
                        <span className="stays-badge">{t('stays.badge', 'Short-Term Stays')}</span>
                        <h1>{t('stays.hero_title', 'Find unique places to stay')}</h1>
                        <p>{t('stays.hero_subtitle', 'Book homes, apartments or villas for your next getaway.')}</p>
                    </div>

                    <div className="stays-search-container">
                        <div className="stays-search-bar">
                            <div className="search-section location-input">
                                <label>{t('stays.location', 'Location')}</label>
                                <div className="input-with-icon">
                                    <MapPin size={18} />
                                    <input
                                        type="text"
                                        placeholder={t('stays.search_placeholder', 'Where are you going?')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="search-divider"></div>
                            <div className="search-section date-section">
                                <label>{t('stays.check_in', 'Check in')}</label>
                                <div className="input-with-icon">
                                    <Calendar size={18} />
                                    <input
                                        type="date"
                                        className="date-input"
                                        value={checkIn}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="search-divider"></div>
                            <div className="search-section date-section">
                                <label>{t('stays.check_out', 'Check out')}</label>
                                <div className="input-with-icon">
                                    <Calendar size={18} />
                                    <input
                                        type="date"
                                        className="date-input"
                                        value={checkOut}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="search-divider"></div>
                            <div className="search-section guests-input" onClick={() => setShowGuestPicker(!showGuestPicker)}>
                                <label>{t('stays.guests', 'Guests')}</label>
                                <div className="guest-selector-wrapper">
                                    <Star size={18} />
                                    <div className="guest-selector">
                                        {guests} {t('stays.guest_count', 'guest')}{guests > 1 ? 's' : ''}
                                    </div>
                                </div>
                                {showGuestPicker && (
                                    <div className="guest-dropdown" onClick={(e) => e.stopPropagation()}>
                                        <div className="guest-row">
                                            <span>Adults</span>
                                            <div className="counter">
                                                <button onClick={() => setGuests(Math.max(1, guests - 1))}>-</button>
                                                <span>{guests}</span>
                                                <button onClick={() => setGuests(guests + 1)}>+</button>
                                            </div>
                                        </div>
                                        <button className="done-btn" onClick={() => setShowGuestPicker(false)}>Apply</button>
                                    </div>
                                )}
                            </div>
                            <button className="search-booking-btn" onClick={handleSearch}>
                                <Search size={20} color="white" />
                                <span>{t('stays.search_btn', 'Search')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container stays-main">
                <div className="stays-category-bar">
                    <div className="category-item active">
                        <MapPin size={22} />
                        <span>All Stays</span>
                    </div>
                </div>

                {loading ? (
                    <div className="stays-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-card"></div>)}
                    </div>
                ) : (
                    <>
                        {filteredStays.length > 0 ? (
                            <div className="stays-grid">
                                {filteredStays.map((stay) => (
                                    <PropertyCard key={stay.id} property={stay} />
                                ))}
                            </div>
                        ) : (
                            <div className="no-stays">
                                <h2>No stays available</h2>
                                <p>We couldn't find any stays matching your criteria. Try adjusting your search.</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default StaysPage;
