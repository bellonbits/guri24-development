import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save, ArrowLeft, Loader2, MapPin, Image as ImageIcon,
    Upload, X, CheckSquare, Home, DollarSign, FileText, Star
} from 'lucide-react';
import adminApi from '../../utils/adminApi';
import LocationPicker from '../components/LocationPicker';
import './AdminPropertyForm.css';

const AMENITIES = [
    { key: 'parking',        label: 'Parking',          icon: '🅿️' },
    { key: 'pool',           label: 'Swimming Pool',     icon: '🏊' },
    { key: 'gym',            label: 'Gym / Fitness',     icon: '💪' },
    { key: 'security',       label: '24/7 Security',     icon: '🔒' },
    { key: 'garden',         label: 'Garden',            icon: '🌿' },
    { key: 'balcony',        label: 'Balcony',           icon: '🏡' },
    { key: 'furnished',      label: 'Furnished',         icon: '🛋️' },
    { key: 'airConditioning',label: 'Air Conditioning',  icon: '❄️' },
    { key: 'heating',        label: 'Heating',           icon: '🔥' },
    { key: 'internet',       label: 'Internet / WiFi',   icon: '📶' },
    { key: 'elevator',       label: 'Elevator',          icon: '🛗' },
    { key: 'petFriendly',    label: 'Pet Friendly',      icon: '🐾' },
];

const EMPTY_FEATURES = Object.fromEntries(AMENITIES.map(a => [a.key, false]));

