import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, ArrowRight, Home, Umbrella, Tent, Flame, Sparkles, Castle, Tractor, Palmtree, Club, ShoppingBag } from 'lucide-react';
import analytics from '../utils/analytics';
import PropertyCard from '../components/PropertyCard';
import ShortTermSection from '../components/ShortTermSection';
import { propertyApi, transformProperty } from '../utils/propertyApi';
import './HomePage.css';

import { useTranslation } from 'react-i18next';

function HomePage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'rent'
    const [scrolled, setScrolled] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Mansions');
    const [locationInput, setLocationInput] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch properties from API
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                const response = await propertyApi.getProperties({ page: 1, page_size: 4 });
                console.log("API Response:", response); // Debug log

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
                setFeaturedProperties(transformed);
            } catch (error) {
                console.error('Failed to fetch properties:', error);
                setFeaturedProperties([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg"></div>

                <div className="hero-content">
                    <h1>{t('hero.title', 'Find your next place to live')}</h1>

                    {/* Floating Tabs - Now separated for better mobile layout control */}
                    <div className="search-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'buy' ? 'active' : ''}`}
                            onClick={() => setActiveTab('buy')}
                        >
                            {t('nav.buy', 'Buy')}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'rent' ? 'active' : ''}`}
                            onClick={() => setActiveTab('rent')}
                        >
                            {t('nav.rent', 'Rent')}
                        </button>
                    </div>

                    <div className="search-container">
                        {/* Connected Search Bar */}
                        <div className="search-bar">
                            <div className="search-input-group location-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    placeholder={t('hero.search_placeholder', 'Where are you going?')}
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                />
                            </div>

                            <div className="divider"></div>

                            <div className="search-input-group type-group">
                                <label>Type</label>
                                <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                                    <option value="">Add type</option>
                                    <option value="apartment">{t('categories.apartment', 'Apartment')}</option>
                                    <option value="house">{t('categories.house', 'House')}</option>
                                    <option value="villa">{t('categories.villa', 'Villa')}</option>
                                    <option value="shop">{t('categories.shop', 'Shop')}</option>
                                </select>
                            </div>

                            <div className="divider"></div>

                            <div className="search-input-group price-group">
                                <label>Price Range</label>
                                <input
                                    type="text"
                                    placeholder="Add budget"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(e.target.value)}
                                />
                            </div>

                            <div className="search-button-wrapper">
                                <Link
                                    to="/listings"
                                    className="search-circle-btn"
                                    onClick={() => {
                                        analytics.trackSearch({
                                            type: activeTab,
                                            location: locationInput,
                                            propertyType: propertyType,
                                            priceRange: priceRange
                                        });
                                    }}
                                >
                                    <Search size={22} strokeWidth={2.5} />
                                    {/* Span only visible on mobile via css */}
                                    <span>{t('hero.search_btn', 'Search')}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Properties Section */}
            <section className="section-featured">
                <div className="container">
                    <div className="section-header">
                        <h2>{t('common.featured_properties', 'Featured Properties')}</h2>
                        <Link to="/listings" className="view-all-link">
                            {t('common.view_all', 'View all')} <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="properties-grid">
                        {featuredProperties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Short Term Stays Section (New) */}
            <ShortTermSection />

            {/* Categories */}
            <section className="section-categories">
                <div className="container">
                    <h2>{t('common.explore_category', 'Explore by Category')}</h2>
                    <div className="categories-scroll">
                        {[
                            { name: 'Beachfront', icon: <Umbrella size={24} /> },
                            { name: 'Shops', icon: <ShoppingBag size={24} />, key: 'shop' },
                            { name: 'Cabins', icon: <Tent size={24} /> },
                            { name: 'Trending', icon: <Flame size={24} /> },
                            { name: 'New', icon: <Sparkles size={24} /> },
                            { name: 'Mansions', icon: <Castle size={24} /> },
                            { name: 'Farms', icon: <Tractor size={24} /> },
                            { name: 'Islands', icon: <Palmtree size={24} /> },
                            { name: 'Golfing', icon: <Club size={24} /> }
                        ].map((cat, i) => (
                            <button
                                key={i}
                                className={`category-pill ${activeCategory === cat.name ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveCategory(cat.name);
                                    analytics.trackCategorySelect(cat.name);
                                }}
                            >
                                {cat.icon}
                                <span>{cat.key ? t(`categories.${cat.key}`) : cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HomePage;
