import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash, ExternalLink, Eye } from 'lucide-react';
import { propertyApi } from '../../utils/propertyApi';
import { useAuth } from '../../context/AuthContext';
import './AgentListings.css';

const AgentListings = () => {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        if (user?.id) {
            fetchListings();
        }
    }, [user, filterStatus]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            let data;

            // Build query params
            const params = {};
            if (filterStatus !== 'ALL') {
                params.status = filterStatus.toLowerCase();
            }

            try {
                // Try the strict isolation endpoint
                console.log(`Fetching my properties from /properties/me with status=${filterStatus}...`);
                data = await propertyApi.getMyProperties(params);
            } catch (err) {
                console.warn("Endpoints /properties/me failed, falling back to filtered list", err);
                // Fallback to legacy filtering if endpoint doesn't exist yet
                if (user?.id) {
                    data = await propertyApi.getAgentProperties(user.id);
                } else {
                    throw new Error("User ID missing for fallback fetch");
                }
            }

            console.log("AgentListings: Raw data received:", data);

            // Defensive data processing
            // backend returns { properties: [], total: ... } OR just []
            let properties = [];
            if (data?.properties && Array.isArray(data.properties)) {
                properties = data.properties;
            } else if (Array.isArray(data)) {
                properties = data;
            } else {
                console.warn("AgentListings: Unexpected data format", data);
                properties = [];
            }

            // Client-side fallback filtering if API didn't filter
            if (filterStatus !== 'ALL' && properties.length > 0) {
                const hasWrongStatus = properties.some(p => p.status !== filterStatus.toLowerCase());
                if (hasWrongStatus) {
                    properties = properties.filter(p => p.status === filterStatus.toLowerCase());
                }
            }

            console.log("AgentListings: Processed properties array:", properties);
            setListings(properties);
        } catch (error) {
            console.error('Failed to fetch listings:', error);
            setListings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await propertyApi.updateProperty(id, { status: newStatus });
            setListings(listings.map(l => l.id === id ? { ...l, status: newStatus } : l));
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        try {
            await propertyApi.deleteProperty(id);
            setListings(listings.filter(l => l.id !== id));
        } catch (error) {
            console.error('Failed to delete listing:', error);
            alert('Failed to delete listing. Please try again.');
        }
    };

    const filteredListings = listings.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tabs = [
        { id: 'ALL', label: 'All Properties' },
        { id: 'PUBLISHED', label: 'Published' },
        { id: 'DRAFT', label: 'Drafts' },
        { id: 'ARCHIVED', label: 'Archived' }
    ];

    return (
        <div className="agent-listings-page">
            <div className="listings-header">
                <div>
                    <h1 className="page-title">My Properties</h1>
                    <p className="page-subtitle">Manage your property portfolio.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="listings-toolbar">
                <div className="filter-tabs" style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id)}
                            className={`filter-tab ${filterStatus === tab.id ? 'active' : ''}`}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: filterStatus === tab.id ? '#2563eb' : '#e5e7eb',
                                background: filterStatus === tab.id ? '#eff6ff' : 'white',
                                color: filterStatus === tab.id ? '#2563eb' : '#6b7280',
                                fontWeight: filterStatus === tab.id ? '600' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="search-box">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search properties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="listings-table-container">
                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : (
                    <table className="listings-table">
                        <thead>
                            <tr>
                                <th>Property</th>
                                <th>Type</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Stats</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredListings.length > 0 ? (
                                filteredListings.map((listing) => (
                                    <tr key={listing.id}>
                                        <td className="col-title">
                                            <div className="listing-title-cell">
                                                <div className="listing-thumb-placeholder">
                                                    {listing.type.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="listing-info">
                                                    <div className="listing-name">{listing.title}</div>
                                                    <div className="listing-id">ID: {listing.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="capitalize">{listing.type}</span></td>
                                        <td>KES {listing.price.toLocaleString()}</td>
                                        <td>
                                            <select
                                                value={listing.status}
                                                onChange={(e) => handleStatusChange(listing.id, e.target.value)}
                                                className={`status-select status-${listing.status}`}
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #e5e7eb',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                <option value="draft">DRAFT</option>
                                                <option value="published">PUBLISHED</option>
                                                <option value="archived">ARCHIVED</option>
                                            </select>
                                        </td>
                                        <td>
                                            <div className="stat-cell">
                                                <Eye size={16} /> {listing.views}
                                            </div>
                                        </td>
                                        <td>{new Date(listing.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div className="actions-cell">
                                                <a href={`/property/${listing.slug}`} target="_blank" rel="noopener noreferrer" className="action-btn" title="View Property">
                                                    <ExternalLink size={18} />
                                                </a>
                                                <Link to={`/agent/properties/edit/${listing.id}`} className="action-btn" title="Edit Listing">
                                                    <Pencil size={18} />
                                                </Link>
                                                <button className="action-btn delete" title="Delete Listing" onClick={() => handleDelete(listing.id)}>
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="empty-table">
                                        No properties found. <Link to="/agent/properties/add">Add your first one!</Link>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AgentListings;
