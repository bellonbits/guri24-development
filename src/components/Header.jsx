import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

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

        navigate('/apply-agent');
    };

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/buy', label: 'Buy' },
        { to: '/rent', label: 'Rent' },
        { to: '/stays', label: 'StayHub' },
        { to: '/listings', label: 'Listings' },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
                <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                        <div className="flex items-center justify-center w-9 h-9 bg-[#1a5f9e] rounded-xl text-white shadow-md transition-transform group-hover:scale-105">
                            <Building2 size={18} strokeWidth={2.5} />
                        </div>
                        <span className="text-[1.2rem] font-extrabold tracking-tight text-gray-900">Guri<span style={{color:'#1a5f9e'}}>24</span></span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navLinks.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`px-4 py-2 rounded-full text-[14px] font-semibold transition-all duration-200 ${
                                    isActive(to)
                                        ? 'text-[#1a5f9e] bg-blue-50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        {/* Language Switch */}
                        <div className="header-lang-switch border border-gray-200 rounded-full px-3 py-1.5 text-[11px] font-bold text-gray-400 tracking-widest cursor-pointer hover:border-gray-300 transition-colors select-none">
                            <span className="text-gray-800">EN</span>
                            <span className="mx-1 text-gray-300">|</span>
                            <span>SO</span>
                        </div>

                        {/* Phone */}
                        <a href="tel:+254706070747" className="header-phone flex items-center gap-2 text-gray-800 font-semibold text-[13px] hover:text-[#1a5f9e] transition-colors">
                            <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center text-[#1a5f9e]">
                                <Phone size={13} />
                            </div>
                            +254 706 070 747
                        </a>

                        {/* Buttons */}
                        <div className="header-action-btns flex items-center gap-2">
                            <Link
                                to="/login"
                                className="border border-gray-200 text-gray-700 px-5 py-2 rounded-full text-[13px] font-semibold hover:border-gray-400 hover:text-gray-900 transition-all"
                            >
                                Sign In
                            </Link>
                            <button
                                onClick={handleListProperty}
                                className="bg-[#1a5f9e] text-white px-5 py-2 rounded-full text-[13px] font-bold hover:bg-[#0d3b66] transition-all shadow-md shadow-blue-900/20"
                            >
                                List Property
                            </button>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-700"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {createPortal(
                <>
                    {mobileMenuOpen && (
                        <div
                            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                    )}
                    <div className={`fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#1a5f9e] rounded-lg flex items-center justify-center text-white">
                                    <Building2 size={16} strokeWidth={2.5} />
                                </div>
                                <span className="font-extrabold text-gray-900">Guri<span style={{color:'#1a5f9e'}}>24</span></span>
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <nav className="p-5 space-y-1">
                            {navLinks.map(({ to, label }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center px-4 py-3 rounded-xl text-[15px] font-semibold transition-all ${
                                        isActive(to)
                                            ? 'bg-blue-50 text-[#1a5f9e]'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>
                        <div className="px-5 pt-2 pb-6 border-t border-gray-100 space-y-3 mt-2">
                            <Link
                                to="/login"
                                className="block w-full border border-gray-200 text-gray-700 px-6 py-3 rounded-full text-center font-semibold text-[14px] hover:border-gray-400 transition-all"
                            >
                                Sign In
                            </Link>
                            <button
                                onClick={handleListProperty}
                                className="block w-full bg-[#1a5f9e] text-white px-6 py-3 rounded-full text-center font-bold text-[14px] hover:bg-[#0d3b66] transition-all"
                            >
                                List Property
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
