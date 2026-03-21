import React, { useState, useEffect } from 'react';
import { Typography, Input, DatePicker, Button, Spin, Empty } from 'antd';
import { Search, MapPin, Calendar, Users, Loader2, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import PropertyCard from '../components/PropertyCard';
import GuriPageHeader from '../components/GuriPageHeader';
import { propertyApi, transformProperty } from '../utils/propertyApi';
import { staggerContainer, scaleIn, fadeUp, viewportOnce } from '../utils/animations';

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
        <div style={{ background: '#fff', minHeight: '100vh' }}>
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

            <style>{`
                .stays-search-wrap {
                    margin-top: -45px;
                    position: relative;
                    z-index: 10;
                    padding: 0 24px;
                }
                .stays-search-bar {
                    max-width: 1100px;
                    margin: 0 auto;
                    background: #fff;
                    padding: 10px;
                    border-radius: 100px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border: 1px solid #f0f0f0;
                }
                .stays-field {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0 16px;
                    flex: 1;
                    min-width: 0;
                }
                .stays-field-border {
                    border-right: 1px solid #eee;
                }
                .stays-search-btn {
                    background: #0052cc !important;
                    height: 52px !important;
                    border-radius: 50px !important;
                    padding: 0 28px !important;
                    font-weight: 700 !important;
                    border: none !important;
                    flex-shrink: 0;
                }
                .stays-main {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 60px 24px 80px;
                }
                .stays-results-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .stays-category-pills {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .stays-pill {
                    padding: 6px 16px;
                    border-radius: 100px;
                    border: 1.5px solid #e5e7eb;
                    background: #fff;
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .stays-pill:hover {
                    border-color: #0052cc;
                    color: #0052cc;
                }
                .stays-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                }
                @media (max-width: 1200px) {
                    .stays-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 900px) {
                    .stays-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 768px) {
                    .stays-search-wrap {
                        margin-top: 16px;
                        padding: 0 16px;
                    }
                    .stays-search-bar {
                        flex-direction: row;
                        border-radius: 50px;
                        padding: 8px 8px 8px 16px;
                        gap: 8px;
                        align-items: center;
                    }
                    .stays-dates-field,
                    .stays-guests-field {
                        display: none !important;
                    }
                    .stays-field {
                        padding: 8px 0;
                        border-right: none !important;
                    }
                    .stays-search-btn {
                        height: 44px !important;
                        border-radius: 50px !important;
                        padding: 0 20px !important;
                        flex-shrink: 0;
                    }
                    .stays-main {
                        padding: 28px 16px 80px;
                    }
                    .stays-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                    }
                    .stays-results-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .stays-category-pills {
                        overflow-x: auto;
                        flex-wrap: nowrap;
                        padding-bottom: 4px;
                        width: 100%;
                    }
                    .stays-pill { flex-shrink: 0; }
                }
                @media (max-width: 480px) {
                    .stays-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default StaysPage;
