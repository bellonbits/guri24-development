import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, CheckCircle2, XCircle, Edit, Trash2, MapPin, Building2, DollarSign } from 'lucide-react';
import adminApi from '../../utils/adminApi';
import './AdminProperties.css';

function AdminProperties() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAgent, setFilterAgent] = useState('all');
    const [filterCity, setFilterCity] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [propertiesRes, agentsRes] = await Promise.all([
                adminApi.getProperties(),
                adminApi.getUsers({ role: 'agent' })
            ]);

            // Defensive check for properties - handle various possible API response shapes
            let propertyData = [];
            if (Array.isArray(propertiesRes)) {
                propertyData = propertiesRes;
            } else if (propertiesRes && Array.isArray(propertiesRes.properties)) {
                propertyData = propertiesRes.properties;
            } else if (propertiesRes && Array.isArray(propertiesRes.items)) {
                propertyData = propertiesRes.items;
            } else if (propertiesRes && typeof propertiesRes === 'object') {
                // If it's an object but we can't find the array, look for any array property
                const possibleArray = Object.values(propertiesRes).find(val => Array.isArray(val));
                if (possibleArray) {
                    propertyData = possibleArray;
                } else {
                    console.error('Unexpected properties response structure:', propertiesRes);
                }
            } else {
                console.error('Unexpected properties response type:', typeof propertiesRes, propertiesRes);
            }
            setProperties(propertyData);

            // Defensive check for agents
            if (Array.isArray(agentsRes)) {
                setAgents(agentsRes);
            } else {
                console.error('Unexpected agents response:', agentsRes);
                setAgents([]);
            }

        } catch (err) {
            console.error('Failed to fetch data:', err);
            setProperties([]);
            setAgents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (propertyId) => {
        if (!confirm('Approve and publish this property?')) return;

        try {
            await adminApi.updatePropertyStatus(propertyId, 'published');
            fetchData();
        } catch (err) {
            alert('Failed to approve property: ' + err.message);
        }
    };

    const handleReject = async (propertyId) => {
        if (!confirm('Reject this property?')) return;

        try {
            await adminApi.updatePropertyStatus(propertyId, 'rejected');
            fetchData();
        } catch (err) {
            alert('Failed to reject property: ' + err.message);
        }
    };

    const handleDeactivate = async (propertyId) => {
        if (!confirm('Deactivate this property?')) return;

        try {
            await adminApi.updatePropertyStatus(propertyId, 'draft');
            fetchData();
        } catch (err) {
            alert('Failed to deactivate property: ' + err.message);
        }
    };

    const handleDelete = async (propertyId) => {
        if (!confirm('Permanently delete this property? This cannot be undone.')) return;

        try {
            await adminApi.deleteProperty(propertyId);
            fetchData();
        } catch (err) {
            alert('Failed to delete property: ' + err.message);
        }
    };

    const handleEdit = (propertyId) => {
        navigate(`/admin/properties/edit/${propertyId}`);
    };

    const handleView = (propertySlug) => {
        window.open(`/property/${propertySlug}`, '_blank');
    };

    // Get unique cities
    const cities = [...new Set(properties.map(p => p.city).filter(Boolean))];

    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.city?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAgent = filterAgent === 'all' || property.agent_id === filterAgent;
        const matchesCity = filterCity === 'all' || property.city === filterCity;
        const matchesStatus = filterStatus === 'all' || property.status === filterStatus;

        return matchesSearch && matchesAgent && matchesCity && matchesStatus;
    });

    return (
        <div className="admin-properties">
            <div className="page-header">
                <div>
                    <h1>Property Management</h1>
                    <p>Manage all properties across the platform</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/admin/properties/create')}>
                    <Building2 size={20} />
                    Add Property
                </button>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search properties by title or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)}>
                    <option value="all">All Agents</option>
                    {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                </select>

                <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
                    <option value="all">All Cities</option>
                    {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="pending">Pending</option>
                    <option value="draft">Draft</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Properties Table */}
            {loading ? (
                <div className="loading-state">Loading properties...</div>
            ) : (
                <div className="properties-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Property</th>
                                <th>Agent</th>
                                <th>Location</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProperties.map(property => (
                                <tr key={property.id}>
                                    <td>
                                        <div className="property-cell">
                                            {property.images && property.images.length > 0 ? (
                                                <img
                                                    src={property.images[0]}
                                                    alt={property.title}
                                                    className="property-thumb"
                                                />
                                            ) : (
                                                <div className="property-thumb-placeholder">
                                                    <Building2 size={24} />
                                                </div>
                                            )}
                                            <div>
                                                <strong>{property.title}</strong>
                                                <div className="property-meta-row">
                                                    <span className="property-type">{property.type}</span>
                                                    <span className="dot">•</span>
                                                    <span className="property-purpose">{property.purpose}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="agent-cell-admin">
                                            {agents.find(a => a.id === property.agent_id)?.name || 'Unknown Agent'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="location-cell">
                                            <MapPin size={14} />
                                            {property.location || property.city || 'N/A'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="price-cell-admin">
                                            <span className="currency">KES</span>
                                            {property.price?.toLocaleString()}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge status-${property.status}`}>
                                            {property.status}
                                        </span>
                                    </td>
                                    <td>{new Date(property.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {property.status === 'pending' || property.status === 'draft' ? (
                                                <button
                                                    className="btn-icon approve"
                                                    onClick={() => handleApprove(property.id)}
                                                    title="Approve & Publish"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            ) : null}

                                            {property.status === 'published' && (
                                                <button
                                                    className="btn-icon deactivate"
                                                    onClick={() => handleDeactivate(property.id)}
                                                    title="Deactivate to Draft"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            )}

                                            {property.status === 'pending' && (
                                                <button
                                                    className="btn-icon reject"
                                                    onClick={() => handleReject(property.id)}
                                                    title="Reject"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            )}

                                            <button
                                                className="btn-icon edit"
                                                onClick={() => handleEdit(property.id)}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>

                                            <button
                                                className="btn-icon view"
                                                onClick={() => handleView(property.slug)}
                                                title="View Live"
                                            >
                                                <Eye size={16} />
                                            </button>

                                            <button
                                                className="btn-icon delete"
                                                onClick={() => handleDelete(property.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredProperties.length === 0 && (
                        <div className="empty-state">
                            <p>No properties found matching your filters.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminProperties;
