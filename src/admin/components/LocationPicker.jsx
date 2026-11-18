import { useState, useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation, Search, X, Loader2 } from 'lucide-react';
import './LocationPicker.css';

// Fix Leaflet's default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Helper component to recenter map view
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15, { duration: 1.2 });
        }
    }, [center, map]);
    return null;
}

// Click event listener on map
function MapClickHandler({ onClick }) {
    useMapEvents({
        click(e) {
            onClick(e.latlng);
        },
    });
    return null;
}

export default function LocationPicker({ value = {}, onChange }) {
    const defaultCenter = [-1.286389, 36.817223]; // Nairobi
    const [position, setPosition] = useState(
        value.latitude && value.longitude
            ? [parseFloat(value.latitude), parseFloat(value.longitude)]
            : defaultCenter
    );
    const [hasPicked, setHasPicked] = useState(Boolean(value.latitude && value.longitude));
    const [searchQuery, setSearchQuery] = useState(value.address || '');
    const [searching, setSearching] = useState(false);
    const [geolocating, setGeolocating] = useState(false);

    // Reverse geocode via OpenStreetMap Nominatim
    const reverseGeocode = async (lat, lng) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
            );
            const data = await res.json();
            if (data && data.display_name) {
                const address = data.display_name;
                const addr = data.address || {};
                const city = addr.suburb || addr.neighbourhood || addr.city || addr.town || addr.county || 'Nairobi, Kenya';
                setSearchQuery(address);
                onChange({
                    latitude: lat,
                    longitude: lng,
                    address: address,
                    location: city
                });
            } else {
                onChange({
                    latitude: lat,
                    longitude: lng,
                    address: value.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
                    location: value.location || 'Kenya'
                });
            }
        } catch {
            onChange({
                latitude: lat,
                longitude: lng,
                address: value.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
                location: value.location || 'Kenya'
            });
        }
    };

    // Forward geocode via Nominatim
    const handleSearchSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Kenya')}&limit=1`
            );
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                setPosition([lat, lng]);
                setHasPicked(true);
                reverseGeocode(lat, lng);
            }
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setSearching(false);
        }
    };

    // User GPS Geolocation
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        setGeolocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setPosition([lat, lng]);
                setHasPicked(true);
                reverseGeocode(lat, lng);
                setGeolocating(false);
            },
            (err) => {
                console.warn('Geolocation error:', err.message);
                alert('Could not retrieve your location. Please check browser permissions.');
                setGeolocating(false);
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    };

    const handleMapClick = (latlng) => {
        const { lat, lng } = latlng;
        setPosition([lat, lng]);
        setHasPicked(true);
        reverseGeocode(lat, lng);
    };

    const handleClear = () => {
        setPosition(defaultCenter);
        setHasPicked(false);
        setSearchQuery('');
        onChange({ latitude: '', longitude: '', address: '', location: '' });
    };

    return (
        <div className="location-picker">
            <div className="location-controls-bar">
                <form className="location-search-wrap" onSubmit={handleSearchSubmit}>
                    <MapPin size={16} className="location-pin-icon" />
                    <input
                        type="text"
                        className="location-search-input"
                        placeholder="Search address, neighbourhood, city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button type="button" className="location-clear-btn" onClick={handleClear} title="Clear">
                            <X size={13} />
                        </button>
                    )}
                </form>

                <button
                    type="button"
                    className="location-locate-btn"
                    onClick={handleUseCurrentLocation}
                    disabled={geolocating}
                    title="Detect my current GPS location"
                >
                    {geolocating ? <Loader2 size={16} className="spin" /> : <Navigation size={16} />}
                    <span>{geolocating ? 'Locating...' : 'Use My Geolocation'}</span>
                </button>
            </div>

            <div className="location-map-container">
                <MapContainer
                    center={position}
                    zoom={hasPicked ? 15 : 12}
                    scrollWheelZoom={false}
                    style={{ width: '100%', height: '240px', borderRadius: '12px' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ChangeView center={position} />
                    <MapClickHandler onClick={handleMapClick} />
                    {hasPicked && <Marker position={position} />}
                </MapContainer>
            </div>

            <div className="location-picker-caption">
                <span>📍 Click anywhere on the map or drag to set the exact pin coordinates</span>
                {value.latitude && value.longitude && (
                    <span className="location-coords">
                        GPS: {parseFloat(value.latitude).toFixed(4)}, {parseFloat(value.longitude).toFixed(4)}
                    </span>
                )}
            </div>
        </div>
    );
}
