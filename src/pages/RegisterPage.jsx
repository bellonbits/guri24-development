import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: '',
        is_agent_request: searchParams.get('mode') === 'agent',
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
            message.error(t('register.passwords_mismatch'));
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
            if (is_agent_request) {
                localStorage.setItem('pending_agent_application', '1');
            }
            message.success(t('register.account_created'));
            navigate('/verify-email');
        } else {
            message.error(result.error || t('register.registration_failed'));
        }
    };

    const features = [
        { icon: <Shield size={24} />, title: t('register.feature_protection'), desc: t('register.feature_protection_desc') },
        { icon: <TrendingUp size={24} />, title: t('register.feature_insights'), desc: t('register.feature_insights_desc') },
        { icon: <Building2 size={24} />, title: t('register.feature_portfolio'), desc: t('register.feature_portfolio_desc') }
    ];

    return (
        <div className="register-page">
            <Row className="w-full">
                {/* Left Side: Form */}
                <Col xs={24} lg={12} className="register-form-container">
                    <div className="register-logo-link">
                        <Link to="/">
                            <img src="https://guri24.com/logo.png" alt="Guri24" className="register-logo" onError={(e) => { e.target.src = '/logo.png'; }} />
                        </Link>
                    </div>

                    <div className="register-form-main">
                        <div className="mb-8">
                            <Title level={1} className="register-title">{t('register.title')}</Title>
                            <Paragraph className="register-subtitle">
                                {t('register.subtitle')}
                            </Paragraph>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="register-input-group">
                                <AntText className="register-input-label">{t('register.full_name_label')}</AntText>
                                <Input
                                    size="large"
                                    name="name"
                                    placeholder={t('register.full_name_placeholder')}
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="register-input-field"
                                    prefix={<User size={18} className="text-gray-400 mr-2" />}
                                />
                            </div>

                            <div className="register-input-group">
                                <AntText className="register-input-label">{t('register.email_label')}</AntText>
                                <Input
                                    size="large"
                                    type="email"
                                    name="email"
                                    placeholder={t('register.email_placeholder')}
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="register-input-field"
                                    prefix={<Mail size={18} className="text-gray-400 mr-2" />}
                                />
                            </div>

                            <div className="register-input-group">
                                <AntText className="register-input-label">{t('register.phone_label')}</AntText>
                                <Input
                                    size="large"
                                    name="phone"
                                    placeholder={t('register.phone_placeholder')}
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="register-input-field"
                                    prefix={<Smartphone size={18} className="text-gray-400 mr-2" />}
                                />
                            </div>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <div className="register-input-group">
                                        <AntText className="register-input-label">{t('register.password_label')}</AntText>
                                        <Input.Password
                                            size="large"
                                            name="password"
                                            placeholder={t('register.password_placeholder')}
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="register-input-field"
                                            prefix={<Lock size={18} className="text-gray-400 mr-2" />}
                                        />
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div className="register-input-group">
                                        <AntText className="register-input-label">{t('register.confirm_password_label')}</AntText>
                                        <Input.Password
                                            size="large"
                                            name="confirm_password"
                                            placeholder={t('register.confirm_password_placeholder')}
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
                                        <span className="agent-switch-title">{t('register.apply_agent_title')}</span>
                                        <span className="agent-switch-desc">{t('register.apply_agent_desc')}</span>
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
                                {t('register.get_started')}
                            </Button>
                        </form>

                        <div className="register-login-prompt">
                            {t('register.have_account')} {' '}
                            <Link to="/login" className="register-login-link">{t('register.sign_in')}</Link>
                        </div>
                    </div>
                </Col>

                {/* Right Side: Showcase */}
                <Col xs={0} lg={12} className="register-showcase">
                    <div className="register-showcase-bg" />
                    <div className="register-showcase-content">
                        <Title level={2} style={{ color: '#fff', fontSize: '48px', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-1.5px' }}>
                            {t('register.showcase_title')}
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
                            {t('register.copyright')}
                        </AntText>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default RegisterPage;
