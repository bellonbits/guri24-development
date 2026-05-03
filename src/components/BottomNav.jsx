import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusCircle, Users, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './BottomNav.css';

const BottomNav = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Do not show on admin routes
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    const handleListProperty = () => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/agent/properties/add');
            return;
        }
        navigate('/agent/properties/add');
    };

    return (
        <nav className="bottom-nav">
            <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Home size={22} />
                <span className="bottom-nav-label">Home</span>
            </NavLink>

            <NavLink to="/listings" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Search size={22} />
                <span className="bottom-nav-label">Explore</span>
            </NavLink>

            <div className="bottom-nav-list-btn" onClick={handleListProperty}>
                <div className="list-btn-circle">
                    <PlusCircle size={24} strokeWidth={2.5} />
                </div>
                <span className="list-btn-label">List</span>
            </div>

            <NavLink to="/about" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Users size={22} />
                <span className="bottom-nav-label">Agents</span>
            </NavLink>

            <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <User size={22} />
                <span className="bottom-nav-label">{isAuthenticated ? 'Profile' : 'Login'}</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
