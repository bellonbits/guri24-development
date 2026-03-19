import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Card, Avatar, Button, Spin } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { getPublicAgents } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import './AgentSection.css';

const { Title, Text: AntText, Paragraph } = Typography;

const AgentSection = ({ title, subtitle }) => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                setLoading(true);
                const response = await getPublicAgents();
                const agentsData = response?.items || response || [];
                setAgents(agentsData.slice(0, 4));
            } catch (error) {
                console.error('AgentSection: Failed to fetch agents:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAgents();
    }, []);

    if (loading && agents.length === 0) {
        return (
            <section className="agent-section text-center">
                <Spin size="large" />
            </section>
        );
    }

    if (!loading && agents.length === 0) return null;

    return (
        <section className="agent-section">
            <div className="container">
                <Row gutter={[24, 32]} align="top">
                    <Col xs={24} lg={6}>
                        <div className="mb-8 lg:mb-0">
                            <Title level={2} className="agent-intro-title">
                                {title || 'Sell with top agents'}
                            </Title>
                            <Paragraph className="agent-intro-subtitle">
                                {subtitle || 'Skip the hustle and let the pros get things done'}
                            </Paragraph>
                            <Button
                                shape="round"
                                size="large"
                                className="agent-intro-btn h-12 px-6 font-semibold"
                                onClick={() => navigate('/contact')}
                            >
                                Top Agents <ArrowRightOutlined />
                            </Button>
                        </div>
                    </Col>

                    <Col xs={24} lg={18}>
                        <Row gutter={[24, 24]} className="agent-grid-container">
                            {agents.map(agent => (
                                <Col xs={24} sm={12} xl={6} key={agent.id}>
                                    <Card
                                        variant="borderless"
                                        className="agent-profile-card"
                                        styles={{ body: { padding: 0 } }}
                                    >
                                        <div className="agent-avatar-wrapper">
                                            <Avatar
                                                size={100}
                                                src={
                                                    agent.avatar_url
                                                        ? (agent.avatar_url.startsWith('http')
                                                            ? agent.avatar_url
                                                            : `https://api.guri24.com:8002${agent.avatar_url}`)
                                                        : agent.photo || agent.avatar || `https://i.pravatar.cc/150?u=${agent.id}`
                                                }
                                            />
                                            <div className="agent-rating-badge">
                                                <AntText className="rating-number">{agent.rating || '5.0'}</AntText>
                                                <AntText className="rating-star">★</AntText>
                                            </div>
                                        </div>
                                        <Title level={4} className="agent-name" ellipsis>{agent.full_name || agent.name}</Title>
                                        <AntText className="agent-property-count">
                                            {agent.property_count || agent.properties || 0} properties
                                        </AntText>
                                        <Button shape="round" block className="agent-contact-btn" onClick={() => navigate('/contact')}>Contact</Button>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            </div>
        </section>
    );
};

export default AgentSection;
