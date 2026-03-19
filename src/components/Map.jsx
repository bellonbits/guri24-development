import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const Map = ({ center, address, zoom = 14 }) => {
    const defaultCenter = [-1.2921, 36.8219]; // Nairobi

    let mapCenter = defaultCenter;
    if (center) {
        if (Array.isArray(center) && center.length >= 2) {
            mapCenter = [parseFloat(center[0]), parseFloat(center[1])];
        } else if (center.lat !== undefined && center.lng !== undefined) {
            mapCenter = [parseFloat(center.lat), parseFloat(center.lng)];
        }
    }

    return (
        <MapContainer
            key={`${mapCenter[0]}-${mapCenter[1]}`}
            center={mapCenter}
            zoom={zoom}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={false}
            zoomControl={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={mapCenter}>
                <Popup>{address || 'Property Location'}</Popup>
            </Marker>
        </MapContainer>
    );
};

export default React.memo(Map);
