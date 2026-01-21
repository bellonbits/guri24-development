import api from './api';

export const adminApi = {
    // Dashboard
    getDashboardStats: async () => {
        return api.get('/analytics/dashboard');
    },

    getTrafficData: async (period = '7d') => {
        return api.get(`/analytics/traffic?period=${period}`);
    },

    getTopProperties: async () => {
        return api.get(`/analytics/top-properties`);
    },

    getViewsByCategory: async () => {
        return api.get('/analytics/views-by-category');
    },

    getRecentActivity: async () => {
        return api.get('/analytics/recent-activity');
    },

    getRecentBookings: async (limit = 5) => {
        return api.get(`/bookings?limit=${limit}`);
    },

    // Properties
    getProperties: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/properties?${queryString}`);
    },

    getProperty: async (slug) => {
        return api.get(`/properties/${slug}`);
    },

    getPropertyById: async (id) => {
        return api.get(`/properties/id/${id}`);
    },

    createProperty: async (data) => {
        return api.post('/admin/properties', data);
    },

    updateProperty: async (id, data) => {
        return api.put(`/admin/properties/${id}`, data);
    },

    deleteProperty: async (id) => {
        return api.delete(`/admin/properties/${id}`);
    },

    updatePropertyStatus: async (propertyId, status) => {
        return api.patch(`/admin/properties/${propertyId}/status?status=${status}`);
    },

    // Users
    getUsers: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/admin/users?${queryString}`);
    },

    getUserById: async (userId) => {
        return api.get(`/admin/users/${userId}`);
    },

    createUser: async (data) => {
        return api.post(`/admin/users`, data);
    },

    updateUser: async (userId, data) => {
        return api.put(`/admin/users/${userId}`, data);
    },

    deleteUser: async (userId) => {
        return api.delete(`/admin/users/${userId}`);
    },

    updateUserRole: async (userId, role) => {
        return api.patch(`/admin/users/${userId}/role?role=${role}`);
    },

    // Agent Management
    getPendingAgents: async () => {
        return api.get('/admin/agents/pending');
    },

    verifyAgent: async (userId) => {
        return api.post(`/admin/agents/${userId}/verify`);
    },

    rejectAgent: async (userId) => {
        return api.post(`/admin/agents/${userId}/reject`);
    },

    updateAgentStatus: async (userId, status) => {
        return api.patch(`/admin/agents/${userId}/status?status=${status}`);
    },

    getAgentPerformance: async (userId) => {
        return api.get(`/admin/agents/${userId}/performance`);
    },

    // Admin Impersonation
    impersonateUser: async (userId) => {
        return api.post(`/admin/impersonate/${userId}`);
    },

    // Inquiry Management
    getInquiries: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/admin/inquiries?${queryString}`);
    },

    updateInquiryStatus: async (inquiryId, status) => {
        return api.patch(`/admin/inquiries/${inquiryId}/status?status=${status}`);
    },

    reassignInquiry: async (inquiryId, newAgentId) => {
        return api.patch(`/admin/inquiries/${inquiryId}/reassign?new_agent_id=${newAgentId}`);
    },

    // System
    getSystemHealth: async () => {
        return api.get('/admin/system/health');
    },

    pingAdmin: async () => {
        return api.get('/admin/ping');
    }
};

export default adminApi;
