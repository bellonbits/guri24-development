import { useState, useEffect } from 'react';
import { Search, UserPlus, Eye, CheckCircle2, MapPin, Building2, Mail, Phone, Calendar, MessageSquare } from 'lucide-react';
import adminApi from '../../utils/adminApi';
import './AdminInquiries.css';

function AdminInquiries() {
    const [inquiries, setInquiries] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterAgent, setFilterAgent] = useState('all');
    const [reassignModal, setReassignModal] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [inquiriesRes, agentsRes] = await Promise.all([
                adminApi.getInquiries(),
                adminApi.getUsers({ role: 'agent' })
            ]);

            // Defensive check for inquiries
            let inquiryData = [];
            if (Array.isArray(inquiriesRes)) {
                inquiryData = inquiriesRes;
            } else if (inquiriesRes && inquiriesRes.inquiries && Array.isArray(inquiriesRes.inquiries)) {
                inquiryData = inquiriesRes.inquiries;
            } else if (inquiriesRes && inquiriesRes.items && Array.isArray(inquiriesRes.items)) {
                inquiryData = inquiriesRes.items;
            } else if (inquiriesRes && typeof inquiriesRes === 'object') {
                const possibleArray = Object.values(inquiriesRes).find(val => Array.isArray(val));
                if (possibleArray) {
                    inquiryData = possibleArray;
                } else {
                    console.error('Unexpected inquiries response structure:', inquiriesRes);
                }
            } else {
                console.error('Unexpected inquiries response type:', typeof inquiriesRes, inquiriesRes);
            }
            setInquiries(inquiryData);

            // Defensive check for agents
            if (Array.isArray(agentsRes)) {
                setAgents(agentsRes);
            } else {
                console.error('Unexpected agents response:', agentsRes);
                setAgents([]);
            }

        } catch (err) {
            console.error('Failed to fetch inquiries:', err);
            setInquiries([]);
            setAgents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReassign = async () => {
        if (!selectedAgent || !reassignModal) return;

        try {
            await adminApi.reassignInquiry(reassignModal.id, selectedAgent);
            setReassignModal(null);
            setSelectedAgent('');
            fetchData();
        } catch (err) {
            alert('Failed to reassign inquiry: ' + err.message);
        }
    };

    const handleMarkAsContacted = async (inquiryId) => {
        try {
            await adminApi.updateInquiryStatus(inquiryId, 'contacted');
            fetchData();
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        }
    };

    const filteredInquiries = inquiries.filter(inquiry => {
        const matchesSearch = inquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.property?.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;
        const matchesAgent = filterAgent === 'all' || inquiry.property?.agent_id === filterAgent;

        return matchesSearch && matchesStatus && matchesAgent;
    });

    return (
        <div className="admin-inquiries">
            <div className="page-header">
                <h1>Customer Inquiries</h1>
                <p>Manage and track all customer leads</p>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by customer name, email, or property..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="closed">Closed</option>
                </select>

                <select value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)}>
                    <option value="all">All Agents</option>
                    {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                </select>
            </div>

            {/* Inquiries Table */}
            {loading ? (
                <div className="loading-state">Loading inquiries...</div>
            ) : inquiries.length === 0 ? (
                <div className="empty-state">
                    <MessageSquare size={48} />
                    <h3>No Inquiries Yet</h3>
                    <p>Customer inquiries will appear here when they contact agents.</p>
                </div>
            ) : (
                <div className="inquiries-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Property</th>
                                <th>Agent</th>
                                <th>Message</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInquiries.map(inquiry => (
                                <tr key={inquiry.id}>
                                    <td>
                                        <div className="customer-cell">
                                            <div className="customer-avatar">
                                                {inquiry.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <strong>{inquiry.name}</strong>
                                                <div className="contact-info">
                                                    <Mail size={12} />
                                                    {inquiry.email}
                                                </div>
                                                {inquiry.phone && (
                                                    <div className="contact-info">
                                                        <Phone size={12} />
                                                        {inquiry.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="property-info-admin">
                                            <div className="property-icon-box">
                                                <Building2 size={16} />
                                            </div>
                                            <div>
                                                <strong>{inquiry.property?.title || 'N/A'}</strong>
                                                <div className="property-location-admin">
                                                    <MapPin size={12} />
                                                    {inquiry.property?.location || inquiry.property?.city || 'Location N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="agent-tag-admin">
                                            {agents.find(a => a.id === inquiry.property?.agent_id)?.name || 'Unassigned'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="message-bubble-admin" title={inquiry.message}>
                                            {inquiry.message || 'No message provided'}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge-status status-${inquiry.status}`}>
                                            {inquiry.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="date-cell-admin">
                                            <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                                            <span className="time-sub">{new Date(inquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons-admin">
                                            {inquiry.status === 'new' && (
                                                <button
                                                    className="btn-action-icon contacted"
                                                    onClick={() => handleMarkAsContacted(inquiry.id)}
                                                    title="Mark as Contacted"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            )}

                                            <button
                                                className="btn-action-icon reassign"
                                                onClick={() => setReassignModal(inquiry)}
                                                title="Reassign to Agent"
                                            >
                                                <UserPlus size={16} />
                                            </button>

                                            <button
                                                className="btn-action-icon view"
                                                onClick={() => window.open(`/property/${inquiry.property?.slug}`, '_blank')}
                                                title="View Property"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredInquiries.length === 0 && (
                        <div className="empty-state">
                            <p>No inquiries found matching your filters.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Reassign Modal */}
            {reassignModal && (
                <div className="modal-overlay" onClick={() => setReassignModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Reassign Inquiry</h3>
                        <p>Assign this inquiry to a different agent</p>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Customer</label>
                                <div className="info-text">{reassignModal.name}</div>
                            </div>

                            <div className="form-group">
                                <label>Property</label>
                                <div className="info-text">{reassignModal.property?.title}</div>
                            </div>

                            <div className="form-group">
                                <label>Current Agent</label>
                                <div className="info-text">
                                    {agents.find(a => a.id === reassignModal.property?.agent_id)?.name || 'Unassigned'}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Reassign To</label>
                                <select
                                    value={selectedAgent}
                                    onChange={(e) => setSelectedAgent(e.target.value)}
                                    className="agent-select"
                                >
                                    <option value="">Select an agent...</option>
                                    {agents.filter(a => a.id !== reassignModal.property?.agent_id).map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setReassignModal(null)}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleReassign}
                                disabled={!selectedAgent}
                            >
                                Reassign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminInquiries;
