import { useState, useRef, useEffect, useCallback } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import { MapPin, X } from 'lucide-react';
import './LocationPicker.css';

const LIBRARIES = ['places'];
const MAP_CONTAINER_STYLE = { width: '100%', height: '220px', borderRadius: '10px' };

export default function LocationPicker({ value, onChange }) {
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const [mapCenter, setMapCenter] = useState(
        value.latitude && value.longitude
            ? { lat: parseFloat(value.latitude), lng: parseFloat(value.longitude) }
            : { lat: -1.286389, lng: 36.817223 } // Nairobi default
    );
    const [markerPos, setMarkerPos] = useState(
        value.latitude && value.longitude
            ? { lat: parseFloat(value.latitude), lng: parseFloat(value.longitude) }
            : null
    );

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
    });

    // Init autocomplete once the script loads and the input is mounted
    useEffect(() => {
        if (!isLoaded || !inputRef.current) return;

        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
            fields: ['geometry', 'formatted_address', 'name', 'address_components'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace();
            if (!place.geometry) return;

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const address = place.formatted_address || place.name || '';

            // Extract city / area for the "location" field
            let city = '';
            const ac = place.address_components || [];
            const locality = ac.find(c => c.types.includes('locality'));
            const sublocality = ac.find(c => c.types.includes('sublocality') || c.types.includes('sublocality_level_1'));
            const country = ac.find(c => c.types.includes('country'));
            if (sublocality) city = sublocality.long_name;
            else if (locality) city = locality.long_name;
            if (country) city = city ? `${city}, ${country.long_name}` : country.long_name;

            setMapCenter({ lat, lng });
            setMarkerPos({ lat, lng });
            onChange({ latitude: lat, longitude: lng, address, location: city || address });
        });

        return () => {
            if (autocompleteRef.current) {
                window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, [isLoaded]);

    const handleMapClick = useCallback((e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPos({ lat, lng });
        setMapCenter({ lat, lng });

        // Reverse geocode
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address;
                if (inputRef.current) inputRef.current.value = address;

                const ac = results[0].address_components || [];
                const locality = ac.find(c => c.types.includes('locality'));
                const sublocality = ac.find(c => c.types.includes('sublocality'));
                const country = ac.find(c => c.types.includes('country'));
                let city = sublocality?.long_name || locality?.long_name || '';
                if (country) city = city ? `${city}, ${country.long_name}` : country.long_name;

                onChange({ latitude: lat, longitude: lng, address, location: city || address });
            }
        });
    }, [onChange]);

    const handleClear = () => {
        if (inputRef.current) inputRef.current.value = '';
        setMarkerPos(null);
        setMapCenter({ lat: -1.286389, lng: 36.817223 });
        onChange({ latitude: '', longitude: '', address: '', location: '' });
    };

    if (!isLoaded) {
        return (
            <div className="location-picker-loading">
                <MapPin size={16} />
                <span>Loading map...</span>
            </div>
        );
    }

    return (
        <div className="location-picker">
            {/* Search Input */}
            <div className="location-search-wrap">
                <MapPin size={16} className="location-pin-icon" />
                <input
                    ref={inputRef}
                    type="text"
                    defaultValue={value.address || ''}
                    placeholder="Search address, neighbourhood, city..."
                    className="location-search-input"
                    autoComplete="off"
                />
                {(value.address || value.latitude) && (
                    <button type="button" className="location-clear-btn" onClick={handleClear} title="Clear location">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Coordinates display */}
            {value.latitude && value.longitude && (
                <div className="location-coords-row">
                    <span>Lat: <strong>{parseFloat(value.latitude).toFixed(6)}</strong></span>
                    <span>Lng: <strong>{parseFloat(value.longitude).toFixed(6)}</strong></span>
                    {value.location && <span className="location-city-tag"><MapPin size={11} />{value.location}</span>}
                </div>
            )}

            {/* Map */}
            <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={mapCenter}
                zoom={markerPos ? 15 : 12}
                onClick={handleMapClick}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                }}
            >
                {markerPos && <Marker position={markerPos} />}
            </GoogleMap>
            <p className="location-map-hint">Click anywhere on the map to set exact pin location</p>
        </div>
    );
}
