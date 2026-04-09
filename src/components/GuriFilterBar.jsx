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
        { label: t('filter.short_stay', 'Short Stay'), value: 'short_stay' },
    ];

    const handleSearch = () => {
        if (onSearch) {
            onSearch({ location, type, priceRange, listingType: activeTab });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
            overflow: 'hidden',
        }}>
            {/* Tabs */}
            <div style={{
                display: 'flex',
                background: '#f3f4f6',
                padding: '6px',
                gap: '4px',
            }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        style={{
                            flex: 1,
                            padding: '10px 0',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: activeTab === tab.value
                                ? 'white'
                                : 'transparent',
                            color: activeTab === tab.value
                                ? '#1a5f9e'
                                : '#6b7280',
                            boxShadow: activeTab === tab.value
                                ? '0 2px 8px rgba(0,0,0,0.12)'
                                : 'none',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Fields */}
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
                <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <MapPin size={16} style={{ color: '#1a5f9e', marginTop: '18px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
                            {t('filter.location', 'Location')}
                        </div>
                        <Input
                            variant="borderless"
                            placeholder={t('filter.where_going', 'Where are you going?')}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ padding: 0, fontWeight: 600, fontSize: '14px', color: '#111827' }}
                        />
                    </div>
                </div>

                {/* Divider */}
                <div style={{ background: '#e5e7eb', margin: '12px 0' }} />

                {/* Property Type */}
                <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Home size={16} style={{ color: '#1a5f9e', marginTop: '18px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
                            {t('filter.type', 'Type')}
                        </div>
                        <Select
                            variant="borderless"
                            value={type}
                            onChange={(val) => setType(val)}
                            style={{ width: '100%', fontWeight: 600, fontSize: '14px', marginLeft: '-11px' }}
                            options={[
                                { label: t('filter.all_types', 'All Types'), value: 'all' },
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
                <div style={{ background: '#e5e7eb', margin: '12px 0' }} />

                {/* Price Range */}
                <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Tag size={16} style={{ color: '#1a5f9e', marginTop: '18px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
                            {t('filter.price_range', 'Price Range')}
                        </div>
                        <Select
                            variant="borderless"
                            value={priceRange}
                            onChange={(val) => setPriceRange(val)}
                            style={{ width: '100%', fontWeight: 600, fontSize: '14px', marginLeft: '-11px' }}
                            options={[
                                { label: t('filter.any_price', 'Any Price'), value: 'all' },
                                { label: t('filter.under_10m', 'Under KES 10M'), value: '10000000' },
                                { label: t('filter.under_50m', 'Under KES 50M'), value: '50000000' },
                                { label: t('filter.under_100m', 'Under KES 100M'), value: '100000000' },
                                { label: t('filter.above_100m', 'KES 100M+'), value: '500000000' },
                            ]}
                        />
                    </div>
                </div>

                {/* Search Button */}
                <div style={{ padding: '10px' }}>
                    <button
                        onClick={handleSearch}
                        style={{
                            height: '100%',
                            width: '100%',
                            minWidth: '56px',
                            background: 'linear-gradient(135deg, #1a5f9e 0%, #0d3b66 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 700,
                            fontSize: '14px',
                            padding: '0 20px',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 16px rgba(26,95,158,0.4)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #0d3b66 0%, #071a35 100%)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,95,158,0.5)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #1a5f9e 0%, #0d3b66 100%)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,95,158,0.4)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <Search size={18} />
                        <span className="hidden sm:inline">{t('filter.search', 'Search')}</span>
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
                        padding: 0 12px 14px !important;
                    }
                    .filter-bar-grid > div:last-child button {
                        height: 52px !important;
                        border-radius: 12px !important;
                        font-size: 15px !important;
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
