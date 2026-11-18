import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React, { Suspense, lazy, useEffect, useLayoutEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/PublicLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import BuyPage from './pages/BuyPage';
import SellPage from './pages/SellPage';
import RentPage from './pages/RentPage';
import ListingsPage from './pages/ListingsPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ComparePage from './pages/ComparePage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import MyBookings from './pages/user/MyBookings';
import StaysPage from './pages/StaysPage';
import DocumentsPage from './pages/DocumentsPage';
import NotFoundPage from './pages/NotFoundPage';
import BookingConfirmPage from './pages/BookingConfirmPage';
import AgentPublicProfile from './pages/AgentPublicProfile';
import AgentApplicationPage from './pages/AgentApplicationPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import DeleteAccountPage from './pages/DeleteAccountPage';
import AdminRoute from './admin/components/AdminRoute';
import AgentRoute from './components/agent/AgentRoute';
import './index.css';
import './App.css';

// Lazy-load heavy Admin & Agent portals so initial public bundle stays small and fast
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminProperties = lazy(() => import('./admin/pages/AdminProperties'));
const AdminUsers = lazy(() => import('./admin/pages/AdminUsers'));
const AdminAnalytics = lazy(() => import('./admin/pages/AdminAnalytics'));
const AdminMonitoring = lazy(() => import('./admin/pages/AdminMonitoring'));
const AdminSettings = lazy(() => import('./admin/pages/AdminSettings'));
const AdminPropertyForm = lazy(() => import('./admin/pages/AdminPropertyForm'));
const AdminVerifications = lazy(() => import('./admin/pages/AdminVerifications'));
const AdminAgents = lazy(() => import('./admin/pages/AdminAgents'));
const AdminInquiries = lazy(() => import('./admin/pages/AdminInquiries'));
const AdminAgentProfile = lazy(() => import('./admin/pages/AdminAgentProfile'));

const AgentLayout = lazy(() => import('./components/agent/AgentLayout'));
const AgentDashboard = lazy(() => import('./pages/agent/AgentDashboard'));
const AgentListings = lazy(() => import('./pages/agent/AgentListings'));
const AgentPropertyForm = lazy(() => import('./pages/agent/AgentPropertyForm'));
const AgentProfile = lazy(() => import('./pages/agent/AgentProfile'));
const AgentChat = lazy(() => import('./pages/agent/AgentChat'));
const AgentBookingDetails = lazy(() => import('./pages/agent/AgentBookingDetails'));

// Scroll to top on route change + floating Scroll-Up button when scrolled down
function ScrollToTop() {
  const { pathname, search } = useLocation();
  const [showScrollUp, setShowScrollUp] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setShowScrollUp(y > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!showScrollUp) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        document.documentElement.scrollTo?.({ top: 0, behavior: 'smooth' });
      }}
      style={{
        position: 'fixed',
        right: '24px',
        bottom: '28px',
        zIndex: 1100,
        width: '46px',
        height: '46px',
        borderRadius: '9999px',
        backgroundColor: '#1a5f9e',
        color: '#ffffff',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 24px rgba(13, 59, 102, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.backgroundColor = '#0d3b66'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.backgroundColor = '#1a5f9e'; }}
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <ScrollToTop />
          <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f8fafc' }} />}>
            <Routes>
              {/* Public Routes with Header/Footer */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/buy" element={<BuyPage />} />
                <Route path="/sell" element={<SellPage />} />
                <Route path="/rent" element={<RentPage />} />
                <Route path="/stays" element={<StaysPage />} />
                <Route path="/listings" element={<ListingsPage />} />
                <Route path="/property/:slug" element={<PropertyDetailPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/delete-account" element={<DeleteAccountPage />} />
                <Route path="/agents/:id" element={<AgentPublicProfile />} />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Protected Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/documents"
                  element={
                    <ProtectedRoute>
                      <DocumentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking-confirmed"
                  element={
                    <ProtectedRoute>
                      <BookingConfirmPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/apply-agent"
                  element={
                    <ProtectedRoute>
                      <AgentApplicationPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Agent Platform Routes */}
              <Route
                path="/agent/*"
                element={
                  <AgentRoute>
                    <Routes>
                      <Route element={<AgentLayout />}>
                        <Route index element={<AgentDashboard />} />
                        <Route path="dashboard" element={<AgentDashboard />} />
                        <Route path="properties" element={<AgentListings />} />
                        <Route path="properties/add" element={<AgentPropertyForm />} />
                        <Route path="properties/edit/:id" element={<AgentPropertyForm />} />
                        <Route path="bookings/:id" element={<AgentBookingDetails />} />
                        <Route path="messages" element={<AgentChat />} />
                        <Route path="profile" element={<AgentProfile />} />
                      </Route>
                    </Routes>
                  </AgentRoute>
                }
              />

              {/* Admin Routes - Clean Layout */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <Routes>
                      <Route element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="properties" element={<AdminProperties />} />
                        <Route path="properties/create" element={<AdminPropertyForm />} />
                        <Route path="properties/edit/:id" element={<AdminPropertyForm />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="users/:id/profile" element={<AdminAgentProfile />} />
                        <Route path="agents" element={<AdminAgents />} />
                        <Route path="inquiries" element={<AdminInquiries />} />
                        <Route path="messages" element={<AgentChat />} />
                        <Route path="verifications" element={<AdminVerifications />} />
                        <Route path="monitoring" element={<AdminMonitoring />} />
                        <Route path="settings" element={<AdminSettings />} />
                      </Route>
                    </Routes>
                  </AdminRoute>
                }
              />
              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
