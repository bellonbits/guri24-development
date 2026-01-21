import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { propertyApi } from '../../utils/propertyApi';
import { getProfileImageUrl } from '../../utils/imageUtils';
import { Search, Send, User, MoreVertical, MessageSquare, ArrowLeft } from 'lucide-react';
import './AgentChat.css';

const AgentChat = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const location = useLocation();

    // State
    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null); // The full conversation object
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'

    // Potential "New Chat" state if coming from Booking Details
    const [pendingChat, setPendingChat] = useState(null); // { guestId, propertyId, guestName, propertyTitle }

    const messagesEndRef = useRef(null);

    // 1. Fetch Conversations on Mount
    useEffect(() => {
        fetchConversations();
    }, []);

    // 2. Handle Navigation from Booking Details
    useEffect(() => {
        if (location.state?.guestId && !loading && conversations.length >= 0) {
            // Check if we already have a chat with this guest for this property
            const existing = conversations.find(c =>
                c.tenant_id === location.state.guestId &&
                c.property_id === location.state.propertyId
            );

            if (existing) {
                handleSelectChat(existing);
            } else {
                // Prepare "Pending" chat state
                setPendingChat({
                    guestId: location.state.guestId,
                    propertyId: location.state.propertyId,
                    guestName: location.state.guestName || 'Guest',
                    propertyTitle: location.state.propertyTitle || 'Property'
                });
                setMobileView('chat');
            }
        }
    }, [location.state, loading, conversations]);

    // 3. Socket Listener
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            // Update Message List if active
            if (selectedChat && msg.conversation_id === selectedChat.id) {
                setMessages(prev => {
                    // Check if message already exists (e.g. from local optimistic update)
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                scrollToBottom();
            }

            // Update Conversation List (Move to top, update snippet)
            setConversations(prev => {
                const index = prev.findIndex(c => c.id === msg.conversation_id);
                if (index !== -1) {
                    const updated = { ...prev[index], last_message: msg, updated_at: msg.created_at };
                    const newList = [...prev];
                    newList.splice(index, 1);
                    return [updated, ...newList]; // Move to top
                } else {
                    // New conversation? Fetch details? For now ignore or refresh
                    fetchConversations();
                    return prev;
                }
            });
        };

        socket.on('new_message', handleNewMessage);
        return () => socket.off('new_message', handleNewMessage);
    }, [socket, selectedChat]);

    const fetchConversations = async () => {
        try {
            const data = await propertyApi.getConversations();
            setConversations(data);
        } catch (err) {
            console.error("Failed to load chats", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (chatId) => {
        try {
            const data = await propertyApi.getMessages(chatId);
            setMessages(data);
            scrollToBottom();
        } catch (err) {
            console.error("Failed to load messages", err);
        }
    };

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        setPendingChat(null);
        fetchMessages(chat.id);
        setMobileView('chat');
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const text = inputText.trim();
        setInputText(''); // Clear input immediately

        try {
            if (pendingChat) {
                // Determine initial message
                // Use new endpoint
                const res = await propertyApi.agentInitiateChat({
                    tenant_id: pendingChat.guestId,
                    property_id: pendingChat.propertyId,
                    initial_message: text
                });

                // Now we have a real chat
                setConversations(prev => [res, ...prev]);
                setSelectedChat(res);
                setMessages([res.last_message]);
                setPendingChat(null);
            } else if (selectedChat) {
                const msg = await propertyApi.sendMessage(selectedChat.id, text);
                setMessages(prev => [...prev, msg]);
                scrollToBottom();

                // Update list locally to avoid jump
                setConversations(prev => {
                    const index = prev.findIndex(c => c.id === selectedChat.id);
                    if (index === -1) return prev;
                    const updated = { ...prev[index], last_message: msg, updated_at: msg.created_at };
                    const newList = [...prev];
                    newList.splice(index, 1);
                    return [updated, ...newList];
                });
            }
        } catch (err) {
            console.error("Failed to send", err);
            // Optionally restore input or show error
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    // Filter conversations
    const filteredConvs = conversations.filter(c =>
        c.other_party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.property_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="agent-chat-container">
            {/* Sidebar - Conversation List */}
            <div className={`chat-sidebar ${mobileView === 'list' ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <h2>Messages</h2>
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="conversations-list">
                    {loading ? (
                        <div className="loading-txt">Loading...</div>
                    ) : filteredConvs.length === 0 ? (
                        <div className="empty-txt">No conversations found</div>
                    ) : (
                        filteredConvs.map(chat => (
                            <div
                                key={chat.id}
                                className={`conversation-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                                onClick={() => handleSelectChat(chat)}
                            >
                                <div className="avatar">
                                    {chat.other_party_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="conv-info">
                                    <div className="conv-top">
                                        <span className="conv-name">{chat.other_party_name}</span>
                                        <span className="conv-time">
                                            {new Date(chat.updated_at || chat.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="conv-preview">{chat.last_message?.content || 'Start a conversation'}</p>
                                    <span className="conv-property">{chat.property_title}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`chat-window ${mobileView === 'chat' ? 'active' : ''}`}>
                {(selectedChat || pendingChat) ? (
                    <>
                        <div className="chat-header">
                            <button className="back-btn-mobile" onClick={() => setMobileView('list')}>
                                <ArrowLeft size={20} />
                            </button>
                            <div className="header-info">
                                <h3>{selectedChat ? selectedChat.other_party_name : pendingChat.guestName}</h3>
                                <span>{selectedChat ? selectedChat.property_title : pendingChat.propertyTitle}</span>
                            </div>
                        </div>

                        <div className="messages-area">
                            {(pendingChat && messages.length === 0) ? (
                                <div className="new-chat-start">
                                    <MessageSquare size={48} />
                                    <p>Start a new conversation with {pendingChat.guestName} about {pendingChat.propertyTitle}</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <div key={msg.id || idx} className={`message-bubble ${isMe ? 'me' : 'them'}`}>
                                            <div className="message-content">
                                                <p>{msg.content}</p>
                                                <span className="message-time">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="message-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <button type="submit" disabled={!inputText.trim()}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <MessageSquare size={64} />
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentChat;
