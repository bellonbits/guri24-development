import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

function formatKES(amount) {
    if (!amount && amount !== 0) return '—';
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function BookingConfirmPage() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const {
        propertyTitle = 'Property',
        checkIn = '—',
        checkOut = '—',
        guests = 1,
        total = 0,
        nights = 0,
    } = state || {};

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 16px',
            background: '#f9fafb',
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{
                    background: '#fff',
                    borderRadius: 20,
                    boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
                    padding: '48px 40px',
                    maxWidth: 480,
                    width: '100%',
                    textAlign: 'center',
                }}
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}
                    style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}
                >
                    <CheckCircle2 size={64} color="#10b981" strokeWidth={1.5} />
                </motion.div>

                {/* Heading */}
                <h1 style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#111827',
                    marginBottom: 8,
                }}>
                    Booking Confirmed!
                </h1>
                <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 32 }}>
                    Your stay has been successfully reserved.
                </p>

                {/* Summary card */}
                <div style={{
                    background: '#f3f4f6',
                    borderRadius: 12,
                    padding: '20px 24px',
                    textAlign: 'left',
                    marginBottom: 32,
                }}>
                    <SummaryRow label="Property" value={propertyTitle} />
                    <SummaryRow label="Check-in" value={checkIn} />
                    <SummaryRow label="Check-out" value={checkOut} />
                    <SummaryRow label="Guests" value={`${guests} guest${guests !== 1 ? 's' : ''}`} />
                    <SummaryRow label="Duration" value={`${nights} night${nights !== 1 ? 's' : ''}`} />
                    <div style={{
                        borderTop: '1px solid #d1d5db',
                        paddingTop: 12,
                        marginTop: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Total</span>
                        <span style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>{formatKES(total)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/my-bookings')}
                        style={{
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            padding: '12px 28px',
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#1d4ed8'}
                        onMouseOut={e => e.currentTarget.style.background = '#2563eb'}
                    >
                        View My Bookings
                    </button>
                    <button
                        onClick={() => navigate('/stays')}
                        style={{
                            background: '#fff',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: 10,
                            padding: '12px 28px',
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                        Browse more stays
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function SummaryRow({ label, value }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
        }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>{label}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#111827', textAlign: 'right', maxWidth: '60%' }}>
                {value}
            </span>
        </div>
    );
}

export default BookingConfirmPage;
