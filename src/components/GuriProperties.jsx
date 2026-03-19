import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Button, Badge, Space, Spin, Empty } from 'antd';
import { EnvironmentOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import propertyApi, { formatPrice, transformProperty } from '../utils/propertyApi';
import PropertyCard from './PropertyCard';

const { Title, Text: AntText, Paragraph } = Typography;

const GuriProperties = ({ properties: propData, loading: propLoading }) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (propData) {
            setProperties(propData);
            setLoading(propLoading);
        } else {
            const fetchProperties = async () => {
                try {
                    setLoading(true);
                    const response = await propertyApi.getProperties({ page_size: 6 });

                    let propertiesList = [];
                    if (Array.isArray(response)) {
                        propertiesList = response;
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
            fetchProperties();
        }
    }, [propData, propLoading]);

    if (loading) {
        return (
            <div style={{ padding: '100px 0', textAlign: 'center' }}>
                <Spin size="large" />
                <div style={{ marginTop: '20px' }}><AntText strong type="secondary">Loading handpicked properties...</AntText></div>
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div style={{ padding: '100px 0' }}>
                <Empty description="No properties found" />
            </div>
        );
    }

    return (
        <section style={{ padding: '60px', background: '#fff' }}>
            <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
                <Row gutter={[40, 60]}>
                    {properties.map((property) => (
                        <Col key={property.id} xs={24} sm={12} lg={8} xl={6}>
                            <PropertyCard property={property} />
                        </Col>
                    ))}
                </Row>

                {properties.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <Title level={3} style={{ color: '#ccc' }}>No properties found</Title>
                    </div>
                )}
            </div>
        </section>
    );
};

export default GuriProperties;
