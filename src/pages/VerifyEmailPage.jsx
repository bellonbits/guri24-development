import { useState, useEffect } from 'react';
import './VerifyEmailPage.css';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Loader2, ArrowRight, Mail } from 'lucide-react';
import { message, Input } from 'antd';

function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const tokenFromUrl = searchParams.get('token');
    const { verifyEmail, resendVerification, user } = useAuth();
    const navigate = useNavigate();

    const [targetEmail, setTargetEmail] = useState(
        searchParams.get('email') ||
        location.state?.email ||
        localStorage.getItem('pending_verification_email') ||
        user?.email ||
        ''
    );
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [code, setCode] = useState(tokenFromUrl || '');
    const [status, setStatus] = useState('input'); // input, verifying, success, error
    const [errorMsg, setErrorMsg] = useState('');
    const [resending, setResending] = useState(false);

    // Auto-verify if token is provided in the URL (e.g. clicked from email)
    useEffect(() => {
        if (tokenFromUrl && tokenFromUrl.length >= 6) {
            setCode(tokenFromUrl);
            const autoRun = async () => {
                setStatus('verifying');
                const result = await verifyEmail(tokenFromUrl);
                if (result.success) {
                    setStatus('success');
                    localStorage.removeItem('pending_verification_email');
                } else {
                    setStatus('error');
                    setErrorMsg(result.error || 'Verification link expired or invalid. Please request a new code.');
                }
            };
            autoRun();
        }
    }, [tokenFromUrl]);

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
            localStorage.removeItem('pending_verification_email');
        } else {
            setStatus('error');
            setErrorMsg(result.error || 'Verification failed. Please try again.');
        }
    };

    const handleResend = async () => {
        if (!targetEmail) {
            setShowEmailInput(true);
            message.warning('Please enter your email address to resend the code.');
            return;
        }
        setResending(true);
        const result = await resendVerification(targetEmail);
        setResending(false);
        if (result.success) {
            message.success('Verification code resent! Check your inbox.');
            setShowEmailInput(false);
        } else {
            message.error(result.error || 'Failed to resend. Please try again.');
        }
    };

    const card = {
        background: '#fff',
        borderRadius: '24px',
        padding: '44px 36px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: '460px',
    };

    const primaryBtn = {
        width: '100%', height: '52px',
        background: '#0c6759', border: 'none', borderRadius: '10px',
        color: '#fff', fontWeight: 700, fontSize: '15px',
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
        boxShadow: '0 4px 14px rgba(12, 103, 89, 0.25)',
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', position: 'relative',
            overflow: 'hidden', background: '#08332c', padding: '24px',
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')",
                backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2,
            }} />
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(8,51,44,0.7) 0%, rgba(8,51,44,0.85) 100%)',
            }} />

            <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '460px' }}>
                <div style={card}>

                    {(status === 'input' || status === 'error') && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 72, height: 72, background: 'rgba(12,103,89,0.1)',
                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 20px',
                            }}>
                                <Mail size={36} color="#0c6759" />
                            </div>
                            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', marginBottom: '6px', letterSpacing: '-0.5px' }}>
                                Verify Your Email
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
                                Enter the 6-digit code sent to
                                {targetEmail ? (
                                    <span style={{ display: 'block', fontWeight: 700, color: '#0c6759', marginTop: '2px' }}>
                                        {targetEmail}
                                    </span>
                                ) : (
                                    ' your email address.'
                                )}
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
                                        background: '#f8fafc', border: '1.5px solid #cbd5e1',
                                        borderRadius: '12px', padding: '14px 12px',
                                        color: '#0c6759', outline: 'none', marginBottom: '16px',
                                        fontFamily: 'monospace',
                                    }}
                                    required
                                />

                                {status === 'error' && (
                                    <div style={{
                                        padding: '12px 14px', background: '#fef2f2',
                                        borderLeft: '4px solid #ef4444', borderRadius: '8px',
                                        color: '#dc2626', fontSize: '13.5px', fontWeight: 500,
                                        marginBottom: '16px', textAlign: 'left',
                                    }}>
                                        {errorMsg}
                                    </div>
                                )}

                                <button type="submit" style={{ ...primaryBtn, marginBottom: '14px' }}>
                                    Verify Account
                                </button>

                                {showEmailInput ? (
                                    <div style={{ marginTop: '12px', textAlign: 'left' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                                            Confirm your email to resend:
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                            <Input
                                                size="middle"
                                                type="email"
                                                value={targetEmail}
                                                onChange={(e) => setTargetEmail(e.target.value)}
                                                placeholder="Enter your email"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleResend}
                                                disabled={resending}
                                                style={{
                                                    background: '#0c6759', color: '#fff', border: 'none',
                                                    borderRadius: '6px', padding: '0 16px', fontWeight: 600,
                                                    fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {resending ? 'Sending...' : 'Send'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resending}
                                        style={{
                                            width: '100%', padding: '8px', background: 'none',
                                            border: 'none', color: '#64748b', fontWeight: 600,
                                            fontSize: '13px', cursor: resending ? 'not-allowed' : 'pointer',
                                            textTransform: 'uppercase', letterSpacing: '0.8px', opacity: resending ? 0.6 : 1,
                                        }}
                                    >
                                        {resending ? 'Sending...' : 'Resend Code'}
                                    </button>
                                )}
                            </form>
                        </div>
                    )}

                    {status === 'verifying' && (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <Loader2 size={44} color="#0c6759" style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111', marginBottom: '6px' }}>Verifying...</h2>
                            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Checking your code...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 88, height: 88, background: '#f0fdf4',
                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 20px',
                            }}>
                                <CheckCircle size={52} color="#16a34a" />
                            </div>
                            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Verified!</h2>
                            <p style={{ color: '#64748b', fontSize: '14.5px', marginBottom: '28px', lineHeight: 1.6 }}>
                                Your email has been verified successfully. Your Guri24 account is now active and ready.
                            </p>
                            <button onClick={() => navigate('/login')} style={{ ...primaryBtn }}>
                                Continue to Sign In <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VerifyEmailPage;
