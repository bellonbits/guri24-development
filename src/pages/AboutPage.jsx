import React from 'react';
import { Typography, Row, Col, Button } from 'antd';
import {
    Home,
    Users,
    Shield,
    Award,
    CheckCircle,
    ArrowRight
} from 'lucide-react';
import GuriPageHeader from '../components/GuriPageHeader';
import AgentSection from '../components/AgentSection';
import './AboutPage.css';

import SEO from '../components/SEO';

const { Title, Text: AntText, Paragraph } = Typography;

const AboutPage = () => {
    const stats = [
        { icon: <Home size={24} />, value: '12K+', label: 'Premium Listings' },
        { icon: <Users size={24} />, value: '45K+', label: 'Happy Customers' },
        { icon: <Award size={24} />, value: '15+', label: 'Awards Won' },
        { icon: <Shield size={24} />, value: '100%', label: 'Verified Listing' },
    ];

    return (
        <div className="about-page">
            <SEO
                title="About Us"
                description="Guri24 is redefining real estate across East Africa. Learn more about our mission, our values, and the expert team behind the platform."
            />
            <GuriPageHeader
                title="Redefining Real Estate across East Africa"
                subtitle="Guri24 is the leading platform for finding, renting, and management properties with unmatched precision and trust."
            />

            {/* Mission Section */}
            <section className="about-content">
                <div className="container">
                    <Row gutter={[80, 40]} align="middle">
                        <Col xs={24} lg={12}>
                            <div className="about-text">
                                <AntText className="section-subtitle">Our Mission</AntText>
                                <Title level={2}>
                                    Building Trust in Every Square Meter
                                </Title>
                                <Paragraph className="lead">
                                    We believe that finding a home should be an inspiring journey, not a stressful task. Guri24 combines cutting-edge technology with deep local expertise to bring transparency to the real estate market.
                                </Paragraph>

                                <div className="about-features">
                                    {['Verified Listings', 'Expert Support', 'Secure Payments', 'Strategic Insights'].map((item) => (
                                        <div key={item} className="feature-item">
                                            <CheckCircle size={18} />
                                            <AntText style={{ fontWeight: 600 }}>{item}</AntText>
                                        </div>
                                    ))}
                                </div>

                                <Button type="primary" size="large" className="btn-primary btn-large mt-4">
                                    Learn More <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                                </Button>
                            </div>
                        </Col>
                        <Col xs={24} lg={12}>
                            <div className="about-image">
                                <img
                                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
                                    alt="Modern Office"
                                />
                                <div className="experience-badge">
                                    <span className="years">10+</span>
                                    <span className="text">Years experience</span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>

            {/* Stats Section */}
            <section className="about-stats">
                <div className="container">
                    <Row gutter={[40, 40]}>
                        {stats.map((stat, i) => (
                            <Col xs={12} md={6} key={i}>
                                <div className="stat-box">
                                    <div className="icon">{stat.icon}</div>
                                    <span className="number">{stat.value}</span>
                                    <span className="label">{stat.label}</span>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* Team Section */}
            <AgentSection
                title="Meet Our Expert Agents"
                subtitle="Our dedicated team is here to guide you through every step of your real estate journey across East Africa."
            />
        </div>
    );
};

export default AboutPage;
