import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Loader2, ArrowRight, Mail } from 'lucide-react';
import { message } from 'antd';

function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const tokenFromUrl = searchParams.get('token');
    const { verifyEmail, resendVerification, user } = useAuth();
    const navigate = useNavigate();

    const [code, setCode] = useState(tokenFromUrl || '');
    const [status, setStatus] = useState('input'); // input, verifying, success, error
    const [errorMsg, setErrorMsg] = useState('');
    const [resending, setResending] = useState(false);

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        if (!code || code.length < 6) {
            setStatus('error');
            setErrorMsg('Please enter a valid 6-digit code.');
            return;
        }
        setStatus('verifying');
        const result = await verifyEmail(code);
        if (result.success) {
            setStatus('success');
        } else {
            setStatus('error');
            setErrorMsg(result.error || 'Verification failed. Please try again.');
        }
    };

    const handleResend = async () => {
        const email = user?.email;
        if (!email) {
            message.error('Could not determine your email. Please log in again.');
            return;
        }
        setResending(true);
        const result = await resendVerification(email);
        setResending(false);
        if (result.success) {
            message.success('Verification code resent! Check your inbox.');
        } else {
            message.error(result.error || 'Failed to resend. Please try again.');
        }
    };

    const card = {
        background: '#fff',
        borderRadius: '28px',
        padding: '48px 44px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        width: '100%',
        maxWidth: '460px',
    };

    const primaryBtn = {
        width: '100%', height: '54px',
        background: '#1a5f9e', border: 'none', borderRadius: '12px',
        color: '#fff', fontWeight: 700, fontSize: '15px',
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', position: 'relative',
            overflow: 'hidden', background: '#0a1f3d', padding: '24px',
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')",
                backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3,
            }} />
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(10,30,60,0.65) 0%, rgba(10,30,60,0.45) 50%, rgba(10,30,60,0.8) 100%)',
            }} />

            <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '460px' }}>
                <div style={card}>

                    {(status === 'input' || status === 'error') && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 80, height: 80, background: 'rgba(26,95,158,0.1)',
                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 24px',
                            }}>
                                <Mail size={40} color="#1a5f9e" />
                            </div>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                                Verify Your Email
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px', lineHeight: 1.6 }}>
                                Enter the 6-digit code sent to your email address.
                            </p>

                            <form onSubmit={handleVerify}>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    style={{
                                        width: '100%', textAlign: 'center',
                                        letterSpacing: '12px', fontSize: '32px', fontWeight: 800,
                                        background: '#f9fafb', border: '1.5px solid #e5e7eb',
                                        borderRadius: '12px', padding: '16px 12px',
                                        color: '#111', outline: 'none', marginBottom: '12px',
                                    }}
                                    required
                                />

                                {status === 'error' && (
                                    <div style={{
                                        padding: '12px 16px', background: '#fef2f2',
                                        borderLeft: '4px solid #ef4444', borderRadius: '8px',
                                        color: '#dc2626', fontSize: '14px', fontWeight: 500,
                                        marginBottom: '16px', textAlign: 'left',
                                    }}>
                                        {errorMsg}
                                    </div>
                                )}

                                <button type="submit" style={{ ...primaryBtn, marginBottom: '12px' }}>
                                    Verify Account
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resending}
                                    style={{
                                        width: '100%', padding: '10px', background: 'none',
                                        border: 'none', color: '#6b7280', fontWeight: 600,
                                        fontSize: '13px', cursor: resending ? 'not-allowed' : 'pointer',
                                        textTransform: 'uppercase', letterSpacing: '1px', opacity: resending ? 0.6 : 1,
                                    }}
                                >
                                    {resending ? 'Sending...' : 'Resend Code'}
                                </button>
                            </form>
                        </div>
                    )}

                    {status === 'verifying' && (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <Loader2 size={48} color="#1a5f9e" style={{ margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
                            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111', marginBottom: '8px' }}>Verifying...</h2>
                            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Checking your code...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 96, height: 96, background: '#f0fdf4',
                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 24px',
                            }}>
                                <CheckCircle size={56} color="#22c55e" />
                            </div>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111', marginBottom: '8px' }}>Success!</h2>
                            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px', lineHeight: 1.6 }}>
                                Your email has been verified. You can now sign in.
                            </p>
                            <button onClick={() => navigate('/login')} style={{ ...primaryBtn }}>
                                Continue to Login <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VerifyEmailPage;
