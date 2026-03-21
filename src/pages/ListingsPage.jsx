import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './ListingsPage.css';
import { Typography, Button, Input, Select, Space, Spin } from 'antd';
import { Search, MapPin, Grid, List, Loader2, Home, ChevronDown } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import GuriPageHeader from '../components/GuriPageHeader';
import { propertyApi, transformProperty } from '../utils/propertyApi';

const { Text: AntText } = Typography;

const ListingsPage = ({ purpose = 'all', title = 'All Listings', subtitle = 'Browse all available properties' }) => {
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [propertyType, setPropertyType] = useState('all');
    const [propertyBedrooms, setPropertyBedrooms] = useState('Any');
    const [sortBy, setSortBy] = useState('newest');
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams);
        if (searchQuery) params.set('search', searchQuery); else params.delete('search');
        if (propertyType !== 'all') params.set('type', propertyType); else params.delete('type');
        if (propertyBedrooms !== 'Any') params.set('bedrooms', propertyBedrooms.replace('+', '')); else params.delete('bedrooms');
        setSearchParams(params);
    };

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);

                const querySearch = searchParams.get('search') || '';
                const queryType = searchParams.get('type') || 'all';
                const queryMaxPrice = searchParams.get('max_price') || '';
                const queryBedrooms = searchParams.get('bedrooms') || '';
                const queryPurpose = searchParams.get('purpose') || purpose || 'all';

                setSearchQuery(querySearch);
                setPropertyType(queryType);
                setPropertyBedrooms(queryBedrooms || 'Any');

                const params = { page: 1, page_size: 100 };
                if (queryPurpose && queryPurpose !== 'all') params.purpose = queryPurpose.toLowerCase();
                if (queryType && queryType !== 'all') params.type = queryType.toLowerCase();
                if (querySearch) params.search = querySearch;
                if (queryMaxPrice) params.max_price = queryMaxPrice;
                if (queryBedrooms) params.min_bedrooms = queryBedrooms;

                const response = await propertyApi.getProperties(params);
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

                setProperties(propertiesList.map(transformProperty));
            } catch (error) {
                console.error('Failed to fetch properties:', error);
                setProperties([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, [searchParams, purpose]);

    const filteredProperties = properties.sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        return new Date(b.created_at) - new Date(a.created_at);
    });

    return (
        <div className="listings-page">
            <GuriPageHeader title={title} subtitle={subtitle} />

            {/* Pill Search Bar */}
            <div className="listings-search-wrap">
                <div className="listings-search-bar">
                    {/* Location */}
                    <div className="listings-search-location">
                        <MapPin size={18} color="#0052cc" style={{ flexShrink: 0 }} />
                        <Input
                            variant="borderless"
                            placeholder="Search location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onPressEnter={applyFilters}
                            style={{ fontWeight: 600, fontSize: '14px' }}
                        />
                    </div>

                    {/* Property Type */}
                    <div className="listings-search-type">
                        <Select
                            variant="borderless"
                            value={propertyType}
                            onChange={(val) => setPropertyType(val)}
                            suffixIcon={<ChevronDown size={16} color="#0052cc" />}
                            style={{ width: '100%', fontWeight: 600 }}
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

                    {/* Bedrooms — hidden on mobile */}
                    <div className="listings-search-beds">
                        {['Any', '1', '2', '3+'].map(num => (
                            <button
                                key={num}
                                onClick={() => setPropertyBedrooms(num)}
                                style={{
                                    height: '34px', minWidth: '36px', borderRadius: '50px',
                                    border: propertyBedrooms === num ? '2px solid #0052cc' : '1.5px solid #e5e7eb',
                                    background: propertyBedrooms === num ? '#0052cc' : '#fff',
                                    color: propertyBedrooms === num ? '#fff' : '#555',
                                    fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                                    padding: '0 8px', transition: 'all 0.2s',
                                }}
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<Search size={17} />}
                        onClick={applyFilters}
                        className="listings-search-btn"
                    >
                        <span className="listings-search-label">Search</span>
                    </Button>
                </div>
            </div>

            {/* Results */}
            <main className="listings-main">
                <div className="listings-toolbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <span style={{
                            background: '#0052cc', color: 'white',
                            fontWeight: 800, fontSize: '12px',
                            padding: '3px 10px', borderRadius: '6px', flexShrink: 0,
                        }}>
                            {filteredProperties.length}
                        </span>
                        <AntText style={{ fontWeight: 600, color: '#6b7280', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {loading ? 'Loading...' : `Propert${filteredProperties.length !== 1 ? 'ies' : 'y'} found`}
                        </AntText>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <Select
                            defaultValue="newest"
                            onChange={(val) => setSortBy(val)}
                            style={{ width: 150 }}
                            options={[
                                { label: 'Sort by: Newest', value: 'newest' },
                                { label: 'Price: Low-High', value: 'price-low' },
                                { label: 'Price: High-Low', value: 'price-high' },
                            ]}
                        />
                        <div className="view-mode-toggle">
                            <Button
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                icon={<Grid size={17} />}
                                onClick={() => setViewMode('grid')}
                            />
                            <Button
                                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                icon={<List size={17} />}
                                onClick={() => setViewMode('list')}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="listings-loading">
                        <Spin indicator={<Loader2 className="animate-spin" size={32} />} />
                        <AntText className="loading-text">Fetching listings...</AntText>
                    </div>
                ) : filteredProperties.length > 0 ? (
                    <div className={`properties-grid ${viewMode === 'grid' ? 'grid' : 'list'}`}>
                        {filteredProperties.map(property => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <div style={{
                            width: 72, height: 72, background: '#f0f4f9',
                            borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: '#0052cc',
                        }}>
                            <Home size={32} />
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: '17px', color: '#111827', margin: '0 0 6px' }}>
                                No properties found
                            </p>
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                                Try adjusting your filters or search for a different location.
                            </p>
                        </div>
                        <Button
                            shape="round" size="large"
                            onClick={() => { setSearchQuery(''); setPropertyType('all'); setPropertyBedrooms('Any'); }}
                            style={{ borderColor: '#0052cc', color: '#0052cc', fontWeight: 700 }}
                        >
                            Clear all filters
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};


export default ListingsPage;
