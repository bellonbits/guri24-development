import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Typography, Input, Button, message } from 'antd';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const { Title, Text: AntText } = Typography;

function ForgotPasswordPage() {
    const { t } = useTranslation();
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const result = await forgotPassword(email);
        setLoading(false);
        if (result.success) {
            setSubmitted(true);
        } else {
            setError(result.error);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: '#0a1f3d',
            padding: '24px',
        }}>
            {/* Background */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.35,
            }} />
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(10,30,60,0.65) 0%, rgba(10,30,60,0.45) 50%, rgba(10,30,60,0.8) 100%)',
            }} />

            {/* Card */}
            <div style={{
                width: '100%',
                maxWidth: '460px',
                position: 'relative',
                zIndex: 10,
                background: '#fff',
                borderRadius: '28px',
                padding: '48px 44px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link to="/">
                        <img src="https://guri24.com/logo.png" alt="Guri24" style={{ height: '44px', objectFit: 'contain', margin: '0 auto' }} onError={(e) => { e.target.src = '/logo.png'; }} />
                    </Link>
                </div>

                {!submitted ? (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <Title level={2} style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px', color: '#111' }}>
                                {t('forgot_password.title')}
                            </Title>
                            <AntText style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>
                                {t('forgot_password.subtitle')}
                            </AntText>
                        </div>

                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                background: '#fef2f2',
                                borderLeft: '4px solid #ef4444',
                                borderRadius: '8px',
                                color: '#dc2626',
                                fontSize: '14px',
                                fontWeight: 500,
                                marginBottom: '20px',
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <AntText style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#111', display: 'block', marginBottom: '8px' }}>
                                    {t('forgot_password.email_label')}
                                </AntText>
                                <Input
                                    size="large"
                                    type="email"
                                    placeholder={t('forgot_password.email_placeholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    prefix={<Mail size={18} color="#9ca3af" />}
                                    required
                                    style={{
                                        height: '54px',
                                        borderRadius: '12px',
                                        background: '#f9fafb',
                                        fontSize: '15px',
                                    }}
                                />
                            </div>

                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={loading}
                                icon={!loading && <Mail size={18} />}
                                style={{
                                    height: '54px',
                                    borderRadius: '12px',
                                    background: '#1a5f9e',
                                    borderColor: '#1a5f9e',
                                    fontWeight: 700,
                                    fontSize: '15px',
                                    marginTop: '8px',
                                    boxShadow: '0 8px 20px rgba(26,95,158,0.25)',
                                }}
                            >
                                {t('forgot_password.send_link')}
                            </Button>
                        </form>

                        <Link to="/login" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '6px', marginTop: '24px',
                            color: '#6b7280', fontWeight: 600, fontSize: '14px',
                        }}>
                            <ArrowLeft size={16} />
                            {t('forgot_password.back_to_login')}
                        </Link>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 80, height: 80, background: '#f0fdf4',
                            borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px',
                        }}>
                            <Mail size={36} color="#22c55e" />
                        </div>
                        <Title level={3} style={{ fontWeight: 800, marginBottom: '8px' }}>{t('forgot_password.check_inbox')}</Title>
                        <AntText style={{ color: '#6b7280', lineHeight: 1.6 }}>
                            {t('forgot_password.sent_link')} <strong style={{ color: '#111' }}>{email}</strong>.
                        </AntText>

                        <Button
                            size="large"
                            block
                            onClick={() => setSubmitted(false)}
                            style={{
                                height: '54px', borderRadius: '12px',
                                fontWeight: 700, marginTop: '32px',
                                borderColor: '#e5e7eb', color: '#374151',
                            }}
                        >
                            {t('forgot_password.resend_link')}
                        </Button>

                        <Link to="/login" style={{
                            display: 'block', marginTop: '16px',
                            color: '#1a5f9e', fontWeight: 700, fontSize: '14px',
                        }}>
                            {t('forgot_password.back_to_login')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
