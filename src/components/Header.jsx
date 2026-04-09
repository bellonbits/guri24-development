import { useState, useEffect } from 'react';
import './Header.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Building2, LayoutDashboard, UserCircle, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language === 'so' ? 'so' : 'en';

    const isAgent = user?.role === 'agent';
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    const toggleLanguage = () => {
        const next = currentLang === 'en' ? 'so' : 'en';
        i18n.changeLanguage(next);
        localStorage.setItem('guri24_lang', next);
    };

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [mobileMenuOpen]);

    useEffect(() => { setMobileMenuOpen(false); }, [location]);

    const handleListProperty = (e) => {
        if (e) e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login?redirect=/agent/properties/add');
            return;
        }
        if (isAgent || isAdmin) {
            navigate('/agent/properties/add');
        } else {
            // Regular users must apply to become an agent first
            navigate('/apply-agent');
        }
    };

    const navLinks = [
        { to: '/', label: t('nav.home') },
        { to: '/about', label: t('nav.about') },
        { to: '/buy', label: t('nav.buy') },
        { to: '/rent', label: t('nav.rent') },
        { to: '/stays', label: t('nav.stays') },
        { to: '/listings', label: t('nav.listings') },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <>
            <header className={`header-root${scrolled ? ' header-scrolled' : ''}`}>
                <div className="header-inner">
                    {/* Logo */}
                    <Link to="/" className="header-logo">
                        <img src="/logo.png" alt="Guri24" className="header-logo-img" />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="header-nav">
                        {navLinks.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`header-nav-link${isActive(to) ? ' active' : ''}`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Lang toggle — direct flex child so it NEVER gets squeezed */}
                    <button type="button" onClick={toggleLanguage} className="header-lang" aria-label="Switch language">
                        <span className={currentLang === 'en' ? 'lang-active' : 'lang-inactive'}>EN</span>
                        <span className="lang-sep">|</span>
                        <span className={currentLang === 'so' ? 'lang-active' : 'lang-inactive'}>SO</span>
                    </button>

                    {/* Right side */}
                    <div className="header-right">
                        {/* Phone — hidden on small desktop */}
                        <a href="tel:+254706070747" className="header-phone">
                            <div className="header-phone-icon"><Phone size={13} /></div>
                            <span>+254 706 070 747</span>
                        </a>

                        {/* Auth-aware action buttons — hidden on mobile */}
                        <div className="header-actions">
                            {isAuthenticated ? (
                                <>
                                    {/* Portal button */}
                                    {isAdmin && (
                                        <Link to="/admin" className="btn-portal btn-admin">
                                            <LayoutDashboard size={14} />
                                            <span>{t('nav.admin_dashboard')}</span>
                                        </Link>
                                    )}
                                    {isAgent && (
                                        <button onClick={handleListProperty} className="btn-portal btn-agent">
                                            <Plus size={14} />
                                            <span>{t('nav.add_property')}</span>
                                        </button>
                                    )}
                                    {!isAgent && !isAdmin && (
                                        <button onClick={handleListProperty} className="btn-list-property">
                                            <Plus size={14} />
                                            <span>{t('nav.list_property')}</span>
                                        </button>
                                    )}
                                    {/* Profile */}
                                    <Link to={isAdmin ? '/admin' : isAgent ? '/agent/profile' : '/profile'} className="btn-profile">
                                        <div className="btn-profile-avatar">{avatarLetter}</div>
                                        <span className="btn-profile-name">{user?.name?.split(' ')[0]}</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="btn-signin">{t('nav.login')}</Link>
                                    <button onClick={handleListProperty} className="btn-list-property">
                                        <Plus size={14} />
                                        <span>{t('nav.list_property')}</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile toggle */}
                        <button
                            className="header-mobile-toggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            {createPortal(
                <>
                    {mobileMenuOpen && (
                        <div className="mobile-backdrop" onClick={() => setMobileMenuOpen(false)} />
                    )}
                    <div className={`mobile-drawer${mobileMenuOpen ? ' open' : ''}`}>
                        {/* Drawer header */}
                        <div className="mobile-drawer-header">
                            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="header-logo">
                                <img src="/logo.png" alt="Guri24" className="header-logo-img" />
                            </Link>
                            <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* User badge if logged in */}
                        {isAuthenticated && (
                            <div className="mobile-user-badge">
                                <div className="mobile-user-avatar">{avatarLetter}</div>
                                <div>
                                    <div className="mobile-user-name">{user?.name}</div>
                                    <div className="mobile-user-role">{user?.role || 'User'}</div>
                                </div>
                            </div>
                        )}

                        {/* Nav links */}
                        <nav className="mobile-nav">
                            {navLinks.map(({ to, label }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`mobile-nav-link${isActive(to) ? ' active' : ''}`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>

                        {/* Bottom actions */}
                        <div className="mobile-drawer-footer">
                            {isAuthenticated ? (
                                <>
                                    {isAdmin && (
                                        <Link to="/admin" className="mobile-btn mobile-btn-primary">
                                            <LayoutDashboard size={16} /> {t('nav.admin_portal')}
                                        </Link>
                                    )}
                                    {isAgent && (
                                        <button onClick={handleListProperty} className="mobile-btn mobile-btn-primary">
                                            <Plus size={16} /> {t('nav.add_property')}
                                        </button>
                                    )}
                                    {!isAgent && !isAdmin && (
                                        <button onClick={handleListProperty} className="mobile-btn mobile-btn-primary">
                                            <Plus size={16} /> {t('nav.list_property')}
                                        </button>
                                    )}
                                    <Link
                                        to={isAdmin ? '/admin' : isAgent ? '/agent/profile' : '/profile'}
                                        className="mobile-btn mobile-btn-outline"
                                    >
                                        <UserCircle size={16} /> {t('nav.my_profile')}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="mobile-btn mobile-btn-outline">{t('nav.login')}</Link>
                                    <button onClick={handleListProperty} className="mobile-btn mobile-btn-primary">
                                        <Plus size={16} /> {t('nav.list_property')}
                                    </button>
                                </>
                            )}
                            {/* Lang toggle in mobile */}
                            <button type="button" onClick={toggleLanguage} className="mobile-lang-toggle" aria-label="Switch language">
                                <span className={currentLang === 'en' ? 'lang-active' : 'lang-inactive'}>EN</span>
                                <span className="lang-sep">|</span>
                                <span className={currentLang === 'so' ? 'lang-active' : 'lang-inactive'}>SO</span>
                            </button>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </>
    );
}

export default Header;