export default function AdminPropertyForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;
    const dropRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);
    const [error, setError] = useState('');
    const [uploadingCount, setUploadingCount] = useState(0);
    const [dragOver, setDragOver] = useState(false);

    const [formData, setFormData] = useState({
        title: '', price: '', type: 'apartment', purpose: 'rent',
        status: 'draft', location: '', address: '',
        latitude: '', longitude: '',
        bedrooms: '', bathrooms: '', area_sqft: '',
        description: '', images: [], features: { ...EMPTY_FEATURES },
    });

    useEffect(() => { if (isEditing) fetchProperty(); }, [id]);

    const fetchProperty = async () => {
        try {
            setFetching(true);
            const data = await adminApi.getPropertyById(id);
            setFormData({
                title: data.title || '',
                price: data.price || '',
                type: data.type || 'apartment',
                purpose: data.purpose || 'rent',
                status: data.status || 'draft',
                location: data.location || '',
                address: data.address || '',
                latitude: data.latitude || '',
                longitude: data.longitude || '',
                bedrooms: data.bedrooms || '',
                bathrooms: data.bathrooms || '',
                area_sqft: data.area_sqft || '',
                description: data.description || '',
                images: data.images || [],
                features: { ...EMPTY_FEATURES, ...(data.features || {}) },
            });
        } catch (err) {
            setError('Failed to load property details');
        } finally {
            setFetching(false);
        }
    };

    const set = (name, value) => setFormData(p => ({ ...p, [name]: value }));
    const handleChange = e => set(e.target.name, e.target.value);
    const toggleFeature = key => setFormData(p => ({ ...p, features: { ...p.features, [key]: !p.features[key] } }));

    // ── Image upload ──────────────────────────────────────────────
    const uploadFiles = useCallback(async (files) => {
        const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (!valid.length) return;
        setUploadingCount(v => v + valid.length);
        const results = await Promise.allSettled(
            valid.map(f => adminApi.uploadPropertyImage(f).then(r => r.url))
        );
        const urls = results.filter(r => r.status === 'fulfilled').map(r => r.value);
        setFormData(p => ({ ...p, images: [...p.images, ...urls] }));
        setUploadingCount(v => v - valid.length);
    }, []);

    const handleFileInput = e => uploadFiles(e.target.files);
    const handleDrop = useCallback(e => {
        e.preventDefault();
        setDragOver(false);
        uploadFiles(e.dataTransfer.files);
    }, [uploadFiles]);

    const removeImage = (idx) => setFormData(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));

    // ── Submit ────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                bedrooms: parseInt(formData.bedrooms) || 0,
                bathrooms: parseInt(formData.bathrooms) || 0,
                area_sqft: parseInt(formData.area_sqft) || 0,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                address: formData.address || null,
            };
            if (isEditing) await adminApi.updateProperty(id, payload);
            else await adminApi.createProperty(payload);
            navigate('/admin/properties');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save property. Please check all required fields.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="apf-loading">
            <div className="apf-spinner" />
            <span>Loading property…</span>
        </div>
    );

    return (
        <div className="apf-page">
            {/* ── Header ── */}
            <div className="apf-header">
                <button type="button" className="apf-back-btn" onClick={() => navigate('/admin/properties')}>
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="apf-header-text">
                    <h1>{isEditing ? 'Edit Property' : 'Add New Property'}</h1>
                    <p>{isEditing ? 'Update listing details below' : 'Fill in the details to create a new listing'}</p>
                </div>
                <button type="button" className="apf-save-btn-top" onClick={handleSubmit} disabled={loading}>
                    {loading ? <Loader2 size={16} className="apf-spin" /> : <Save size={16} />}
                    {loading ? 'Saving…' : 'Save Property'}
                </button>
            </div>

            {error && (
                <div className="apf-alert apf-alert-error">
                    <X size={16} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="apf-form">
                <div className="apf-layout">
                    {/* ── LEFT COLUMN ── */}
                    <div className="apf-col-main">

                        {/* Basic Info */}
                        <div className="apf-card">
                            <div className="apf-card-title"><Home size={16} /> Basic Information</div>

                            <div className="apf-field">
                                <label>Property Title <span className="apf-req">*</span></label>
                                <input name="title" value={formData.title} onChange={handleChange}
                                    required minLength={3} placeholder="e.g. Modern 3-Bedroom Apartment in Kilimani" />
                            </div>

                            <div className="apf-row apf-row-4">
                                <div className="apf-field">
                                    <label>Price <span className="apf-req">*</span></label>
                                    <div className="apf-input-prefix">
                                        <span>KSh</span>
                                        <input name="price" type="number" value={formData.price}
                                            onChange={handleChange} required min="0" placeholder="50,000" />
                                    </div>
                                </div>
                                <div className="apf-field">
                                    <label>Type <span className="apf-req">*</span></label>
                                    <select name="type" value={formData.type} onChange={handleChange}>
                                        <option value="apartment">Apartment</option>
                                        <option value="house">House</option>
                                        <option value="villa">Villa</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="land">Land</option>
                                        <option value="shop">Shop</option>
                                    </select>
                                </div>
                                <div className="apf-field">
                                    <label>Purpose <span className="apf-req">*</span></label>
                                    <select name="purpose" value={formData.purpose} onChange={handleChange}>
                                        <option value="rent">For Rent</option>
                                        <option value="sale">For Sale</option>
                                        <option value="stay">Short Stay</option>
                                    </select>
                                </div>
                                <div className="apf-field">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Property Details */}
                        <div className="apf-card">
                            <div className="apf-card-title"><FileText size={16} /> Property Details</div>
                            <div className="apf-row apf-row-3">
                                <div className="apf-field">
                                    <label>Bedrooms</label>
                                    <input name="bedrooms" type="number" value={formData.bedrooms}
                                        onChange={handleChange} min="0" placeholder="3" />
                                </div>
                                <div className="apf-field">
                                    <label>Bathrooms</label>
                                    <input name="bathrooms" type="number" value={formData.bathrooms}
                                        onChange={handleChange} min="0" placeholder="2" />
                                </div>
                                <div className="apf-field">
                                    <label>Area (sqft)</label>
                                    <input name="area_sqft" type="number" value={formData.area_sqft}
                                        onChange={handleChange} min="0" placeholder="1200" />
                                </div>
                            </div>
                            <div className="apf-field">
                                <label>Description <span className="apf-req">*</span></label>
                                <textarea name="description" value={formData.description} onChange={handleChange}
                                    rows={5} required minLength={5}
                                    placeholder="Describe the property — location highlights, features, nearby amenities…" />
                                <span className="apf-hint">{formData.description.length} characters</span>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="apf-card">
                            <div className="apf-card-title"><MapPin size={16} /> Location</div>
                            <div className="apf-field">
                                <label>City / Area <span className="apf-req">*</span></label>
                                <input name="location" value={formData.location} onChange={handleChange}
                                    required minLength={3} placeholder="Kilimani, Nairobi" />
                                <span className="apf-hint">Auto-filled when you pick from the map below</span>
                            </div>
                            <div className="apf-field">
                                <label>Pin on Map</label>
                                <LocationPicker
                                    value={{ latitude: formData.latitude, longitude: formData.longitude, address: formData.address, location: formData.location }}
                                    onChange={({ latitude, longitude, address, location }) =>
                                        setFormData(p => ({ ...p, latitude, longitude, address, ...(location ? { location } : {}) }))
                                    }
                                />
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="apf-card">
                            <div className="apf-card-title"><Star size={16} /> Features & Amenities</div>
                            <div className="apf-amenities-grid">
                                {AMENITIES.map(({ key, label, icon }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`apf-amenity${formData.features[key] ? ' apf-amenity-on' : ''}`}
                                        onClick={() => toggleFeature(key)}
                                    >
                                        <span className="apf-amenity-icon">{icon}</span>
                                        <span>{label}</span>
                                        {formData.features[key] && <CheckSquare size={13} className="apf-amenity-check" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div className="apf-col-side">

                        {/* Images */}
                        <div className="apf-card">
                            <div className="apf-card-title"><ImageIcon size={16} /> Property Images</div>

                            {/* Drop zone */}
                            <div
                                ref={dropRef}
                                className={`apf-drop-zone${dragOver ? ' apf-drop-active' : ''}`}
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('apf-file-input').click()}
                            >
                                <Upload size={28} className="apf-drop-icon" />
                                <p className="apf-drop-title">Drop images here</p>
                                <p className="apf-drop-sub">or click to browse</p>
                                <span className="apf-drop-types">JPG, PNG, WebP — max 10 MB each</span>
                                <input
                                    id="apf-file-input"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={handleFileInput}
                                />
                            </div>

                            {/* Uploading indicator */}
                            {uploadingCount > 0 && (
                                <div className="apf-uploading-bar">
                                    <Loader2 size={14} className="apf-spin" />
                                    Uploading {uploadingCount} image{uploadingCount > 1 ? 's' : ''}…
                                </div>
                            )}

                            {/* Preview grid */}
                            {formData.images.length > 0 && (
                                <div className="apf-image-grid">
                                    {formData.images.map((url, i) => (
                                        <div key={i} className="apf-image-thumb">
                                            <img src={url} alt={`img-${i}`}
                                                onError={e => e.target.src = 'https://placehold.co/160x120?text=Error'} />
                                            {i === 0 && <span className="apf-img-cover-badge">Cover</span>}
                                            <button type="button" className="apf-img-remove" onClick={() => removeImage(i)}>
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {formData.images.length === 0 && uploadingCount === 0 && (
                                <p className="apf-no-images">No images yet — upload at least one photo.</p>
                            )}
                        </div>

                        {/* Quick summary */}
                        <div className="apf-card apf-summary-card">
                            <div className="apf-card-title"><DollarSign size={16} /> Summary</div>
                            <div className="apf-summary-row">
                                <span>Type</span><strong>{formData.type || '—'}</strong>
                            </div>
                            <div className="apf-summary-row">
                                <span>Purpose</span>
                                <strong className={`apf-purpose-badge apf-purpose-${formData.purpose}`}>
                                    {formData.purpose === 'sale' ? 'For Sale' : formData.purpose === 'rent' ? 'For Rent' : 'Short Stay'}
                                </strong>
                            </div>
                            <div className="apf-summary-row">
                                <span>Status</span>
                                <strong className={`apf-status-dot apf-status-${formData.status}`}>
                                    ● {formData.status}
                                </strong>
                            </div>
                            <div className="apf-summary-row">
                                <span>Images</span><strong>{formData.images.length}</strong>
                            </div>
                            <div className="apf-summary-row">
                                <span>Amenities</span>
                                <strong>{Object.values(formData.features).filter(Boolean).length} selected</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer actions ── */}
                <div className="apf-footer">
                    <button type="button" className="apf-btn-cancel" onClick={() => navigate('/admin/properties')}>
                        Cancel
                    </button>
                    <button type="submit" className="apf-btn-save" disabled={loading}>
                        {loading ? <Loader2 size={16} className="apf-spin" /> : <Save size={16} />}
                        {loading ? 'Saving…' : isEditing ? 'Update Property' : 'Create Property'}
                    </button>
                </div>
            </form>
        </div>
    );
}
