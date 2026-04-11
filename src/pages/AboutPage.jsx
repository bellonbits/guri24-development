import React from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const stats = [
        { icon: <Home size={24} />, value: '12K+', label: t('about.stat_listings') },
        { icon: <Users size={24} />, value: '45K+', label: t('about.stat_customers') },
        { icon: <Award size={24} />, value: '15+', label: t('about.stat_awards') },
        { icon: <Shield size={24} />, value: '100%', label: t('about.stat_verified') },
    ];

    return (
        <div className="about-page">
            <SEO
                title="About Us"
                description="Guri24 is redefining real estate across East Africa. Learn more about our mission, our values, and the expert team behind the platform."
            />
            <GuriPageHeader
                title={t('about.page_title')}
                subtitle={t('about.page_subtitle')}
            />

            {/* Mission Section */}
            <section className="about-content">
                <div className="container">
                    <Row gutter={[80, 40]} align="middle">
                        <Col xs={24} lg={12}>
                            <div className="about-text">
                                <AntText className="section-subtitle">{t('about.mission_subtitle')}</AntText>
                                <Title level={2}>
                                    {t('about.mission_title')}
                                </Title>
                                <Paragraph className="lead">
                                    {t('about.mission_desc')}
                                </Paragraph>

                                <div className="about-features">
                                    {[t('about.feature_verified'), t('about.feature_support'), t('about.feature_payments'), t('about.feature_insights')].map((item) => (
                                        <div key={item} className="feature-item">
                                            <CheckCircle size={18} />
                                            <AntText style={{ fontWeight: 600 }}>{item}</AntText>
                                        </div>
                                    ))}
                                </div>

                                <Button type="primary" size="large" className="btn-primary btn-large mt-4">
                                    {t('about.learn_more')} <ArrowRight size={18} style={{ marginLeft: '8px' }} />
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
                                    <span className="text">{t('about.years_experience')}</span>
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
                title={t('about.team_title')}
                subtitle={t('about.team_subtitle')}
            />
        </div>
    );
};

export default AboutPage;
