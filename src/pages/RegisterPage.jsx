import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Input, Button, message, Switch } from 'antd';
import {
    Mail,
    Lock,
    User,
    ArrowRight,
    Shield,
    Smartphone,
    TrendingUp,
    Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';

const { Title, Text: AntText, Paragraph } = Typography;

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: '',
        is_agent_request: false,
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            message.error('Passwords do not match.');
            return;
        }
        setLoading(true);
        const { confirm_password, is_agent_request, ...rest } = formData;
        const payload = {
            ...rest,
            requested_role: is_agent_request ? 'agent' : 'user',
        };
        const result = await register(payload);
        setLoading(false);
        if (result.success) {
            message.success('Account created! Please check your email to verify.');
            navigate('/verify-email');
        } else {
            message.error(result.error || 'Registration failed. Please try again.');
        }
    };

    const features = [
        { icon: <Shield size={24} />, title: 'Smart Protection', desc: 'Secure data encryption and verified transactions.' },
        { icon: <TrendingUp size={24} />, title: 'Market Insights', desc: 'Real-time property value tracking and analytics.' },
        { icon: <Building2 size={24} />, title: 'Premium Portfolio', desc: 'Exclusive access to off-market luxury listings.' }
    ];

    return (
        <div className="register-page">
            <Row className="w-full">
                {/* Left Side: Form */}
                <Col xs={24} lg={12} className="register-form-container">
                    <div className="register-logo-link">
                        <Link to="/">
                            <img src="https://guri24.com/logo.png" alt="Guri24" className="register-logo" />
                        </Link>
                    </div>

                    <div className="register-form-main">
                        <div className="mb-8">
                            <Title level={1} className="register-title">Create Account</Title>
                            <Paragraph className="register-subtitle">
                                Join Guri24 to find your next home or start your investment career.
                            </Paragraph>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="register-input-group">
                                <AntText className="register-input-label">Full Name</AntText>
                                <Input
                                    size="large"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="register-input-field"
                                    prefix={<User size={18} className="text-gray-400 mr-2" />}
                                />
                            </div>

                            <div className="register-input-group">
                                <AntText className="register-input-label">Email Address</AntText>
                                <Input
                                    size="large"
                                    type="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="register-input-field"
                                    prefix={<Mail size={18} className="text-gray-400 mr-2" />}
                                />
                            </div>

                            <div className="register-input-group">
                                <AntText className="register-input-label">Phone Number</AntText>
                                <Input
                                    size="large"
                                    name="phone"
                                    placeholder="+254 7..."
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="register-input-field"
                                    prefix={<Smartphone size={18} className="text-gray-400 mr-2" />}
                                />
                            </div>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <div className="register-input-group">
                                        <AntText className="register-input-label">Password</AntText>
                                        <Input.Password
                                            size="large"
                                            name="password"
                                            placeholder="Min. 8 characters"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="register-input-field"
                                            prefix={<Lock size={18} className="text-gray-400 mr-2" />}
                                        />
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div className="register-input-group">
                                        <AntText className="register-input-label">Confirm Password</AntText>
                                        <Input.Password
                                            size="large"
                                            name="confirm_password"
                                            placeholder="Repeat password"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                            className="register-input-field"
                                            prefix={<Lock size={18} className="text-gray-400 mr-2" />}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <div className="agent-apply-box">
                                <div className="agent-apply-switch">
                                    <div className="agent-switch-label">
                                        <span className="agent-switch-title">Apply as an Agent</span>
                                        <span className="agent-switch-desc">List properties and grow your business with us.</span>
                                    </div>
                                    <Switch
                                        checked={formData.is_agent_request}
                                        onChange={(checked) => setFormData(p => ({ ...p, is_agent_request: checked }))}
                                        style={{ background: formData.is_agent_request ? 'var(--primary)' : 'var(--gray-300)' }}
                                    />
                                </div>
                            </div>

                            <Button
                                type="primary"
                                size="large"
                                block
                                htmlType="submit"
                                loading={loading}
                                icon={!loading && <ArrowRight size={20} />}
                                className="register-submit-btn"
                            >
                                Get Started
                            </Button>
                        </form>

                        <div className="register-login-prompt">
                            Already have an account? {' '}
                            <Link to="/login" className="register-login-link">Sign In</Link>
                        </div>
                    </div>
                </Col>

                {/* Right Side: Showcase */}
                <Col xs={0} lg={12} className="register-showcase">
                    <div className="register-showcase-bg" />
                    <div className="register-showcase-content">
                        <Title level={2} style={{ color: '#fff', fontSize: '48px', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-1.5px' }}>
                            Start your journey <br />
                            with the <span style={{ color: '#7eb8f7' }}>#1 Platform</span>.
                        </Title>

                        <div className="register-feature-list">
                            {features.map((feature, i) => (
                                <div key={i} className="register-feature-item">
                                    <div className="register-feature-icon">
                                        {feature.icon}
                                    </div>
                                    <div className="register-feature-text">
                                        <h4>{feature.title}</h4>
                                        <p>{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="register-showcase-footer">
                        <AntText style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            © Guri24 Real Estate
                        </AntText>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default RegisterPage;
