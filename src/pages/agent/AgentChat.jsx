import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { propertyApi } from '../../utils/propertyApi';
import { getProfileImageUrl } from '../../utils/imageUtils';
import { Search, Send, MessageSquare, ArrowLeft, Home } from 'lucide-react';
import { Spin } from 'antd';
import './AgentChat.css';

const AgentChat = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const location = useLocation();

    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileView, setMobileView] = useState('list');
    const [pendingChat, setPendingChat] = useState(null);

    const messagesEndRef = useRef(null);

    useEffect(() => { fetchConversations(); }, []);

    useEffect(() => {
        if (location.state?.guestId && !loading) {
            const existing = conversations.find(c =>
                c.tenant_id === location.state.guestId &&
                c.property_id === location.state.propertyId
            );
            if (existing) {
                handleSelectChat(existing);
            } else {
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

    useEffect(() => {
        if (!socket) return;
        const handleNewMessage = (msg) => {
            if (selectedChat && msg.conversation_id === selectedChat.id) {
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                scrollToBottom();
            }
            setConversations(prev => {
                const index = prev.findIndex(c => c.id === msg.conversation_id);
                if (index !== -1) {
                    const updated = { ...prev[index], last_message: msg, updated_at: msg.created_at };
                    const newList = [...prev];
                    newList.splice(index, 1);
                    return [updated, ...newList];
                }
                fetchConversations();
                return prev;
            });
        };
        socket.on('new_message', handleNewMessage);
        return () => socket.off('new_message', handleNewMessage);
    }, [socket, selectedChat]);

    const fetchConversations = async () => {
        try {
            const data = await propertyApi.getConversations();
            setConversations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load chats', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (chatId) => {
        try {
            const data = await propertyApi.getMessages(chatId);
            setMessages(Array.isArray(data) ? data : []);
            scrollToBottom();
        } catch (err) {
            console.error('Failed to load messages', err);
        }
    };

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        setPendingChat(null);
        setMessages([]);
        fetchMessages(chat.id);
        setMobileView('chat');
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || sending) return;
        const text = inputText.trim();
        setInputText('');
        setSending(true);
        try {
            if (pendingChat) {
                const res = await propertyApi.agentInitiateChat({
                    tenant_id: pendingChat.guestId,
                    property_id: pendingChat.propertyId,
                    initial_message: text
                });
                setConversations(prev => [res, ...prev]);
                setSelectedChat(res);
                setMessages(res.last_message ? [res.last_message] : []);
                setPendingChat(null);
            } else if (selectedChat) {
                const msg = await propertyApi.sendMessage(selectedChat.id, text);
                setMessages(prev => [...prev, msg]);
                scrollToBottom();
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
            console.error('Failed to send', err);
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    const filteredConvs = conversations.filter(c =>
        (c.other_party_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.property_title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeName = selectedChat ? selectedChat.other_party_name : pendingChat?.guestName;
    const activeProperty = selectedChat ? selectedChat.property_title : pendingChat?.propertyTitle;

    return (
        <div className="ac-container">

            {/* LEFT: Conversation List */}
            <div className={`ac-sidebar ${mobileView === 'list' ? 'ac-mobile-visible' : ''}`}>
                <div className="ac-sidebar-head">
                    <h2 className="ac-sidebar-title">Messages</h2>
                    <div className="ac-search">
                        <Search size={16} className="ac-search-icon" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="ac-search-input"
                        />
                    </div>
                </div>

                <div className="ac-conv-list">
                    {loading ? (
                        <div className="ac-state-center">
                            <Spin size="default" />
                        </div>
                    ) : filteredConvs.length === 0 ? (
                        <div className="ac-state-center">
                            <MessageSquare size={40} color="#d1d5db" />
                            <p>{searchTerm ? 'No results found' : 'No conversations yet'}</p>
                        </div>
                    ) : (
                        filteredConvs.map(chat => (
                            <div
                                key={chat.id}
                                className={`ac-conv-item ${selectedChat?.id === chat.id ? 'ac-conv-active' : ''}`}
                                onClick={() => handleSelectChat(chat)}
                            >
                                <div className="ac-conv-avatar">
                                    {getInitials(chat.other_party_name)}
                                </div>
                                <div className="ac-conv-info">
                                    <div className="ac-conv-row">
                                        <span className="ac-conv-name">{chat.other_party_name || 'Unknown'}</span>
                                        <span className="ac-conv-time">{formatDate(chat.updated_at || chat.created_at)}</span>
                                    </div>
                                    <p className="ac-conv-preview">{chat.last_message?.content || 'Start a conversation'}</p>
                                    <div className="ac-conv-property">
                                        <Home size={11} />
                                        <span>{chat.property_title || 'Property'}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT: Chat Window */}
            <div className={`ac-chat-window ${mobileView === 'chat' ? 'ac-mobile-visible' : ''}`}>
                {(selectedChat || pendingChat) ? (
                    <>
                        {/* Chat Header */}
                        <div className="ac-chat-head">
                            <button className="ac-back-btn" onClick={() => setMobileView('list')}>
                                <ArrowLeft size={20} />
                            </button>
                            <div className="ac-chat-head-avatar">
                                {getInitials(activeName)}
                            </div>
                            <div className="ac-chat-head-info">
                                <h3>{activeName || 'Guest'}</h3>
                                <span>
                                    <Home size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                    {activeProperty || 'Property'}
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="ac-messages">
                            {pendingChat && messages.length === 0 ? (
                                <div className="ac-empty-chat">
                                    <div className="ac-empty-icon">
                                        <MessageSquare size={36} color="#1a5f9e" />
                                    </div>
                                    <p>Start a conversation with <strong>{pendingChat.guestName}</strong></p>
                                    <span>about {pendingChat.propertyTitle}</span>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user?.id;
                                    const showTime = idx === messages.length - 1 ||
                                        messages[idx + 1]?.sender_id !== msg.sender_id;
                                    return (
                                        <div key={msg.id || idx} className={`ac-msg ${isMe ? 'ac-msg-me' : 'ac-msg-them'}`}>
                                            <div className="ac-msg-bubble">
                                                <p>{msg.content}</p>
                                            </div>
                                            {showTime && (
                                                <span className="ac-msg-time">{formatTime(msg.created_at)}</span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                            {sending && (
                                <div className="ac-msg ac-msg-me">
                                    <div className="ac-msg-bubble ac-typing">
                                        <span /><span /><span />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form className="ac-input-bar" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                className="ac-input"
                                placeholder="Type a message..."
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                disabled={sending}
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                className="ac-send-btn"
                                disabled={!inputText.trim() || sending}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="ac-no-chat">
                        <div className="ac-no-chat-icon">
                            <MessageSquare size={48} color="#1a5f9e" />
                        </div>
                        <h3>Your Messages</h3>
                        <p>Select a conversation from the left to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentChat;
