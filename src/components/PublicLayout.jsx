import { Outlet, useLocation } from 'react-router-dom';
import Header from './GuriNav';
import Footer from './Footer';
import CompareWidget from './CompareWidget';
import BottomNav from './BottomNav';

const PublicLayout = () => {
    const location = useLocation();
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isAuthRoute = authRoutes.includes(location.pathname);

    const isHomePage = location.pathname === '/';
    const isAboutPage = location.pathname === '/about';
    const isListingsPage = ['/listings', '/buy', '/sell', '/rent', '/stays'].includes(location.pathname);
    const hasHero = isHomePage || isAboutPage || isListingsPage;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {!isAuthRoute && <Header />}
            <main 
                className={!hasHero ? 'main-with-padding' : ''}
                style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    minHeight: 0,
                    paddingTop: isAuthRoute ? '0' : 'calc(64px + var(--sat))'
                }}
            >
                <Outlet />
            </main>
            {!isAuthRoute && <CompareWidget />}
            {!isAuthRoute && <Footer />}
            {!isAuthRoute && <BottomNav />}
        </div>
    );
};

export default PublicLayout;
