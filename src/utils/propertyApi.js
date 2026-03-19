import api from './api';

// Helper function to format price
export const formatPrice = (price, currency = 'KES') => {
    if (!price) return 'Price on request';
    return `${currency} ${price.toLocaleString()}`;
};

// Helper function to transform property data from API to component format
export const transformProperty = (property) => {
    // Handle features in multiple formats from backend
    let featuresArray = [];
    if (Array.isArray(property.features)) {
        featuresArray = property.features;
    } else if (property.features && typeof property.features === 'object') {
        const entries = Object.entries(property.features);
        if (entries.length > 0 && typeof entries[0][1] === 'boolean') {
            // Format: { "wifi": true, "pool": false } — use keys where value is true
            featuresArray = entries.filter(([, v]) => v === true).map(([k]) =>
                k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            );
        } else {
            // Format: { "0": "WiFi", "1": "Pool" } — use values
            featuresArray = Object.values(property.features);
        }
    }

    // Filter out empty / non-string entries
    const cleanFeatures = featuresArray.filter(f => f && typeof f === 'string' && f.trim() !== '');

    // Parse location string into object
    let locationObj = { city: 'Unknown', country: 'Kenya', area: '' };
    if (typeof property.location === 'string') {
        const parts = property.location.split(',').map(s => s.trim());
        if (parts.length >= 2) {
            locationObj = {
                city: parts[0],
                country: parts[1],
                area: parts[0] // Use city as area for now
            };
        } else if (parts.length === 1) {
            locationObj.city = parts[0];
            locationObj.area = parts[0];
        }
    } else if (typeof property.location === 'object' && property.location !== null) {
        locationObj = property.location;
    }

    return {
        ...property,
        slug: property.slug || `${property.title?.toLowerCase().replace(/\s+/g, '-')}-${property.id}`,
        images: property.images || [],
        location: locationObj,
        coordinates: property.latitude && property.longitude ? {
            lat: parseFloat(property.latitude),
            lng: parseFloat(property.longitude)
        } : null,
        currency: property.currency || 'KES',
        priceUnit: property.price_unit || property.priceUnit || '/ month',
        size: property.area_sqft ? `${property.area_sqft.toLocaleString()} sq ft` : (property.size || 'N/A'),
        features: cleanFeatures,
        agent: property.agent ? {
            ...property.agent,
            agent_status: property.agent.agent_status || 'pending',
            verification_documents: property.agent.verification_documents || []
        } : {
            name: 'Agent',
            email: '',
            phone: '',
            id: property.agent_id,
            agent_status: 'pending',
            verification_documents: []
        }
    };
};

export const propertyApi = {
    // Get all properties with optional filters
    getAllProperties: async (params = {}) => {
        return api.get('/properties', { params });
    },

    // Alias for getAllProperties (backward compatibility)
    getProperties: async (params = {}) => {
        return api.get('/properties', { params });
    },

    // Get properties by type
    getPropertiesByType: async (type, page = 1, pageSize = 20) => {
        return api.get('/properties', {
            params: { type, page, page_size: pageSize }
        });
    },

    // Get agent's own properties
    getAgentProperties: async (agentId) => {
        const params = agentId ? { agent_id: agentId } : {};
        return api.get('/properties', { params });
    },

    // Get strictly my properties (Authenticated user)
    getMyProperties: async (params = {}) => {
        return api.get('/properties/me', { params });
    },

    // Get single property by slug
    getPropertyBySlug: async (slug) => {
        return api.get(`/properties/${slug}`);
    },

    // Get single property by ID
    getPropertyById: async (id) => {
        return api.get(`/properties/id/${id}`);
    },

    // Create new property
    createProperty: async (propertyData) => {
        return api.post('/properties', propertyData);
    },

    async updateProfile(userData) {
        const response = await api.put('/users/me', userData);
        return response;
    },

    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('file', file);

        // We need to use axios directly or ensure api utility handles FormData correctly (it should if content-type is set, or let browser set it)
        // Usually axios sets it automatically if data is FormData
        const response = await api.post('/users/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response;
    },
    // Update property
    updateProperty: async (id, propertyData) => {
        return api.put(`/properties/${id}`, propertyData);
    },

    // Delete property
    deleteProperty: async (id) => {
        return api.delete(`/properties/${id}`);
    },

    // Verification Documents
    uploadVerificationDocument: async (name, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/users/me/verification-documents?name=${encodeURIComponent(name)}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    deleteVerificationDocument: async (documentId) => {
        return api.delete(`/users/me/verification-documents/${documentId}`);
    },

    // Create booking
    createBooking: async (bookingData) => {
        return api.post('/bookings', bookingData);
    },

    // Get my bookings (as a guest)
    getUserBookings: async () => {
        return api.get('/bookings/me');
    },

    // Get bookings received for my properties (as an agent)
    getAgentReceivedBookings: async () => {
        return api.get('/bookings/agent/received');
    },

    // Get Single Booking Details
    getBookingDetails: async (bookingId) => {
        return api.get(`/bookings/${bookingId}`);
    },

    // --- Chat / Messaging ---
    getConversations: async () => {
        return api.get('/chat/conversations');
    },

    getMessages: async (conversationId) => {
        return api.get(`/chat/conversations/${conversationId}/messages`);
    },

    startChat: async (startRequest) => { // { agent_id, property_id, initial_message }
        return api.post('/chat/start', startRequest);
    },

    sendMessage: async (conversationId, content) => {
        return api.post(`/chat/conversations/${conversationId}/messages`, { content });
    },

    agentInitiateChat: async (initiateRequest) => { // { tenant_id, property_id, initial_message }
        return api.post('/chat/agent/initiate', initiateRequest);
    }
};

export default propertyApi;
