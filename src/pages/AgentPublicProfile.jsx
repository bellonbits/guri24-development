import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Building2, Briefcase, Star, ArrowLeft } from 'lucide-react';
import { Spin, Row, Col, Tag } from 'antd';
import { getPublicAgentById } from '../utils/api';
import { propertyApi, transformProperty, formatPrice } from '../utils/propertyApi';
import { getProfileImageUrl } from '../utils/imageUtils';
import PropertyCard from '../components/PropertyCard';
import './AgentPublicProfile.css';

function AgentPublicProfile() {
    const { id } = useParams();
    const [agent, setAgent] = useState(null);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [propsLoading, setPropsLoading] = useState(true);

    useEffect(() => {
        const fetchAgent = async () => {
            try {
                const data = await getPublicAgentById(id);
                setAgent(data);
            } catch (err) {
                console.error('Failed to load agent:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAgent();
    }, [id]);

    useEffect(() => {
        if (!id) return;
        const fetchProperties = async () => {
            try {
                const res = await propertyApi.getAgentProperties(id);
                let list = [];
                if (Array.isArray(res)) list = res;
                else if (res?.items && Array.isArray(res.items)) list = res.items;
                else if (res?.properties && Array.isArray(res.properties)) list = res.properties;
                setProperties(list.map(transformProperty).slice(0, 9));
            } catch (err) {
                console.error('Failed to load agent properties:', err);
            } finally {
                setPropsLoading(false);
            }
        };
        fetchProperties();
    }, [id]);

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!agent) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{ textAlign: 'center' }}>
                    <Building2 size={48} color="#d1d5db" style={{ marginBottom: 16 }} />
                    <h2 style={{ color: '#374151', marginBottom: 8 }}>Agent Not Found</h2>
                    <Link to="/listings" style={{ color: '#1a5f9e', fontWeight: 700 }}>← Back to Listings</Link>
                </div>
            </div>
        );
    }

    const isVerified = agent.agent_status === 'verified';

    return (
        <div className="agp-page">
            {/* Back */}
            <div className="agp-container">
                <Link to="/listings" className="agp-back">
                    <ArrowLeft size={16} /> Back to Listings
                </Link>
            </div>

            {/* Hero */}
            <div className="agp-hero">
                <div className="agp-container">
                    <div className="agp-hero-inner">
                        <div className="agp-avatar-wrap">
                            <img
                                src={getProfileImageUrl(agent.avatar_url)}
                                alt={agent.name}
                                className="agp-avatar"
                            />
                            {isVerified && (
                                <div className="agp-verified-badge" title="Verified Agent">
                                    <Star size={14} fill="#fff" color="#fff" />
                                </div>
                            )}
                        </div>
                        <div className="agp-hero-info">
                            <div className="agp-name-row">
                                <h1 className="agp-name">{agent.name}</h1>
                                {isVerified && <Tag color="blue">Verified Agent</Tag>}
                            </div>
                            {agent.specialization && (
                                <p className="agp-specialization">
                                    <Briefcase size={14} /> {agent.specialization}
                                </p>
                            )}
                            {agent.company && (
                                <p className="agp-company">
                                    <Building2 size={14} /> {agent.company}
                                </p>
                            )}
                            {agent.location && (
                                <p className="agp-location">
                                    <MapPin size={14} /> {agent.location}
                                </p>
                            )}
                            <div className="agp-contacts">
                                {agent.phone && (
                                    <a href={`tel:${agent.phone}`} className="agp-contact-btn">
                                        <Phone size={15} /> {agent.phone}
                                    </a>
                                )}
                                {agent.email && (
                                    <a href={`mailto:${agent.email}`} className="agp-contact-btn agp-contact-secondary">
                                        <Mail size={15} /> {agent.email}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio */}
            {agent.bio && (
                <div className="agp-container">
                    <div className="agp-bio-section">
                        <h2 className="agp-section-title">About</h2>
                        <p className="agp-bio">{agent.bio}</p>
                    </div>
                </div>
            )}

            {/* Listings */}
            <div className="agp-container agp-listings-section">
                <div className="agp-listings-header">
                    <h2 className="agp-section-title">
                        Properties by {agent.name.split(' ')[0]}
                        {!propsLoading && (
                            <span className="agp-count">{properties.length}</span>
                        )}
                    </h2>
                </div>

                {propsLoading ? (
                    <div style={{ padding: '40px 0', textAlign: 'center' }}>
                        <Spin />
                    </div>
                ) : properties.length === 0 ? (
                    <div className="agp-no-props">
                        <Building2 size={40} color="#d1d5db" />
                        <p>No properties listed yet.</p>
                    </div>
                ) : (
                    <Row gutter={[28, 28]}>
                        {properties.map(prop => (
                            <Col xs={24} sm={12} lg={8} key={prop.id}>
                                <PropertyCard property={prop} />
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
}

export default AgentPublicProfile;
