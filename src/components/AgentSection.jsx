import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Card, Avatar, Button, Spin } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getPublicAgents } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { fadeUp, scaleIn, slideLeft, staggerContainer, viewportOnce } from '../utils/animations';
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
                const agentsData = response?.items || (Array.isArray(response) ? response : []);
                setAgents(agentsData);
            } catch (error) {
                console.error('AgentSection: Failed to fetch agents:', error);
                setAgents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAgents();
    }, []);

    const displayAgents = agents;

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
                                Contact Us <ArrowRightOutlined />
                            </Button>
                        </div>
                    </Col>

                    <Col xs={24} lg={18}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <Spin size="large" />
                            </div>
                        ) : (
                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={viewportOnce}
                            >
                            <Row gutter={[24, 24]} className="agent-grid-container">
                                {displayAgents.length > 0 ? (
                                    displayAgents.map((agent, idx) => (
                                        <Col xs={24} sm={12} xl={6} key={agent.id || idx}>
                                            <motion.div variants={scaleIn} custom={idx} whileHover={{ y: -8, transition: { duration: 0.2 } }}>
                                                <Card
                                                    variant="borderless"
                                                    className="agent-profile-card"
                                                    styles={{ body: { padding: 0 } }}
                                                    style={{ cursor: agent.id ? 'pointer' : 'default' }}
                                                    onClick={() => agent.id && navigate(`/agents/${agent.id}`)}
                                                >
                                                    <div className="agent-avatar-wrapper">
                                                        <Avatar
                                                            size={100}
                                                            src={
                                                                agent.avatar_url
                                                                    ? (agent.avatar_url.startsWith('http')
                                                                        ? agent.avatar_url
                                                                        : `https://api.guri24.com:8002${agent.avatar_url}`)
                                                                    : `https://i.pravatar.cc/150?u=${agent.id || idx}`
                                                            }
                                                        />
                                                        <div className="agent-rating-badge">
                                                            <AntText className="rating-number">{agent.rating || '5.0'}</AntText>
                                                            <AntText className="rating-star">★</AntText>
                                                        </div>
                                                    </div>
                                                    <Title level={4} className="agent-name" ellipsis>
                                                        {agent.full_name || agent.name}
                                                    </Title>
                                                    <AntText className="agent-property-count">
                                                        {agent.specialization
                                                            ? `${agent.specialization} · ${agent.property_count || 0} listings`
                                                            : `${agent.property_count || 0} listings`}
                                                    </AntText>
                                                    {agent.id && (
                                                        <Button
                                                            shape="round"
                                                            block
                                                            className="agent-contact-btn"
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/agents/${agent.id}`); }}
                                                        >
                                                            View Profile
                                                        </Button>
                                                    )}
                                                </Card>
                                            </motion.div>
                                        </Col>
                                    ))
                                ) : (
                                    <div style={{ padding: '40px', textAlign: 'center', width: '100%' }}>
                                        <AntText type="secondary">No agents available at the moment.</AntText>
                                    </div>
                                )}
                            </Row>
                            </motion.div>
                        )}
                    </Col>
                </Row>
            </div>
        </section>
    );
};

export default AgentSection;
