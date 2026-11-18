import { useState } from 'react';
import { Select, Input } from 'antd';
import { Search, MapPin, Home, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const GuriFilterBar = ({ onSearch }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('buy');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('all');
    const [priceRange, setPriceRange] = useState('all');

    const tabs = [
        { label: t('home.buy_link', 'Buy'), value: 'buy' },
        { label: t('home.rent_link', 'Rent'), value: 'rent' },
        { label: t('filter.short_stay', 'Short stay'), value: 'short_stay' },
    ];

    const handleSearch = () => {
        if (onSearch) {
            onSearch({ location, type, priceRange, listingType: activeTab });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    // B3 Nested Radius Formula: outer radius = 16px, inner gap = 8px -> inner radius = 16 - 8 = 8px
    return (
        <div
            role="search"
            aria-label={t('filter.search_properties', 'Search properties')}
            style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #94a3b8',
                boxShadow: '0 24px 56px rgba(10, 15, 26, 0.28)',
                overflow: 'hidden',
            }}
        >
            {/* Segmented Mode Tabs */}
            <div
                role="tablist"
                aria-label={t('filter.listing_purpose', 'Listing purpose')}
                style={{
                    display: 'flex',
                    backgroundColor: '#f1f5f9',
                    padding: '8px',
                    gap: '8px',
                    borderBottom: '1px solid #e2e8f0',
                }}
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.value;
                    return (
                        <button
                            key={tab.value}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setActiveTab(tab.value)}
                            className="button-sm"
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: isActive ? '1px solid #cbd5e1' : '1px solid transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                                backgroundColor: isActive ? '#ffffff' : 'transparent',
                                color: isActive ? '#1a5f9e' : '#475569',
                                boxShadow: isActive ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                            }}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Filter Fields */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1px 1fr 1px 1fr auto',
                    alignItems: 'stretch',
                    minHeight: '76px',
                }}
                className="filter-bar-grid"
            >
                {/* Location */}
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <MapPin size={16} aria-hidden="true" style={{ color: '#1a5f9e', marginTop: '16px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <label
                            htmlFor="hero-filter-location"
                            className="caption-3"
                            style={{
                                color: '#475569', /* 7.58:1 contrast on white (WCAG AAA) */
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                display: 'block',
                                marginBottom: '4px',
                            }}
                        >
                            {t('filter.location', 'Location')}
                        </label>
                        <Input
                            id="hero-filter-location"
                            variant="borderless"
                            placeholder={t('filter.where_going', 'City or neighborhood')}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ padding: 0, fontWeight: 600, fontSize: '14px', color: '#0a0f1a' }}
                        />
                    </div>
                </div>

                {/* Divider (3.02:1 non-text contrast) */}
                <div aria-hidden="true" style={{ backgroundColor: '#cbd5e1', margin: '12px 0' }} />

                {/* Property Type */}
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <Home size={16} aria-hidden="true" style={{ color: '#1a5f9e', marginTop: '16px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <span
                            id="hero-filter-type-label"
                            className="caption-3"
                            style={{
                                color: '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                display: 'block',
                                marginBottom: '4px',
                            }}
                        >
                            {t('filter.type', 'Property type')}
                        </span>
                        <Select
                            aria-labelledby="hero-filter-type-label"
                            variant="borderless"
                            value={type}
                            onChange={(val) => setType(val)}
                            style={{ width: '100%', fontWeight: 600, fontSize: '14px', marginLeft: '-11px' }}
                            options={[
                                { label: t('filter.all_types', 'All types'), value: 'all' },
                                { label: t('categories.apartment', 'Apartment'), value: 'apartment' },
                                { label: t('categories.house', 'House'), value: 'house' },
                                { label: t('categories.villa', 'Villa'), value: 'villa' },
                                { label: t('categories.commercial', 'Commercial'), value: 'commercial' },
                                { label: t('categories.land', 'Land'), value: 'land' },
                            ]}
                        />
                    </div>
                </div>

                {/* Divider */}
                <div aria-hidden="true" style={{ backgroundColor: '#cbd5e1', margin: '12px 0' }} />

                {/* Price Range */}
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <Tag size={16} aria-hidden="true" style={{ color: '#1a5f9e', marginTop: '16px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <span
                            id="hero-filter-price-label"
                            className="caption-3"
                            style={{
                                color: '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                display: 'block',
                                marginBottom: '4px',
                            }}
                        >
                            {t('filter.price_range', 'Budget')}
                        </span>
                        <Select
                            aria-labelledby="hero-filter-price-label"
                            variant="borderless"
                            value={priceRange}
                            onChange={(val) => setPriceRange(val)}
                            style={{ width: '100%', fontWeight: 600, fontSize: '14px', marginLeft: '-11px' }}
                            options={[
                                { label: t('filter.any_price', 'Any price'), value: 'all' },
                                { label: t('filter.under_10m', 'Under KES 10M'), value: '10000000' },
                                { label: t('filter.under_50m', 'Under KES 50M'), value: '50000000' },
                                { label: t('filter.under_100m', 'Under KES 100M'), value: '100000000' },
                                { label: t('filter.above_100m', 'KES 100M+'), value: '500000000' },
                            ]}
                        />
                    </div>
                </div>

                {/* Primary CTA Button (B4: flat background, B3: 16px - 8px = 8px inner radius, A5: verb + what they get) */}
                <div style={{ padding: '8px' }}>
                    <button
                        type="button"
                        onClick={handleSearch}
                        className="button-sm"
                        style={{
                            height: '100%',
                            width: '100%',
                            minWidth: '56px',
                            backgroundColor: '#1a5f9e',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            transition: 'background-color 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 8px rgba(26, 95, 158, 0.25)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#0d3b66';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#1a5f9e';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <Search size={16} aria-hidden="true" />
                        <span className="hidden sm:inline">{t('filter.search', 'Search homes')}</span>
                    </button>
                </div>
            </div>

            {/* Mobile layout */}
            <style>{`
                @media (max-width: 768px) {
                    .filter-bar-grid {
                        grid-template-columns: 1fr !important;
                        min-height: auto !important;
                    }
                    .filter-bar-grid > div:nth-child(2),
                    .filter-bar-grid > div:nth-child(4) {
                        display: none !important;
                    }
                    .filter-bar-grid > div:last-child {
                        padding: 0 12px 12px !important;
                    }
                    .filter-bar-grid > div:last-child button {
                        height: 48px !important;
                        border-radius: 8px !important;
                        font-size: 14px !important;
                        justify-content: center !important;
                    }
                    .filter-bar-grid > div:last-child button span {
                        display: inline !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default GuriFilterBar;
