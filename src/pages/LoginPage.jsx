import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Input, Button, Space, Divider, message } from 'antd';
import {
    Mail,
    Lock,
    ArrowRight,
    ShieldCheck,
    Star,
    Zap,
    Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const { Title, Text: AntText, Paragraph } = Typography;

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        if (result.success) {
            message.success('Welcome back to Guri24!');
            navigate('/profile');
        } else {
            message.error(result.error || 'Failed to login. Please check your credentials.');
        }
    };

    const benefits = [
        { icon: <ShieldCheck size={20} />, title: "Verified Listings", desc: "Access high-quality, pre-verified property listings." },
        { icon: <Zap size={20} />, title: "Real-time Alerts", desc: "Get notified instantly about new property matches." },
        { icon: <Users size={20} />, title: "Agent Connect", desc: "Direct communication with top-rated local agents." },
        { icon: <Star size={20} />, title: "Exclusive Offers", desc: "Unlock premium deals available only to Guri24 members." }
    ];

    return (
        <div className="login-page">
            <Row className="w-full">
                {/* Left Side: Form */}
                <Col xs={24} lg={12} className="login-form-container">
                    {/* Minimal Logo Header */}
                    <div className="login-logo-link">
                        <Link to="/">
                            <img src="https://guri24.com/logo.png" alt="Guri24" className="login-logo" onError={(e) => { e.target.src = '/logo.png'; }} />
                        </Link>
                    </div>

                    <div className="login-form-main">
                        <div className="login-header-section">
                            <Title level={1} className="login-title">
                                Welcome Back
                            </Title>
                            <Paragraph className="login-subtitle">
                                Sign in to manage your property journey and access exclusive listings.
                            </Paragraph>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="login-input-group">
                                <AntText className="login-input-label">Email Address</AntText>
                                <Input
                                    size="large"
                                    placeholder="Enter your email"
                                    prefix={<Mail size={20} className="mr-2 text-gray-400" />}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="login-input-field"
                                />
                            </div>
                            <div className="login-input-group">
                                <div className="flex justify-between items-center pr-1 mb-2">
                                    <AntText className="login-input-label ml-0">Password</AntText>
                                    <Link to="/forgot-password" size="small" className="login-forgot-link">
                                        Forgot Password?
                                    </Link>
                                </div>
                                <Input.Password
                                    size="large"
                                    placeholder="Enter your password"
                                    prefix={<Lock size={20} className="mr-2 text-gray-400" />}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="login-input-field"
                                />
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                block
                                htmlType="submit"
                                loading={loading}
                                icon={!loading && <ArrowRight size={20} />}
                                iconPlacement="end"
                                className="login-submit-btn"
                            >
                                Sign In
                            </Button>
                        </form>

                        <div className="login-signup-prompt">
                            Don't have an account? {' '}
                            <Link to="/register" className="login-signup-link">
                                Sign up for free
                            </Link>
                        </div>

                        <Divider className="my-10 border-gray-100">
                            <AntText className="login-divider-text">Or continue with</AntText>
                        </Divider>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Button block size="large" className="social-auth-btn">
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-[18px]" />
                                    Google
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button block size="large" className="social-auth-btn">
                                    <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="h-[18px]" />
                                    Facebook
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Col>

                {/* Right Side: Showcase */}
                <Col xs={0} lg={12} className="login-showcase">
                    <div className="showcase-bg-image" />
                    <div className="showcase-content">
                        <Title level={2} className="showcase-title">
                            Find your <span>dream home</span> with Guri24.
                        </Title>
                        <Paragraph className="showcase-desc">
                            Experience a seamless property search with personalized tools designed for the modern lifestyle.
                        </Paragraph>
                        <div className="benefits-grid">
                            {benefits.map((item, idx) => (
                                <div key={idx} className="benefit-card">
                                    <div className="benefit-icon-box">
                                        {item.icon}
                                    </div>
                                    <Title level={5}>{item.title}</Title>
                                    <AntText>{item.desc}</AntText>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="showcase-footer">
                        <AntText>© Guri24 Real Estate</AntText>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default LoginPage;
