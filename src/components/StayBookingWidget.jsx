import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DatePicker, message, Spin } from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useAuth } from '../context/AuthContext';
import { createBooking, getPropertyAvailability } from '../utils/api';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

const CLEANING_FEE = 2000;
const SERVICE_FEE_RATE = 0.1;

function formatKES(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function StayBookingWidget({ propertyId, price, currency, title }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [dateRange, setDateRange] = useState([null, null]);
    const [guests, setGuests] = useState(1);
    const [bookedRanges, setBookedRanges] = useState([]);
    const [loadingAvailability, setLoadingAvailability] = useState(true);
    const [reserving, setReserving] = useState(false);
    const [error, setError] = useState('');

    const pricePerNight = Number(price) || 0;

    // Derived: nights & price breakdown
    const [checkIn, checkOut] = dateRange;
    const nights = checkIn && checkOut ? checkOut.diff(checkIn, 'day') : 0;
    const subtotal = pricePerNight * nights;
    const cleaningFee = nights > 0 ? CLEANING_FEE : 0;
    const serviceFee = nights > 0 ? Math.round(subtotal * SERVICE_FEE_RATE) : 0;
    const total = subtotal + cleaningFee + serviceFee;

    useEffect(() => {
        if (!propertyId) return;
        setLoadingAvailability(true);
        getPropertyAvailability(propertyId)
            .then((data) => {
                const ranges = Array.isArray(data) ? data : [];
                setBookedRanges(ranges);
            })
            .catch(() => setBookedRanges([]))
            .finally(() => setLoadingAvailability(false));
    }, [propertyId]);

    const disabledDate = (current) => {
        if (!current) return false;
        // Disable past dates
        if (current.isBefore(dayjs().startOf('day'))) return true;
        // Disable already-booked dates
        for (const range of bookedRanges) {
            const start = dayjs(range.check_in).startOf('day');
            const end = dayjs(range.check_out).endOf('day');
            if (current.isBetween(start, end, 'day', '[]')) return true;
        }
        return false;
    };

    const handleReserve = async () => {
        setError('');
        if (!checkIn || !checkOut) {
            setError('Please select check-in and check-out dates.');
            return;
        }
        if (!user) {
            navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
            return;
        }
        setReserving(true);
        try {
            const booking = await createBooking({
                property_id: propertyId,
                check_in: checkIn.toISOString(),
                check_out: checkOut.toISOString(),
                guest_count: guests,
            });
            message.success('Booking confirmed!');
            navigate('/booking-confirmed', {
                state: {
                    bookingId: booking?.id,
                    propertyTitle: title,
                    checkIn: checkIn.format('MMM D, YYYY'),
                    checkOut: checkOut.format('MMM D, YYYY'),
                    guests,
                    total,
                    nights,
                },
            });
        } catch (err) {
            setError(err?.message || 'Failed to create booking. Please try again.');
        } finally {
            setReserving(false);
        }
    };

    return (
        <>
            <style>{`
                .sbw-widget {
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.10);
                    position: sticky;
                    top: 88px;
                }
                .sbw-price-row {
                    display: flex;
                    align-items: baseline;
                    gap: 6px;
                    margin-bottom: 20px;
                }
                .sbw-price-amount {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                }
                .sbw-price-unit {
                    font-size: 14px;
                    color: #6b7280;
                }
                .sbw-datepicker {
                    width: 100%;
                    border-radius: 10px;
                    margin-bottom: 14px;
                }
                .sbw-guest-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border: 1px solid #d1d5db;
                    border-radius: 10px;
                    padding: 10px 14px;
                    margin-bottom: 18px;
                }
                .sbw-guest-label {
                    font-size: 14px;
                    color: #374151;
                    font-weight: 500;
                }
                .sbw-guest-controls {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .sbw-guest-btn {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: 1px solid #d1d5db;
                    background: #fff;
                    cursor: pointer;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #374151;
                    transition: background 0.15s;
                }
                .sbw-guest-btn:hover:not(:disabled) {
                    background: #f3f4f6;
                }
                .sbw-guest-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .sbw-guest-count {
                    font-size: 15px;
                    font-weight: 600;
                    min-width: 20px;
                    text-align: center;
                }
                .sbw-breakdown {
                    border-top: 1px solid #e5e7eb;
                    padding-top: 14px;
                    margin-bottom: 18px;
                }
                .sbw-breakdown-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 14px;
                    color: #374151;
                    margin-bottom: 8px;
                }
                .sbw-breakdown-row.total {
                    font-weight: 700;
                    font-size: 15px;
                    color: #111827;
                    border-top: 1px solid #e5e7eb;
                    padding-top: 10px;
                    margin-top: 4px;
                }
                .sbw-reserve-btn {
                    width: 100%;
                    background: #2563eb;
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    padding: 14px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .sbw-reserve-btn:hover:not(:disabled) {
                    background: #1d4ed8;
                }
                .sbw-reserve-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .sbw-error {
                    color: #ef4444;
                    font-size: 13px;
                    margin-top: 8px;
                    text-align: center;
                }
                .sbw-no-charge {
                    text-align: center;
                    font-size: 13px;
                    color: #6b7280;
                    margin-top: 10px;
                }
                .sbw-cancel-info {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: #059669;
                    margin-top: 12px;
                    background: #ecfdf5;
                    border-radius: 8px;
                    padding: 8px 12px;
                }
            `}</style>
            <motion.div
                className="sbw-widget"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                {/* Price per night */}
                <div className="sbw-price-row">
                    <span className="sbw-price-amount">{formatKES(pricePerNight)}</span>
                    <span className="sbw-price-unit">/ night</span>
                </div>

                {/* Date Picker */}
                {loadingAvailability ? (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <Spin size="small" />
                        <span style={{ marginLeft: 8, fontSize: 13, color: '#6b7280' }}>Loading availability…</span>
                    </div>
                ) : (
                    <RangePicker
                        className="sbw-datepicker"
                        placeholder={['Check-in', 'Check-out']}
                        disabledDate={disabledDate}
                        value={dateRange[0] ? dateRange : null}
                        onChange={(dates) => {
                            setDateRange(dates ? [dates[0], dates[1]] : [null, null]);
                            setError('');
                        }}
                        format="MMM D, YYYY"
                        size="large"
                        style={{ width: '100%' }}
                    />
                )}

                {/* Guest counter */}
                <div className="sbw-guest-row">
                    <span className="sbw-guest-label">Guests</span>
                    <div className="sbw-guest-controls">
                        <button
                            className="sbw-guest-btn"
                            onClick={() => setGuests(g => Math.max(1, g - 1))}
                            disabled={guests <= 1}
                        >
                            −
                        </button>
                        <span className="sbw-guest-count">{guests}</span>
                        <button
                            className="sbw-guest-btn"
                            onClick={() => setGuests(g => Math.min(16, g + 1))}
                            disabled={guests >= 16}
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Price breakdown (only when dates selected) */}
                {nights > 0 && (
                    <div className="sbw-breakdown">
                        <div className="sbw-breakdown-row">
                            <span>{formatKES(pricePerNight)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                            <span>{formatKES(subtotal)}</span>
                        </div>
                        <div className="sbw-breakdown-row">
                            <span>Cleaning fee</span>
                            <span>{formatKES(cleaningFee)}</span>
                        </div>
                        <div className="sbw-breakdown-row">
                            <span>Service fee</span>
                            <span>{formatKES(serviceFee)}</span>
                        </div>
                        <div className="sbw-breakdown-row total">
                            <span>Total</span>
                            <span>{formatKES(total)}</span>
                        </div>
                    </div>
                )}

                {/* Reserve button */}
                <button
                    className="sbw-reserve-btn"
                    onClick={handleReserve}
                    disabled={reserving}
                >
                    {reserving ? <Spin size="small" style={{ filter: 'brightness(10)' }} /> : null}
                    {reserving ? 'Reserving…' : 'Reserve'}
                </button>

                {/* Error */}
                {error && <div className="sbw-error">{error}</div>}

                {/* Supporting text */}
                <p className="sbw-no-charge">You won't be charged yet</p>
                <div className="sbw-cancel-info">
                    <span>✓</span>
                    <span>Free cancellation before check-in</span>
                </div>
            </motion.div>
        </>
    );
}

export default StayBookingWidget;
