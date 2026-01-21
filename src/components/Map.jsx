import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './Map.css';

const containerStyle = {
    width: '100%',
    height: '400px'
};

const Map = ({ center, address, zoom = 15 }) => {
    // Default center: Nairobi, Kenya
    const defaultCenter = { lat: -1.2921, lng: 36.8219 };

    // Determine the map center
    const mapCenter = center && center.lat && center.lng
        ? { lat: parseFloat(center.lat), lng: parseFloat(center.lng) }
        : defaultCenter;

    return (
        <div className="map-wrapper">
            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={mapCenter}
                    zoom={zoom}
                    options={{
                        scrollwheel: false,
                        streetViewControl: false,
                        mapTypeControl: false
                    }}
                >
                    <Marker position={mapCenter} title={address || "Property Location"} />
                </GoogleMap>
            </LoadScript>
        </div>
    );
};

export default React.memo(Map);
