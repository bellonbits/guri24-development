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
        <nav className="fixed bottom-0 left-0 right-0 h-[65px] bg-white/90 backdrop-blur-xl flex justify-around items-center border-t border-black/5 z-[1999] px-[10px] pb-[env(safe-area-inset-bottom)] md:hidden dark:bg-black/90 dark:border-white/10">
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

            <div className="flex flex-col items-center justify-center no-underline flex-1 gap-1 transition-all duration-300 cursor-pointer relative -top-2.5 z-10" onClick={handleListProperty}>
                <div className="w-[50px] h-[50px] bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(26,95,158,0.4)] transition-all duration-300 border-4 border-white active:scale-90 active:shadow-[0_2px_8px_rgba(26,95,158,0.3)]">
                    <PlusCircle size={24} />
                </div>
                <span className="text-[10px] font-semibold relative top-1">List</span>
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
