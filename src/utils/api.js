import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://api.guri24.com:8002/api/v1',
    withCredentials: true, // Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        let message = error.message;

        if (error.response?.data?.detail) {
            const detail = error.response.data.detail;
            if (typeof detail === 'string') {
                message = detail;
            } else if (Array.isArray(detail)) {
                // Handle Pydantic validation errors
                message = detail.map(err => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(', ');
            } else {
                message = JSON.stringify(detail);
            }
        }

        if (error.response?.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            // We'll handle this in the AuthContext usually, or emit an event
        }

        return Promise.reject({ ...error, message });
    }
);

export const registerUser = async (userData) => {
    return api.post('/auth/register', userData);
};

export const saveProperty = async (propertyId) => {
    return api.post(`/users/me/saved/${propertyId}`);
};

export const unsaveProperty = async (propertyId) => {
    return api.delete(`/users/me/saved/${propertyId}`);
};

export const getSavedProperties = async () => {
    return api.get('/users/me/saved');
};

export const getUserStats = async () => {
    return api.get('/users/me/stats');
};

export const trackUserView = async (propertyId) => {
    return api.post(`/properties/${propertyId}/view`);
};

export const getProperties = async (params) => {
    return api.get('/properties', { params });
};

export const getPropertyBySlug = async (slug) => {
    return api.get(`/properties/${slug}`);
};

export const getPropertyById = async (id) => {
    return api.get(`/properties/id/${id}`);
};

export const createInquiry = async (inquiryData) => {
    return api.post('/inquiries', inquiryData);
};

export const requestAgent = async () => {
    return api.post('/users/me/request-agent');
};

export const getPublicAgents = async () => {
    return api.get('/users/agents');
};

export const getPublicAgentById = async (agentId) => {
    return api.get(`/users/agents/${agentId}`);
};

export const applyAgent = async (formData) => {
    return api.post('/users/me/apply-agent', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

// Analytics
export const getDashboardStats = async () => {
    return api.get('/analytics/dashboard');
};

export const getTrafficData = async () => {
    return api.get('/analytics/traffic');
};

export const getRecentActivity = async () => {
    return api.get('/analytics/recent-activity');
};

export default api;
