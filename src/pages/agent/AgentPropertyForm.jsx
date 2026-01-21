import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Upload, X, Plus, MapPin } from 'lucide-react';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { propertyApi } from '../../utils/propertyApi';
import './AgentPropertyForm.css';

const mapContainerStyle = {
    width: '100%',
    height: '350px',
    borderRadius: '12px',
    marginTop: '1rem'
};

const defaultCenter = { lat: -1.2921, lng: 36.8219 }; // Nairobi

const libraries = ["places"];

const AgentPropertyForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [autocomplete, setAutocomplete] = useState(null);
    const [map, setMap] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'apartment',
        purpose: 'rent',
        price: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        location: {
            address: '',
            city: '',
            country: 'Kenya'
        },
        latitude: null,
        longitude: null,
        features: [],
        images: []
    });

    const [imageUrls, setImageUrls] = useState(['']);
    const [newFeature, setNewFeature] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchPropertyDetails();
        }
    }, [id]);

    const fetchPropertyDetails = async () => {
        try {
            setLoading(true);
            const data = await propertyApi.getPropertyById(id);

            // Format data for form
            // Handle features: if it's a dict, convert to array of values
            let featuresArray = [];
            if (Array.isArray(data.features)) {
                featuresArray = data.features;
            } else if (data.features && typeof data.features === 'object') {
                featuresArray = Object.values(data.features);
            }

            // Handle location: might be a string or object
            const locationData = data.location;
            const address = locationData?.address || (typeof locationData === 'string' ? locationData : '');
            const city = locationData?.city || '';
            const country = locationData?.country || 'Kenya';

            setFormData({
                title: data.title || '',
                description: data.description || '',
                type: data.type || 'apartment',
                purpose: data.purpose || 'rent',
                price: data.price || '',
                bedrooms: data.bedrooms || '',
                bathrooms: data.bathrooms || '',
                area: data.area_sqft || data.area || '',
                location: {
                    address,
                    city,
                    country
                },
                latitude: data.latitude || null,
                longitude: data.longitude || null,
                features: featuresArray,
                images: data.images || []
            });

            if (data.images && data.images.length > 0) {
                setImageUrls(data.images);
            }
        } catch (error) {
            console.error('Failed to fetch property details:', error);
            setError('Failed to load property details.');
        } finally {
            setLoading(false);
        }
    };

    const onLoadAutocomplete = (autocompleteInstance) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();

                // Extract city/country from address components
                let city = '';
                let country = 'Kenya';
                if (place.address_components) {
                    for (const component of place.address_components) {
                        if (component.types.includes('locality')) city = component.long_name;
                        if (component.types.includes('country')) country = component.long_name;
                    }
                }

                setFormData(prev => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        address: place.formatted_address || prev.location.address,
                        city: city || prev.location.city,
                        country: country || prev.location.country
                    },
                    latitude: lat,
                    longitude: lng
                }));

                if (map) {
                    map.panTo({ lat, lng });
                    map.setZoom(15);
                }
            }
        }
    };

    const onMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('location.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                location: { ...prev.location, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageUrlChange = (index, value) => {
        const newUrls = [...imageUrls];
        newUrls[index] = value;
        setImageUrls(newUrls);
        setFormData(prev => ({ ...prev, images: newUrls.filter(url => url.trim()) }));
    };

    const addImageUrl = () => {
        setImageUrls([...imageUrls, '']);
    };

    const removeImageUrl = (index) => {
        const newUrls = imageUrls.filter((_, i) => i !== index);
        setImageUrls(newUrls);
        setFormData(prev => ({ ...prev, images: newUrls.filter(url => url.trim()) }));
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Convert features array to dict format expected by backend
            const featuresDict = {};
            formData.features.forEach((feature, index) => {
                featuresDict[`feature_${index}`] = feature;
            });

            const propertyData = {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                purpose: formData.purpose,
                price: parseFloat(formData.price),
                bedrooms: parseInt(formData.bedrooms) || 0,
                bathrooms: parseInt(formData.bathrooms) || 0,
                area_sqft: parseFloat(formData.area) || 0,
                location: formData.location.city || formData.location.address || 'Not specified',
                address: formData.location.address || '',
                latitude: formData.latitude,
                longitude: formData.longitude,
                features: featuresDict,
                images: formData.images.filter(img => img.trim())
            };

            if (isEditMode) {
                await propertyApi.updateProperty(id, propertyData);
            } else {
                await propertyApi.createProperty(propertyData);
            }
            navigate('/agent/properties');
        } catch (err) {
            console.error(isEditMode ? 'Failed to update property:' : 'Failed to create property:', err);

            // Extract error message safely
            let errorMessage = isEditMode ? 'Failed to update property.' : 'Failed to create property.';

            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    // Validation errors from FastAPI
                    errorMessage = err.response.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
                } else if (typeof err.response.data.detail === 'string') {
                    errorMessage = err.response.data.detail;
                }
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="agent-property-form">
            <div className="form-header">
                <button onClick={() => navigate('/agent/properties')} className="back-btn">
                    <ArrowLeft size={20} />
                    <span>Back to Listings</span>
                </button>
                <h1>{isEditMode ? 'Edit Property' : 'Add New Property'}</h1>
                <p>{isEditMode ? 'Update property details below' : 'Fill in the details to list your property'}</p>
            </div>

            {error && (
                <div className="error-alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="property-form">
                {/* Basic Information */}
                <div className="form-section">
                    <h2>Basic Information</h2>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Property Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Modern 3BR Apartment in Westlands"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="4"
                                placeholder="Describe your property..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Property Type *</label>
                            <select name="type" value={formData.type} onChange={handleChange} required>
                                <option value="apartment">{t('categories.apartment', 'Apartment')}</option>
                                <option value="house">{t('categories.house', 'House')}</option>
                                <option value="villa">{t('categories.villa', 'Villa')}</option>
                                <option value="land">{t('categories.land', 'Land')}</option>
                                <option value="commercial">{t('categories.commercial', 'Commercial')}</option>
                                <option value="shop">{t('categories.shop', 'Shop')}</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Purpose *</label>
                            <select name="purpose" value={formData.purpose} onChange={handleChange} required>
                                <option value="rent">For Rent</option>
                                <option value="sale">For Sale</option>
                                <option value="stay">Short-term Stay</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Price (KES) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                placeholder="50000"
                            />
                        </div>
                    </div>
                </div>

                {/* Property Details */}
                <div className="form-section">
                    <h2>Property Details</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Bedrooms *</label>
                            <input
                                type="number"
                                name="bedrooms"
                                value={formData.bedrooms}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Bathrooms *</label>
                            <input
                                type="number"
                                name="bathrooms"
                                value={formData.bathrooms}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Area (sq ft) *</label>
                            <input
                                type="number"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="form-section">
                    <h2>Location</h2>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Search Address & Pick on Map *</label>
                            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
                                <Autocomplete
                                    onLoad={onLoadAutocomplete}
                                    onPlaceChanged={onPlaceChanged}
                                >
                                    <input
                                        type="text"
                                        name="location.address"
                                        value={formData.location.address}
                                        onChange={handleChange}
                                        required
                                        placeholder="Search for an address..."
                                        className="map-search-input"
                                    />
                                </Autocomplete>

                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={formData.latitude && formData.longitude
                                        ? { lat: formData.latitude, lng: formData.longitude }
                                        : defaultCenter}
                                    zoom={formData.latitude ? 15 : 12}
                                    onClick={onMapClick}
                                    onLoad={setMap}
                                    options={{
                                        streetViewControl: false,
                                        mapTypeControl: false,
                                    }}
                                >
                                    {formData.latitude && formData.longitude && (
                                        <Marker position={{ lat: formData.latitude, lng: formData.longitude }} />
                                    )}
                                </GoogleMap>
                            </LoadScript>
                            <p className="form-help-text">Search for an address above or click directly on the map to set the exact location.</p>
                        </div>

                        <div className="form-group">
                            <label>City *</label>
                            <input
                                type="text"
                                name="location.city"
                                value={formData.location.city}
                                onChange={handleChange}
                                required
                                placeholder="Nairobi"
                            />
                        </div>

                        <div className="form-group">
                            <label>Country *</label>
                            <input
                                type="text"
                                name="location.country"
                                value={formData.location.country}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="form-section">
                    <h2>Property Images</h2>
                    <div className="images-list">
                        {imageUrls.map((url, index) => (
                            <div key={index} className="image-input-group">
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                                {imageUrls.length > 1 && (
                                    <button type="button" onClick={() => removeImageUrl(index)} className="remove-btn">
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addImageUrl} className="add-image-btn">
                            <Plus size={18} />
                            <span>Add Image URL</span>
                        </button>
                    </div>
                </div>

                {/* Features */}
                <div className="form-section">
                    <h2>Features & Amenities</h2>
                    <div className="features-input">
                        <input
                            type="text"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="e.g., Swimming Pool, Gym, Parking"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        />
                        <button type="button" onClick={addFeature} className="add-feature-btn">
                            <Plus size={18} />
                            Add
                        </button>
                    </div>
                    <div className="features-list">
                        {formData.features.map((feature, index) => (
                            <div key={index} className="feature-tag">
                                <span>{feature}</span>
                                <button type="button" onClick={() => removeFeature(index)}>
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/agent/properties')} className="btn-cancel">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-submit">
                        {loading ? 'Saving...' : (isEditMode ? 'Update Property' : 'Create Property')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AgentPropertyForm;
