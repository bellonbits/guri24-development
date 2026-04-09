import React, { useState } from 'react';
import { Layout, Button, Space, Drawer } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
    Home,
    Info,
    ShoppingBag,
    Building,
    Hotel,
    List as ListIcon,
    Plus,
    User,
    Phone,
    Menu as MenuIcon,
    X,
    LayoutDashboard,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import './GuriNav.css';

const { Header } = Layout;

const GuriNav = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const isAdmin = ['admin', 'super_admin'].includes(user?.role);
    const isAgent = ['agent', 'admin', 'super_admin'].includes(user?.role);
    const [mobileVisible, setMobileVisible] = useState(false);
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language === 'so' ? 'so' : 'en';

    const toggleLanguage = () => {
        const next = currentLang === 'en' ? 'so' : 'en';
        i18n.changeLanguage(next);
        localStorage.setItem('guri24_lang', next);
    };

    const navItems = [
        { label: t('nav.home'), icon: <Home size={18} />, path: '/' },
        { label: t('nav.about'), icon: <Info size={18} />, path: '/about' },
        { label: t('nav.buy'), icon: <ShoppingBag size={18} />, path: '/buy' },
        { label: t('nav.rent'), icon: <Building size={18} />, path: '/rent' },
        { label: t('nav.stays'), icon: <Hotel size={18} />, path: '/stays' },
        { label: t('nav.listings'), icon: <ListIcon size={18} />, path: '/listings' },
    ];

    return (
        <Header className="guri-nav sticky top-0 z-[1000] w-full">
            <div className="container flex items-center justify-between" style={{ height: '68px' }}>
                {/* Left: Logo */}
                <Link to="/" className="flex items-center">
                    <img
                        src="https://guri24.com/logo.png"
                        alt="Guri24"
                        className="h-12 object-contain"
                        onError={(e) => { e.target.src = '/logo.png'; }}
                    />
                </Link>

                {/* Center: Main Nav (desktop only) */}
                <div className="desktop-nav-main">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className="nav-link"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Right: Actions (desktop only) */}
                <div className="desktop-nav-actions">
                    <Button
                        type="primary"
                        shape="round"
                        icon={<Plus size={16} />}
                        className="list-property-btn"
                        onClick={() => {
                            if (isAdmin) navigate('/admin/properties/create');
                            else if (isAgent) navigate('/agent/properties/add');
                            else navigate('/sell');
                        }}
                    >
                        {t('nav.list_property')}
                    </Button>

                    <Space size="middle" align="center">
                        <button
                            type="button"
                            className="nav-lang-picker"
                            onClick={toggleLanguage}
                            aria-label="Switch language"
                        >
                            <span className={currentLang === 'en' ? 'lang-primary' : 'lang-secondary'}>EN</span>
                            <span className="lang-divider">|</span>
                            <span className={currentLang === 'so' ? 'lang-primary' : 'lang-secondary'}>SO</span>
                        </button>

                        <div className="nav-phone">
                            <Phone size={16} />
                            <span>+254 706 070 747</span>
                        </div>
                    </Space>

                    {isAdmin && (
                        <Button
                            shape="round"
                            icon={<ShieldCheck size={16} />}
                            className="nav-portal-btn admin-portal-btn"
                            onClick={() => navigate('/admin')}
                        >
                            Admin
                        </Button>
                    )}
                    {isAgent && !isAdmin && (
                        <Button
                            shape="round"
                            icon={<LayoutDashboard size={16} />}
                            className="nav-portal-btn agent-portal-btn"
                            onClick={() => navigate('/agent')}
                        >
                            Agent
                        </Button>
                    )}

                    <Button
                        type="primary"
                        shape="round"
                        icon={<User size={18} />}
                        className="nav-auth-btn"
                        onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
                    >
                        {isAuthenticated ? t('nav.my_profile') : t('nav.login')}
                    </Button>
                </div>

                {/* Lang toggle — always visible on mobile, hidden on desktop */}
                <button
                    type="button"
                    className="mobile-lang-btn"
                    onClick={toggleLanguage}
                    aria-label="Switch language"
                >
                    <span className={currentLang === 'en' ? 'lang-primary' : 'lang-secondary'}>EN</span>
                    <span className="lang-divider">|</span>
                    <span className={currentLang === 'so' ? 'lang-primary' : 'lang-secondary'}>SO</span>
                </button>

                {/* Mobile Menu Toggle */}
                <Button
                    type="text"
                    className="mobile-nav-toggle"
                    icon={<MenuIcon size={24} />}
                    onClick={() => setMobileVisible(true)}
                />

                {/* Mobile Drawer */}
                <Drawer
                    title={
                        <img src="https://guri24.com/logo.png" alt="Guri24" className="h-9" onError={(e) => { e.target.src = '/logo.png'; }} />
                    }
                    closeIcon={<X size={20} />}
                    placement="right"
                    onClose={() => setMobileVisible(false)}
                    open={mobileVisible}
                    size={300}
                >
                    <div className="flex flex-col gap-5">
                        {navItems.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileVisible(false)}
                                className="nav-link text-lg"
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                        <div className="h-px bg-gray-100 my-2" />
                        <Button
                            type="primary"
                            block
                            shape="round"
                            size="large"
                            className="list-property-btn"
                            onClick={() => {
                                setMobileVisible(false);
                                if (isAdmin) navigate('/admin/properties/create');
                                else if (isAgent) navigate('/agent/properties/add');
                                else navigate('/sell');
                            }}
                        >
                            {t('nav.list_property')}
                        </Button>
                        <Button
                            block
                            shape="round"
                            size="large"
                            className="nav-auth-btn"
                            onClick={() => { setMobileVisible(false); navigate(isAuthenticated ? '/profile' : '/login'); }}
                        >
                            {isAuthenticated ? t('nav.my_profile') : t('nav.login')}
                        </Button>
                        {isAdmin && (
                            <Button
                                block
                                shape="round"
                                size="large"
                                className="nav-portal-btn admin-portal-btn"
                                icon={<ShieldCheck size={16} />}
                                onClick={() => { setMobileVisible(false); navigate('/admin'); }}
                            >
                                {t('nav.admin_portal')}
                            </Button>
                        )}
                        {isAgent && !isAdmin && (
                            <Button
                                block
                                shape="round"
                                size="large"
                                className="nav-portal-btn agent-portal-btn"
                                icon={<LayoutDashboard size={16} />}
                                onClick={() => { setMobileVisible(false); navigate('/agent'); }}
                            >
                                {t('nav.agent')}
                            </Button>
                        )}
                        {/* Lang toggle in drawer */}
                        <button
                            type="button"
                            className="nav-lang-picker drawer-lang-btn"
                            onClick={toggleLanguage}
                            aria-label="Switch language"
                        >
                            <span className={currentLang === 'en' ? 'lang-primary' : 'lang-secondary'}>EN</span>
                            <span className="lang-divider">|</span>
                            <span className={currentLang === 'so' ? 'lang-primary' : 'lang-secondary'}>SO</span>
                        </button>
                    </div>
                </Drawer>
            </div>
        </Header>
    );
};

export default GuriNav;
