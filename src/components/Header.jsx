import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, Phone, X, Home, Info, ShoppingBag, Tag, Building2, Hotel, List, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProfileImageUrl } from '../utils/imageUtils';
import { requestAgent } from '../utils/api';
import './Header.css';

import { createPortal } from 'react-dom';

import { useTranslation } from 'react-i18next';

function Header() {
    const { t, i18n } = useTranslation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    // Check if we are on the homepage
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const handleListProperty = async (e) => {
        if (e) e.preventDefault();

        if (!isAuthenticated) {
            navigate('/login?redirect=/listings');
            return;
        }

        if (user?.role === 'agent' || user?.role === 'admin' || user?.role === 'super_admin') {
            navigate('/agent/properties/add');
            return;
        }

        if (user?.agent_status === 'PENDING') {
            setMessage({ type: 'info', text: 'Your agent verification is already pending. Please wait for admin approval.' });
            setTimeout(() => setMessage(null), 5000);
            return;
        }

        try {
            setLoading(true);
            const response = await requestAgent();
            setMessage({ type: 'success', text: response.message || 'Agent request submitted successfully!' });
            // Optionally we would need to refresh user state here, but the message is enough for now
            // or we could trigger a re-fetch of user data if useAuth provides it
            setTimeout(() => setMessage(null), 8000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to submit agent request.' });
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <header className={`header ${scrolled ? 'scrolled' : ''} ${isHomePage ? 'is-home' : ''}`}>
                <div className="header-container">
                    {/* Logo */}
                    <Link to="/" className="logo">
                        <img src="/logo.png" alt="Guri24" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="nav-desktop">
                        <ul className="nav-list">
                            <li><Link to="/" className="nav-link">{t('nav.home', 'Home')}</Link></li>
                            <li><Link to="/about" className="nav-link">{t('nav.about', 'About')}</Link></li>
                            <li><Link to="/buy" className="nav-link">{t('nav.buy', 'Buy')}</Link></li>
                            <li><Link to="/rent" className="nav-link">{t('nav.rent', 'Rent')}</Link></li>
                            <li><Link to="/stays" className="nav-link">StayHub</Link></li>
                            <li><Link to="/listings" className="nav-link">Listings</Link></li>
                            <li className="list-property-item">
                                <button
                                    onClick={handleListProperty}
                                    className={`nav-link list-property-btn ${loading ? 'loading' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : t('nav.sell', 'List Property')}
                                </button>
                            </li>
                            {(user?.role === 'agent' || user?.role === 'admin' || user?.role === 'super_admin') && (
                                <li>
                                    <Link to={user.role === 'agent' ? "/agent" : "/admin"} className="nav-link">
                                        {user.role === 'agent' ? t('nav.agent', 'Agent Portal') : 'Admin'}
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </nav>

                    {/* Right Actions */}
                    <div className="header-actions">
                        <div className="lang-switcher">
                            <button
                                className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                                onClick={() => changeLanguage('en')}
                            >
                                EN
                            </button>
                            <span className="lang-divider">|</span>
                            <button
                                className={`lang-btn ${i18n.language === 'so' ? 'active' : ''}`}
                                onClick={() => changeLanguage('so')}
                            >
                                SO
                            </button>
                        </div>

                        <a href="tel:+254706070747" className="phone-link">
                            <Phone size={18} />
                            <span>+254 706 070 747</span>
                        </a>

                        {isAuthenticated ? (
                            <Link to="/profile" className="btn-visit user-btn">
                                <User size={18} />
                                <span>{user?.name || 'Profile'}</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="btn-visit">
                                <User size={18} />
                                {t('nav.login', 'Sign In')}
                            </Link>
                        )}
                    </div>

                    {/* Mobile Toggle (only visible on small screens) */}
                    <button
                        className={`mobile-toggle ${mobileMenuOpen ? 'open' : ''}`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay - Portal to Body */}
            {createPortal(
                <>
                    {mobileMenuOpen && (
                        <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)}></div>
                    )}
                    <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                        <div className="mobile-menu-header">
                            {isAuthenticated && user ? (
                                <div className="user-menu-trigger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                    <div className="user-avatar">
                                        {user.avatar_url ? (
                                            <img
                                                src={getProfileImageUrl(user.avatar_url)}
                                                alt={user.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <span className="user-name">{user.name?.split(' ')[0] || 'User'}</span>
                                </div>
                            ) : (
                                <span className="mobile-menu-title">Menu</span>
                            )}
                            <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="mobile-nav">
                            <Link to="/" className="mobile-link">
                                <Home size={20} />
                                <span>Home</span>
                            </Link>
                            <Link to="/about" className="mobile-link">
                                <Info size={20} />
                                <span>About</span>
                            </Link>
                            <Link to="/buy" className="mobile-link">
                                <ShoppingBag size={20} />
                                <span>Buy</span>
                            </Link>
                            <Link to="/sell" className="mobile-link">
                                <Tag size={20} />
                                <span>Sell</span>
                            </Link>
                            <Link to="/rent" className="mobile-link">
                                <Building2 size={20} />
                                <span>Rent</span>
                            </Link>
                            <Link to="/stays" className="mobile-link">
                                <Hotel size={20} />
                                <span>Stays</span>
                            </Link>
                            <Link to="/listings" className="mobile-link">
                                <List size={20} />
                                <span>Listings</span>
                            </Link>

                            <button
                                onClick={handleListProperty}
                                className={`mobile-link list-property-mobile ${loading ? 'loading' : ''}`}
                                disabled={loading}
                            >
                                <Tag size={20} />
                                <span>{loading ? 'Processing...' : 'List Property'}</span>
                            </button>

                            {(user?.role === 'agent' || user?.role === 'admin' || user?.role === 'super_admin') && (
                                <Link
                                    to={user.role === 'agent' ? "/agent" : "/admin"}
                                    className={`mobile-link ${user.role === 'agent' ? 'agent-link' : 'admin-link'}`}
                                >
                                    {user.role === 'agent' ? <Building2 size={20} /> : <Shield size={20} />}
                                    <span>{user.role === 'agent' ? 'Agent Portal' : 'Admin Dashboard'}</span>
                                </Link>
                            )}

                            <div className="mobile-divider"></div>

                            {isAuthenticated ? (
                                <Link to="/profile" className="mobile-link user-link">
                                    <User size={20} />
                                    <span>{user?.name || 'My Profile'}</span>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="mobile-link">
                                        <User size={20} />
                                        <span>Sign In</span>
                                    </Link>
                                    <Link to="/register" className="mobile-link primary">
                                        <User size={20} />
                                        <span>Sign Up</span>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </>,
                document.body
            )}

            {/* Notification Toast */}
            {message && (
                <div className={`header-notification ${message.type}`}>
                    <p>{message.text}</p>
                    <button onClick={() => setMessage(null)}><X size={16} /></button>
                </div>
            )}
        </>
    );
}

export default Header;
