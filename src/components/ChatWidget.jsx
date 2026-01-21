import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, MessageCircle } from 'lucide-react';
import { createInquiry } from '../utils/api';
import chatApi from '../utils/chatApi';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import './ChatWidget.css';

function ChatWidget({ propertyId, propertyTitle, agentName, agentId, externalOpen, setExternalOpen }) {
    const { user, isAuthenticated } = useAuth();
    const { socket, connected } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [conversation, setConversation] = useState(null);

    // Sync with external trigger
    useEffect(() => {
        if (externalOpen) {
            setIsOpen(true);
        }
    }, [externalOpen]);

    // Update parent when locally closed
    useEffect(() => {
        if (!isOpen && setExternalOpen) {
            setExternalOpen(false);
        }
    }, [isOpen, setExternalOpen]);

    const [showContactForm, setShowContactForm] = useState(false);
    const [contactInfo, setContactInfo] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const [messages, setMessages] = useState([
        { id: 'welcome', text: `Hello! I'm ${agentName || 'Guri24 Team'}. How can I help you with ${propertyTitle}?`, sender: 'agent', time: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Update contact info if user logs in/out
    useEffect(() => {
        if (user) {
            setContactInfo({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    // Listen for new messages via Socket.IO
    useEffect(() => {
        if (socket && conversation && isOpen) {
            const handleNewMessage = (msg) => {
                if (msg.conversation_id === conversation.id) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === msg.id)) return prev;
                        return [...prev, {
                            id: msg.id,
                            text: msg.content,
                            sender: msg.sender_id === user?.id ? 'user' : 'agent',
                            time: new Date(msg.created_at)
                        }];
                    });
                }
            };

            socket.on('new_message', handleNewMessage);
            return () => socket.off('new_message', handleNewMessage);
        }
    }, [socket, conversation, isOpen, user]);

    // Initial load of messages when conversation starts
    useEffect(() => {
        if (conversation && isOpen) {
            const fetchHistory = async () => {
                try {
                    const msgs = await chatApi.getMessages(conversation.id);
                    const widgetMsgs = msgs.map(m => ({
                        id: m.id,
                        text: m.content,
                        sender: m.sender_id === user?.id ? 'user' : 'agent',
                        time: new Date(m.created_at)
                    }));
                    setMessages(widgetMsgs);
                } catch (err) {
                    console.error("Failed to load message history", err);
                }
            };
            fetchHistory();
        }
    }, [conversation, isOpen, user]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // If not authenticated and we don't have contact info, show form
        if (!isAuthenticated && (!contactInfo.name || !contactInfo.email)) {
            setShowContactForm(true);
            return;
        }

        const msgContent = inputValue.trim();
        const tempId = `temp-${Date.now()}`;

        // Optimistic UI update
        const userMsg = { id: tempId, text: msgContent, sender: 'user', time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsSending(true);

        try {
            if (isAuthenticated) {
                if (!conversation) {
                    const conv = await chatApi.startChat(agentId, propertyId, msgContent);
                    setConversation(conv);
                } else {
                    await chatApi.sendMessage(conversation.id, msgContent);
                }
            } else {
                // Guest Inquiry Logic (Legacy behavior for anonymous)
                await createInquiry({
                    property_id: propertyId,
                    message: msgContent,
                    name: contactInfo.name,
                    email: contactInfo.email,
                    phone: contactInfo.phone
                });

                setTimeout(() => {
                    const replyMsg = {
                        id: `guest-reply-${Date.now()}`,
                        text: "Thanks for your message! I've received your inquiry and will get back to you shortly.",
                        sender: 'agent',
                        time: new Date()
                    };
                    setMessages(prev => [...prev, replyMsg]);
                }, 1000);
            }
        } catch (error) {
            console.error("Failed to send message", error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } finally {
            setIsSending(false);
        }
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        if (contactInfo.name && contactInfo.email) {
            setShowContactForm(false);
            if (inputValue) {
                handleSend(e);
            }
        }
    };

    if (!isOpen) {
        return (
            <button className="chat-launcher" onClick={() => setIsOpen(true)}>
                <MessageSquare size={20} />
                <span>Chat Now</span>
            </button>
        );
    }

    return (
        <div className="chat-widget">
            <div className="chat-header">
                <div className="agent-profile">
                    <div className="agent-avatar-small">
                        <User size={14} />
                    </div>
                    <div>
                        <h4>{agentName || 'Guri24 Agent'}</h4>
                        {isAuthenticated ? (
                            <span className={`status-indicator ${connected ? 'online' : ''}`}>
                                {connected ? 'Online' : 'Reconnecting...'}
                            </span>
                        ) : (
                            <span className="status-indicator online">
                                Ready to help
                            </span>
                        )}
                    </div>
                </div>
                <button className="close-chat" onClick={() => setIsOpen(false)}>
                    <X size={18} />
                </button>
            </div>

            {showContactForm ? (
                <div className="chat-contact-form">
                    <h5>Quick Contact</h5>
                    <form onSubmit={handleContactSubmit}>
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            value={contactInfo.name}
                            onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={contactInfo.email}
                            onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        />
                        <button type="submit" className="btn btn-primary btn-sm">Start Chat</button>
                    </form>
                </div>
            ) : (
                <>
                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                <div className="message-content">
                                    <p>{msg.text}</p>
                                    <span className="message-time">
                                        {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isSending && (
                            <div className="message agent typing">
                                <div className="typing-dots">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isSending}
                        />
                        <button type="submit" disabled={!inputValue.trim() || isSending}>
                            <Send size={16} />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}

export default ChatWidget;
