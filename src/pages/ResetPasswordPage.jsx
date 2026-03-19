import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Lock, CheckCircle } from 'lucide-react';
import { Input, Button } from 'antd';

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { resetPassword } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters'); return; }

        setLoading(true);
        setError('');
        const result = await resetPassword(token, password);
        setLoading(false);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } else {
            setError(result.error || 'Reset failed. Please try again.');
        }
    };

    const pageStyle = {
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', position: 'relative',
        overflow: 'hidden', background: '#0a1f3d', padding: '24px',
    };

    const bgImg = {
        position: 'absolute', inset: 0,
        backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')",
        backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3,
    };

    const overlay = {
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(10,30,60,0.65) 0%, rgba(10,30,60,0.45) 50%, rgba(10,30,60,0.8) 100%)',
    };

    const card = {
        background: '#fff', borderRadius: '28px', padding: '48px 44px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)', width: '100%', maxWidth: '460px',
    };

    if (!token) {
        return (
            <div style={pageStyle}>
                <div style={bgImg} />
                <div style={overlay} />
                <div style={{ ...card, position: 'relative', zIndex: 10, textAlign: 'center' }}>
                    <div style={{
                        padding: '12px 16px', background: '#fef2f2',
                        borderLeft: '4px solid #ef4444', borderRadius: '8px',
                        color: '#dc2626', fontSize: '14px', fontWeight: 500, marginBottom: '24px',
                    }}>
                        Invalid or missing reset token.
                    </div>
                    <Link to="/forgot-password">
                        <Button type="primary" size="large" style={{ background: '#1a5f9e', borderColor: '#1a5f9e', fontWeight: 700 }}>
                            Request New Link
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={bgImg} />
            <div style={overlay} />

            <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '460px' }}>
                <div style={card}>
                    {!success ? (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                                    Set New Password
                                </h1>
                                <p style={{ color: '#6b7280', fontSize: '14px' }}>Enter your new password below.</p>
                            </div>

                            {error && (
                                <div style={{
                                    padding: '12px 16px', background: '#fef2f2',
                                    borderLeft: '4px solid #ef4444', borderRadius: '8px',
                                    color: '#dc2626', fontSize: '14px', fontWeight: 500, marginBottom: '20px',
                                }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#111', display: 'block', marginBottom: '8px' }}>
                                        New Password
                                    </label>
                                    <Input.Password
                                        size="large"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimum 8 characters"
                                        prefix={<Lock size={18} color="#9ca3af" />}
                                        required
                                        style={{ height: '54px', borderRadius: '12px', background: '#f9fafb', fontSize: '15px' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#111', display: 'block', marginBottom: '8px' }}>
                                        Confirm Password
                                    </label>
                                    <Input.Password
                                        size="large"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat password"
                                        prefix={<Lock size={18} color="#9ca3af" />}
                                        required
                                        style={{ height: '54px', borderRadius: '12px', background: '#f9fafb', fontSize: '15px' }}
                                    />
                                </div>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    block
                                    loading={loading}
                                    style={{
                                        height: '54px', borderRadius: '12px',
                                        background: '#1a5f9e', borderColor: '#1a5f9e',
                                        fontWeight: 700, fontSize: '15px',
                                        boxShadow: '0 8px 20px rgba(26,95,158,0.25)',
                                    }}
                                >
                                    Reset Password
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 96, height: 96, background: '#f0fdf4',
                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 24px',
                            }}>
                                <CheckCircle size={48} color="#22c55e" />
                            </div>
                            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111', marginBottom: '8px' }}>
                                Password Reset!
                            </h3>
                            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>
                                Your password has been updated. Redirecting to login...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
