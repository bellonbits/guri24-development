import React from 'react';
import { Phone, Mail, MessageSquare, X } from 'lucide-react';
import { getProfileImageUrl } from '../utils/imageUtils';
const HostContactModal = ({ isOpen, onClose, host, onStartChat }) => {
    if (!isOpen || !host) return null;

    return (
        <div className="host-modal-backdrop" onClick={onClose}>
            <div className="host-modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="host-profile-header">
                    <div className="host-avatar-container">
                        {host.avatar_url ? (
                            <img
                                src={getProfileImageUrl(host.avatar_url)}
                                alt={host.name}
                                className="host-avatar-img"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="host-avatar-placeholder">
                                {host.name?.charAt(0) || 'H'}
                            </div>
                        )}
                    </div>
                    <h2>{host.name}</h2>
                    <p className="host-subtitle">Property Host</p>
                </div>

                <div className="host-contact-options">
                    <a href={`tel:${host.phone}`} className="contact-link call">
                        <div className="contact-icon-box">
                            <Phone size={24} />
                        </div>
                        <div className="contact-info">
                            <label>Call Now</label>
                            <strong>{host.phone || 'N/A'}</strong>
                        </div>
                    </a>

                    <a href={`mailto:${host.email}`} className="contact-link email">
                        <div className="contact-icon-box">
                            <Mail size={24} />
                        </div>
                        <div className="contact-info">
                            <label>Email Host</label>
                            <strong>{host.email}</strong>
                        </div>
                    </a>

                    <button
                        className="contact-link chat-now"
                        onClick={onStartChat}
                    >
                        <div className="contact-icon-box">
                            <MessageSquare size={24} />
                        </div>
                        <div className="contact-info">
                            <label>Live Chat</label>
                            <strong>Start a Conversation</strong>
                        </div>
                    </button>
                </div>

                <div className="modal-footer">
                    <p>Host typically responds within a few hours.</p>
                </div>
            </div>
        </div>
    );
};

export default HostContactModal;
