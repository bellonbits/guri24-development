import React, { useState, useEffect } from 'react';
import { Layout, message, Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
const { Title } = Typography;
import GuriNav from '../components/GuriNav';
import GuriHero from '../components/GuriHero';
import GuriFilterBar from '../components/GuriFilterBar';
import GuriProperties from '../components/GuriProperties';
import AgentSection from '../components/AgentSection';
import BlogSection from '../components/BlogSection';
import Footer from '../components/Footer';

import propertyApi, { transformProperty } from '../utils/propertyApi';

import SEO from '../components/SEO';

const { Content } = Layout;

const GuriLandingPage = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHighlightedProperties = async () => {
            try {
                setLoading(true);
                const response = await propertyApi.getProperties({ page_size: 10 });

                let propertiesList = [];
                if (Array.isArray(response)) {
                    propertiesList = response;
                } else if (response?.properties && Array.isArray(response.properties)) {
                    propertiesList = response.properties;
                } else if (response?.items?.properties && Array.isArray(response.items.properties)) {
                    propertiesList = response.items.properties;
                } else if (response && Array.isArray(response.items)) {
                    propertiesList = response.items;
                }

                const transformed = propertiesList.map(transformProperty);
                setProperties(transformed);
            } catch (error) {
                console.error('Failed to fetch properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHighlightedProperties();
    }, []);

    const handleSearch = () => {
        navigate('/listings');
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#fff' }}>
            <SEO
                title="Property for living & investments"
                description="The most trusted real estate platform in East Africa. Buy, rent or sell properties with verified listings and professional agents."
            />
            <div style={{ background: 'var(--bg-gradient)', width: '100%' }}>
                <GuriNav />
                <Content style={{ width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
                    <GuriHero property={properties[0]} loading={loading} />
                    <GuriFilterBar onSearch={handleSearch} />
                </Content>
            </div>

            <section style={{ background: '#fff', padding: '60px 0' }}>
                <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px' }}>
                    <Title level={2} style={{ fontSize: '42px', fontWeight: 600, margin: 0, letterSpacing: '-1.5px' }}>Latest in your area</Title>
                    <Button
                        shape="round"
                        size="large"
                        style={{ fontWeight: 600 }}
                        onClick={() => navigate('/listings')}
                    >
                        View all &gt;
                    </Button>
                </div>
                <GuriProperties properties={properties.slice(0, 6)} loading={loading} />
            </section>

            <AgentSection />

            <section style={{ background: '#fff', padding: '60px 0' }}>
                <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px' }}>
                    <Title level={2} style={{ fontSize: '42px', fontWeight: 600, margin: 0, letterSpacing: '-1.5px' }}>You might be interested in</Title>
                    <Button
                        shape="round"
                        size="large"
                        style={{ fontWeight: 600 }}
                        onClick={() => navigate('/listings')}
                    >
                        View all &gt;
                    </Button>
                </div>
                <GuriProperties properties={properties.slice(0, 3)} loading={loading} />
            </section>

            <BlogSection />

            <Footer />
        </Layout>
    );
};

export default GuriLandingPage;
