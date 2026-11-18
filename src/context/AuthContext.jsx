import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import analytics from '../utils/analytics';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('guri24_user');
        if (storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch {
                localStorage.removeItem('guri24_user');
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(false);

    // Check for existing auth on mount and setup interceptors
    useEffect(() => {
        const storedUser = localStorage.getItem('guri24_user');

        const checkAuth = async () => {
            if (!storedUser) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get('/users/me');
                setUser(response);
                localStorage.setItem('guri24_user', JSON.stringify(response));
            } catch {
                // Retain cached user if present
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Setup axios interceptor for 401s
        const interceptorId = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    const isLoginRequest = error.config.url.includes('/auth/login');
                    if (!isLoginRequest) {
                        console.warn('Unauthorized request detected, keeping cached session.');
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(interceptorId);
        };
    }, []);

    const login = async (email, password) => {
        try {
            const formData = { email, password };
            const response = await api.post('/auth/login', formData);

            setUser(response);
            localStorage.setItem('guri24_user', JSON.stringify(response));

            analytics.trackLogin('email');
            if (response.id) {
                analytics.identifyUser(response.id, {
                    email: response.email,
                    name: response.name,
                    role: response.role
                });
            }

            return { success: true, user: response };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/auth/register', userData);
            analytics.trackSignup('email');
            return { success: true, message: "Please check your email to verify your account." };
        } catch (error) {
            console.error('Registration error:', error);
            const detail = error.response?.data?.detail;
            const msg = Array.isArray(detail)
                ? detail.map(d => d.msg || d).join(', ')
                : detail || error.message || 'Registration failed';
            return { success: false, error: msg };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            localStorage.removeItem('guri24_user');
            analytics.trackAction('logout');
            analytics.reset();
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            setUser(null);
            localStorage.removeItem('guri24_user');
            return { success: false };
        }
    };

    const verifyEmail = async (token) => {
        try {
            await api.post('/auth/verify-email', { token });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Verification failed' };
        }
    };

    const resendVerification = async (email) => {
        try {
            await api.post('/auth/resend-verification', { email });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to resend verification' };
        }
    };

    const forgotPassword = async (email) => {
        try {
            await api.post('/auth/forgot-password', { email });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Request failed' };
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            await api.post('/auth/reset-password', { token, new_password: newPassword });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Reset failed' };
        }
    };

    const updateProfile = async (userData) => {
        try {
            const response = await api.put('/users/me', userData);
            setUser(response);
            localStorage.setItem('guri24_user', JSON.stringify(response));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Update failed' };
        }
    };

    const refreshUser = async () => {
        try {
            const response = await api.get(`/users/me?t=${Date.now()}`);
            setUser(response);
            return response;
        } catch (error) {
            console.error('Refresh user error:', error);
            return null;
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const value = {
        user,
        loading,
        updateUser,
        refreshUser,
        login,
        register,
        logout,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        updateProfile,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
