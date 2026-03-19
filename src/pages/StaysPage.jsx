import React, { useState, useEffect } from 'react';
import { Typography, Input, DatePicker, Button, Badge, Spin, Empty } from 'antd';
import {
    Search,
    MapPin,
    Calendar,
    Users,
    Loader2
} from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import GuriPageHeader from '../components/GuriPageHeader';
import { propertyApi, transformProperty } from '../utils/propertyApi';

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
                const response = await propertyApi.getProperties({
                    purpose: 'stay',
                    page_size: 100
                });

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

    const filteredStays = properties.filter(stay => {
        const matchesQuery = stay.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stay.location?.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stay.location?.city?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesQuery;
    });

    return (
        <div style={{ background: '#fff', minHeight: '100vh' }}>
            <GuriPageHeader
                title="Find Unique Stays"
                subtitle="Book incredible homes, apartments, or villas for your next getaway or business trip."
            />

            {/* Pill Search Bar */}
            <div style={{ marginTop: '-45px', position: 'relative', zIndex: 10, padding: '0 40px' }}>
                <div style={{
                    maxWidth: '1100px', margin: '0 auto', background: '#fff',
                    padding: '12px', borderRadius: '100px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    border: '1px solid #f0f0f0'
                }}>
                    <div style={{ flex: 1.5, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px', borderRight: '1px solid #eee' }}>
                        <MapPin size={20} color="#0052cc" />
                        <Input
                            variant="borderless"
                            placeholder="Where are you going?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ fontWeight: 600, fontSize: '15px' }}
                        />
                    </div>

                    <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px', borderRight: '1px solid #eee' }}>
                        <Calendar size={20} color="#0052cc" />
                        <RangePicker
                            variant="borderless"
                            style={{ width: '100%', fontWeight: 600 }}
                            placeholder={['Check In', 'Check Out']}
                        />
                    </div>

                    <div style={{ flex: 0.8, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px' }}>
                        <Users size={20} color="#0052cc" />
                        <AntText style={{ fontWeight: 600, color: '#666', whiteSpace: 'nowrap' }}>1 Guest</AntText>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<Search size={18} />}
                        style={{
                            background: '#0052cc', height: '60px', borderRadius: '50px',
                            padding: '0 40px', fontWeight: 700, border: 'none'
                        }}
                    >
                        Search
                    </Button>
                </div>
            </div>

            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Badge count={filteredStays.length} color="#0052cc" style={{ fontWeight: 700 }} overflowCount={999} />
                        <Title level={3} style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Available Stays</Title>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '100px 0', textAlign: 'center' }}>
                        <Spin indicator={<Loader2 className="animate-spin" size={32} />} />
                    </div>
                ) : filteredStays.length > 0 ? (
                    <div className="grid grid-cols-4 gap-8 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1">
                        {filteredStays.map((stay) => (
                            <PropertyCard key={stay.id} property={stay} />
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '100px 0', textAlign: 'center', background: '#f8f9fa', borderRadius: '40px' }}>
                        <Empty description="No stays found matching your search" />
                    </div>
                )}
            </main>
        </div>
    );
};

export default StaysPage;
