import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
            message.success(t('login.welcome_message'));
            const pendingAgent = localStorage.getItem('pending_agent_application');
            if (pendingAgent) {
                localStorage.removeItem('pending_agent_application');
                navigate('/apply-agent');
            } else {
                navigate('/profile');
            }
        } else {
            message.error(result.error || t('login.login_failed'));
        }
    };

    const benefits = [
        { icon: <ShieldCheck size={20} />, title: t('login.benefit_verified'), desc: t('login.benefit_verified_desc') },
        { icon: <Zap size={20} />, title: t('login.benefit_alerts'), desc: t('login.benefit_alerts_desc') },
        { icon: <Users size={20} />, title: t('login.benefit_connect'), desc: t('login.benefit_connect_desc') },
        { icon: <Star size={20} />, title: t('login.benefit_offers'), desc: t('login.benefit_offers_desc') }
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
                                {t('login.title')}
                            </Title>
                            <Paragraph className="login-subtitle">
                                {t('login.subtitle')}
                            </Paragraph>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="login-input-group">
                                <AntText className="login-input-label">{t('login.email_label')}</AntText>
                                <Input
                                    size="large"
                                    placeholder={t('login.email_placeholder')}
                                    prefix={<Mail size={20} className="mr-2 text-gray-400" />}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="login-input-field"
                                />
                            </div>
                            <div className="login-input-group">
                                <div className="flex justify-between items-center pr-1 mb-2">
                                    <AntText className="login-input-label ml-0">{t('login.password_label')}</AntText>
                                    <Link to="/forgot-password" size="small" className="login-forgot-link">
                                        {t('login.forgot_password')}
                                    </Link>
                                </div>
                                <Input.Password
                                    size="large"
                                    placeholder={t('login.password_placeholder')}
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
                                {t('login.sign_in')}
                            </Button>
                        </form>

                        <div className="login-signup-prompt">
                            {t('login.no_account')} {' '}
                            <Link to="/register" className="login-signup-link">
                                {t('login.sign_up_free')}
                            </Link>
                            <br />
                            {t('login.want_to_list')} {' '}
                            <Link to="/register?mode=agent" className="login-signup-link mt-2 inline-block">
                                {t('login.register_as_agent')}
                            </Link>
                        </div>


                    </div>
                </Col>

                {/* Right Side: Showcase */}
                <Col xs={0} lg={12} className="login-showcase">
                    <div className="showcase-bg-image" />
                    <div className="showcase-content">
                        <Title level={2} className="showcase-title">
                            {t('login.showcase_title')?.split('dream home').map((part, i, arr) => 
                                i === arr.length - 1 ? part : <span key={i}>{part}<span>dream home</span></span>
                            ) || 'Find your dream home with Guri24.'}
                        </Title>
                        <Paragraph className="showcase-desc">
                            {t('login.showcase_desc')}
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
                        <AntText>{t('login.copyright')}</AntText>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default LoginPage;
