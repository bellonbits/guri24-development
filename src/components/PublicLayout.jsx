import { Outlet, useLocation } from 'react-router-dom';
import Header from './GuriNav';
import Footer from './Footer';
import CompareWidget from './CompareWidget';
import BottomNav from './BottomNav';

const PublicLayout = () => {
    const location = useLocation();
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isAuthRoute = authRoutes.includes(location.pathname);

    return (
        <>
            {!isAuthRoute && <Header />}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Outlet />
            </main>
            {!isAuthRoute && <CompareWidget />}
            {!isAuthRoute && <Footer />}
            {!isAuthRoute && <BottomNav />}
        </>
    );
};

export default PublicLayout;
