import api from './api';

export const chatApi = {
    // List all conversations
    getConversations: async () => {
        return api.get('/chat/conversations');
    },

    // List all inquiries
    getInquiries: async () => {
        return api.get('/inquiries');
    },

    // Get messages for a specific conversation
    getMessages: async (conversationId) => {
        return api.get(`/chat/conversations/${conversationId}/messages`);
    },

    // Start a new chat (or get existing)
    startChat: async (agentId, propertyId, initialMessage) => {
        return api.post('/chat/start', {
            agent_id: agentId,
            property_id: propertyId,
            initial_message: initialMessage
        });
    },

    // Send a message
    sendMessage: async (conversationId, content) => {
        return api.post(`/chat/conversations/${conversationId}/messages`, {
            content
        });
    },

    // Reply to an inquiry (converts to conversation)
    replyToInquiry: async (inquiryId, content) => {
        return api.post(`/chat/inquiries/${inquiryId}/reply`, {
            content
        });
    }
};

export default chatApi;
