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
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './GuriNav.css';

const { Header } = Layout;

const GuriNav = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [mobileVisible, setMobileVisible] = useState(false);

    const navItems = [
        { label: 'Home', icon: <Home size={18} />, path: '/' },
        { label: 'About', icon: <Info size={18} />, path: '/about' },
        { label: 'Buy', icon: <ShoppingBag size={18} />, path: '/buy' },
        { label: 'Rent', icon: <Building size={18} />, path: '/rent' },
        { label: 'StayHub', icon: <Hotel size={18} />, path: '/stays' },
        { label: 'Listings', icon: <ListIcon size={18} />, path: '/listings' },
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
                    />
                </Link>

                {/* Center: Main Nav */}
                <div className="hidden lg:flex items-center flex-1 ml-10 gap-2">
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

                {/* Right: Actions & Utilities */}
                <div className="hidden lg:flex nav-actions">
                    <Button
                        type="primary"
                        shape="round"
                        icon={<Plus size={16} />}
                        className="list-property-btn"
                        onClick={() => navigate('/sell')}
                    >
                        List Property
                    </Button>

                    {/* Language & Phone */}
                    <Space size="middle" align="center">
                        <div className="nav-lang-picker">
                            <span className="lang-primary">EN</span>
                            <span className="lang-divider">|</span>
                            <span className="lang-secondary">SO</span>
                        </div>

                        <div className="nav-phone">
                            <Phone size={16} />
                            <span>+254 706 070 747</span>
                        </div>
                    </Space>

                    {/* Sign In / Profile */}
                    <Button
                        type="primary"
                        shape="round"
                        icon={<User size={18} />}
                        className="nav-auth-btn"
                        onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
                    >
                        {isAuthenticated ? 'Profile' : 'Sign In'}
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <Button
                    type="text"
                    className="lg:hidden"
                    icon={<MenuIcon size={24} />}
                    onClick={() => setMobileVisible(true)}
                />

                {/* Mobile Drawer */}
                <Drawer
                    title={
                        <img src="https://guri24.com/logo.png" alt="Guri24" className="h-9" />
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
                            onClick={() => { setMobileVisible(false); navigate('/sell'); }}
                        >
                            List Property
                        </Button>
                        <Button
                            block
                            shape="round"
                            size="large"
                            className="nav-auth-btn"
                            onClick={() => { setMobileVisible(false); navigate(isAuthenticated ? '/profile' : '/login'); }}
                        >
                            {isAuthenticated ? 'My Account' : 'Sign In'}
                        </Button>
                    </div>
                </Drawer>
            </div>
        </Header>
    );
};

export default GuriNav;
