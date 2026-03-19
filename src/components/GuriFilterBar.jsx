import { useState } from 'react';
import { Select, Input } from 'antd';
import { Search } from 'lucide-react';

const GuriFilterBar = ({ onSearch }) => {
    const [location, setLocation] = useState('');
    const [type, setType] = useState('all');
    const [priceRange, setPriceRange] = useState('all');

    const handleSearch = () => {
        if (onSearch) {
            onSearch({ location, type, priceRange });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            overflow: 'hidden',
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1px 1fr 1px 1fr auto',
                alignItems: 'stretch',
                minHeight: '72px',
            }}
                className="filter-bar-grid"
            >
                {/* Location */}
                <div style={{ padding: '12px 24px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                        Location
                    </div>
                    <Input
                        variant="borderless"
                        placeholder="Where are you going?"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{ padding: 0, fontWeight: 600, fontSize: '14px', color: '#111827' }}
                    />
                </div>

                {/* Divider */}
                <div style={{ background: '#e5e7eb', width: '1px', alignSelf: 'stretch' }} />

                {/* Property Type */}
                <div style={{ padding: '12px 24px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                        Type
                    </div>
                    <Select
                        variant="borderless"
                        value={type}
                        onChange={(val) => setType(val)}
                        style={{ width: '100%', fontWeight: 600, fontSize: '14px' }}
                        options={[
                            { label: 'All Types', value: 'all' },
                            { label: 'Apartment', value: 'apartment' },
                            { label: 'House', value: 'house' },
                            { label: 'Villa', value: 'villa' },
                            { label: 'Commercial', value: 'commercial' },
                            { label: 'Land', value: 'land' },
                        ]}
                    />
                </div>

                {/* Divider */}
                <div style={{ background: '#e5e7eb', width: '1px', alignSelf: 'stretch' }} />

                {/* Price Range */}
                <div style={{ padding: '12px 24px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                        Price Range
                    </div>
                    <Select
                        variant="borderless"
                        value={priceRange}
                        onChange={(val) => setPriceRange(val)}
                        style={{ width: '100%', fontWeight: 600, fontSize: '14px' }}
                        options={[
                            { label: 'Any Price', value: 'all' },
                            { label: 'Under KES 10M', value: '10000000' },
                            { label: 'Under KES 50M', value: '50000000' },
                            { label: 'Under KES 100M', value: '100000000' },
                            { label: 'KES 100M+', value: '500000000' },
                        ]}
                    />
                </div>

                {/* Search Button */}
                <div style={{ padding: '10px' }}>
                    <button
                        onClick={handleSearch}
                        style={{
                            height: '100%',
                            width: '100%',
                            minWidth: '60px',
                            background: '#1a5f9e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 700,
                            fontSize: '14px',
                            padding: '0 24px',
                            transition: 'background 0.2s ease',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#0d3b66'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#1a5f9e'}
                    >
                        <Search size={18} />
                        <span className="hidden sm:inline">Search</span>
                    </button>
                </div>
            </div>

            {/* Mobile layout override */}
            <style>{`
                @media (max-width: 768px) {
                    .filter-bar-grid {
                        grid-template-columns: 1fr !important;
                        min-height: auto !important;
                    }
                    .filter-bar-grid > div:nth-child(2),
                    .filter-bar-grid > div:nth-child(4) {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default GuriFilterBar;
