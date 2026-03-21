import React, { useState, useEffect } from 'react';
import { Typography, Input, DatePicker, Button, Spin, Empty } from 'antd';
import { Search, MapPin, Calendar, Users, Loader2, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import PropertyCard from '../components/PropertyCard';
import GuriPageHeader from '../components/GuriPageHeader';
import { propertyApi, transformProperty } from '../utils/propertyApi';
import { staggerContainer, scaleIn, fadeUp, viewportOnce } from '../utils/animations';
import './StaysPage.css';

const { Title, Text: AntText } = Typography;
const { RangePicker } = DatePicker;

const StaysPage = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchStays = async () => {
            try {
                setLoading(true);
                const response = await propertyApi.getProperties({ purpose: 'stay', page_size: 100 });
                let list = [];
                if (Array.isArray(response)) list = response;
                else if (response?.items?.properties) list = response.items.properties;
                else if (response?.items) list = response.items;
                else if (response?.properties) list = response.properties;
                setProperties(list.map(transformProperty));
            } catch {
                setProperties([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStays();
    }, []);

    const filteredStays = properties.filter(s =>
        s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.location?.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="stays-page">
            <GuriPageHeader
                title="Find Unique Stays"
                subtitle="Book incredible homes, apartments, or villas for your next getaway or business trip."
            />

            {/* Search Card */}
            <div className="stays-search-wrap">
                <div className="stays-search-bar">
                    {/* Location */}
                    <div className="stays-field stays-field-border">
                        <MapPin size={18} color="#0052cc" style={{ flexShrink: 0 }} />
                        <Input
                            variant="borderless"
                            placeholder="Where are you going?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ fontWeight: 600, fontSize: '14px' }}
                        />
                    </div>

                    {/* Dates */}
                    <div className="stays-field stays-field-border stays-dates-field">
                        <Calendar size={18} color="#0052cc" style={{ flexShrink: 0 }} />
                        <RangePicker
                            variant="borderless"
                            style={{ flex: 1, fontWeight: 600 }}
                            placeholder={['Check In', 'Check Out']}
                        />
                    </div>

                    {/* Guests */}
                    <div className="stays-field stays-guests-field">
                        <Users size={18} color="#0052cc" style={{ flexShrink: 0 }} />
                        <AntText style={{ fontWeight: 600, color: '#555', whiteSpace: 'nowrap' }}>1 Guest</AntText>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<Search size={17} />}
                        className="stays-search-btn"
                    >
                        Search
                    </Button>
                </div>
            </div>

            {/* Results */}
            <main className="stays-main">
                {/* Header */}
                <motion.div
                    className="stays-results-header"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                            background: '#0052cc', color: '#fff',
                            fontWeight: 800, fontSize: '13px',
                            padding: '4px 12px', borderRadius: '8px',
                        }}>
                            {filteredStays.length}
                        </span>
                        <Title level={3} style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                            Available Stays
                        </Title>
                    </div>

                    {/* Category pills */}
                    <div className="stays-category-pills">
                        {['All', 'Beach', 'City', 'Mountain', 'Villa'].map(cat => (
                            <button key={cat} className="stays-pill">{cat}</button>
                        ))}
                    </div>
                </motion.div>

                {loading ? (
                    <div style={{ padding: '80px 0', textAlign: 'center' }}>
                        <Spin indicator={<Loader2 className="animate-spin" size={32} />} />
                        <p style={{ marginTop: 16, color: '#9ca3af', fontWeight: 600 }}>Finding the best stays…</p>
                    </div>
                ) : filteredStays.length > 0 ? (
                    <motion.div
                        className="stays-grid"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                    >
                        {filteredStays.map((stay, i) => (
                            <PropertyCard key={stay.id} property={stay} index={i} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                        style={{ padding: '80px 24px', textAlign: 'center', background: '#f8f9fa', borderRadius: '24px' }}
                    >
                        <Moon size={48} color="#d1d5db" style={{ marginBottom: 16 }} />
                        <p style={{ fontWeight: 700, fontSize: '18px', color: '#111827', marginBottom: 8 }}>No stays found</p>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>Try a different location or clear your search.</p>
                        <Button
                            shape="round" size="large"
                            onClick={() => setSearchQuery('')}
                            style={{ marginTop: 20, borderColor: '#0052cc', color: '#0052cc', fontWeight: 700 }}
                        >
                            Clear search
                        </Button>
                    </motion.div>
                )}
            </main>

        </div>
    );
};

export default StaysPage;
