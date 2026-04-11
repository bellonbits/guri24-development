import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusCircle, Users, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Do not show on admin routes
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    const handleListProperty = () => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/listings');
            return;
        }
        navigate('/agent/properties/add');
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl flex justify-around items-center border-t border-black/5 z-[1999] px-[10px] md:hidden dark:bg-black/90 dark:border-white/10" style={{ minHeight: '68px', paddingBottom: 'env(safe-area-inset-bottom)', paddingTop: '8px' }}>
            <NavLink
                to="/"
                className={({ isActive }) =>
                    `flex flex-col items-center justify-center no-underline flex-1 gap-1 transition-all duration-300 cursor-pointer ${isActive ? 'text-primary' : 'text-gray-500'}`
                }
            >
                {({ isActive }) => (
                    <>
                        <Home size={22} className={`transition-transform duration-300 ${isActive ? '-translate-y-0.5' : ''}`} />
                        <span className="text-[10px] font-semibold">Home</span>
                    </>
                )}
            </NavLink>

            <NavLink
                to="/listings"
                className={({ isActive }) =>
                    `flex flex-col items-center justify-center no-underline flex-1 gap-1 transition-all duration-300 cursor-pointer ${isActive ? 'text-primary' : 'text-gray-500'}`
                }
            >
                {({ isActive }) => (
                    <>
                        <Search size={22} className={`transition-transform duration-300 ${isActive ? '-translate-y-0.5' : ''}`} />
                        <span className="text-[10px] font-semibold">Explore</span>
                    </>
                )}
            </NavLink>

            <div
                className="flex flex-col items-center justify-center flex-1 gap-1 cursor-pointer relative"
                style={{ marginTop: '-22px' }}
                onClick={handleListProperty}
            >
                <div style={{
                    width: '52px',
                    height: '52px',
                    background: 'linear-gradient(135deg, #1a5f9e 0%, #0d3b66 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(26,95,158,0.45)',
                    border: '3px solid white',
                    transition: 'all 0.2s ease',
                }}>
                    <PlusCircle size={22} />
                </div>
                <span className="text-[10px] font-semibold" style={{ color: '#1a5f9e', marginTop: '2px' }}>List</span>
            </div>

            <NavLink
                to="/about"
                className={({ isActive }) =>
                    `flex flex-col items-center justify-center no-underline flex-1 gap-1 transition-all duration-300 cursor-pointer ${isActive ? 'text-primary' : 'text-gray-500'}`
                }
            >
                {({ isActive }) => (
                    <>
                        <Users size={22} className={`transition-transform duration-300 ${isActive ? '-translate-y-0.5' : ''}`} />
                        <span className="text-[10px] font-semibold">Agents</span>
                    </>
                )}
            </NavLink>

            <NavLink
                to="/profile"
                className={({ isActive }) =>
                    `flex flex-col items-center justify-center no-underline flex-1 gap-1 transition-all duration-300 cursor-pointer ${isActive ? 'text-primary' : 'text-gray-500'}`
                }
            >
                {({ isActive }) => (
                    <>
                        <User size={22} className={`transition-transform duration-300 ${isActive ? '-translate-y-0.5' : ''}`} />
                        <span className="text-[10px] font-semibold">{isAuthenticated ? 'Profile' : 'Login'}</span>
                    </>
                )}
            </NavLink>
        </nav>
    );
};

export default BottomNav;
