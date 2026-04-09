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
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search properties by title or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select className="filter-select" value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)}>
                    <option value="all">All Agents</option>
                    {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                </select>

                <select className="filter-select" value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
                    <option value="all">All Cities</option>
                    {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>

                <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="pending">Pending</option>
                    <option value="draft">Draft</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Properties Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading properties...</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <div className="table-header">
                        <h3>All Properties</h3>
                        <span className="table-count">{filteredProperties.length} total</span>
                    </div>
                    <div className="table-scroll">
                        <table className="admin-table">
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
                                                        <Building2 size={18} />
                                                    </div>
                                                )}
                                                <div className="property-info">
                                                    <h4>{property.title}</h4>
                                                    <span>
                                                        {property.type}
                                                        {property.purpose && <> &bull; {property.purpose}</>}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="agent-cell">
                                            {agents.find(a => a.id === property.agent_id)?.name || 'Unknown Agent'}
                                        </td>
                                        <td className="location-cell">
                                            <MapPin size={13} />
                                            {property.city || property.location || 'N/A'}
                                        </td>
                                        <td className="price-cell">
                                            KES {property.price?.toLocaleString()}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${property.status}`}>
                                                {property.status}
                                            </span>
                                        </td>
                                        <td className="date-cell">
                                            {new Date(property.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {(property.status === 'pending' || property.status === 'draft') && (
                                                    <button
                                                        className="action-btn approve"
                                                        onClick={() => handleApprove(property.id)}
                                                        title="Approve & Publish"
                                                    >
                                                        <CheckCircle2 size={15} />
                                                    </button>
                                                )}
                                                {property.status === 'published' && (
                                                    <button
                                                        className="action-btn deactivate"
                                                        onClick={() => handleDeactivate(property.id)}
                                                        title="Deactivate to Draft"
                                                    >
                                                        <XCircle size={15} />
                                                    </button>
                                                )}
                                                {property.status === 'pending' && (
                                                    <button
                                                        className="action-btn reject"
                                                        onClick={() => handleReject(property.id)}
                                                        title="Reject"
                                                    >
                                                        <XCircle size={15} />
                                                    </button>
                                                )}
                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => handleEdit(property.id)}
                                                    title="Edit"
                                                >
                                                    <Edit size={15} />
                                                </button>
                                                <button
                                                    className="action-btn view"
                                                    onClick={() => handleView(property.slug)}
                                                    title="View Live"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => handleDelete(property.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredProperties.length === 0 && (
                        <div className="empty-state">
                            <Building2 size={36} />
                            <h3>No properties found</h3>
                            <p>Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminProperties;
