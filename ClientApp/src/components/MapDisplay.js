import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap, 
  LayersControl, 
  GeoJSON 
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom User Location Icon
// Component to handle map panning/zooming when mapFocusCoordinates change
const MapFlyToFocus = ({ coordinates, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (coordinates && coordinates.length === 2) {
            map.flyTo(coordinates, zoom);
        }
    }, [coordinates, zoom, map]);
    return null;
};

const userMarkerIcon = L.icon({
    iconUrl: process.env.PUBLIC_URL + '/assets/icons/user-marker.png', // Assuming icon is in public/assets/icons
    iconRetinaUrl: process.env.PUBLIC_URL + '/assets/icons/user-marker.png', // Or a 2x version if available
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    shadowSize: [41, 41]
});

// Custom Traffic Incident Icon
const trafficIncidentIcon = L.icon({
    iconUrl: process.env.PUBLIC_URL + '/assets/icons/traffic-warning.png', // Assuming icon is in public/assets/icons
    iconRetinaUrl: process.env.PUBLIC_URL + '/assets/icons/traffic-warning.png',
    iconSize: [25, 25], // Adjust size as needed
    iconAnchor: [12, 25], // Adjust anchor as needed
    popupAnchor: [1, -24],
    // No shadow for this one, or a smaller one if preferred
});

// Custom Charging Station Icon
const chargingStationIcon = L.icon({
    iconUrl: process.env.PUBLIC_URL + '/assets/icons/charging-station.png',
    iconRetinaUrl: process.env.PUBLIC_URL + '/assets/icons/charging-station.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    shadowSize: [41, 41]
});

// Custom Highlighted Station Icon
const highlightedChargingStationIcon = L.icon({
    iconUrl: process.env.PUBLIC_URL + '/assets/icons/charging-station.png', // Use the standard icon image
    iconRetinaUrl: process.env.PUBLIC_URL + '/assets/icons/charging-station.png', // Use the standard retina icon image
    iconSize: [35, 58],     // Larger size for highlight (original [25, 41])
    iconAnchor: [17, 58],   // Adjusted anchor for larger size
    popupAnchor: [1, -50],  // Adjusted popup anchor for larger size
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'), // Keep shadow
    shadowSize: [58, 58],   // Scaled shadow size
    className: 'highlighted-map-marker' // Optional: for additional CSS if needed
});

const MapDisplay = ({ stations, userLocation, routeGeoJson, trafficIncidents, onStationMarkerClick, highlightedStationId, mapFocusCoordinates, onGetRouteClick }) => {
    const [mapInstance, setMapInstance] = useState(null);
    const mapFocusZoom = 15; // Desired zoom level when focusing on a station

    useEffect(() => {
        if (mapInstance && routeGeoJson && userLocation) {
            try {
                const routeLayer = L.geoJSON(routeGeoJson);
                let bounds = routeLayer.getBounds();
                
                // Ensure userLocation is L.latLng
                const userLatLng = L.latLng(userLocation[0], userLocation[1]);
                bounds = bounds.extend(userLatLng);

                // Also include the destination marker if not already covered by route bounds
                if (routeGeoJson.coordinates && routeGeoJson.coordinates.length > 0) {
                    const endPointCoords = routeGeoJson.coordinates[routeGeoJson.coordinates.length -1];
                    // For LineString, coordinates are [lon, lat]. For Point, it's [lon, lat].
                    // GeoJSON standard is [longitude, latitude]
                    const destinationLatLng = L.latLng(endPointCoords[1], endPointCoords[0]); 
                    bounds = bounds.extend(destinationLatLng);
                }

                mapInstance.fitBounds(bounds, { padding: [50, 50] });
            } catch (error) {
                console.error("Error fitting bounds:", error);
                // Fallback or error handling if bounds cannot be determined
            }
        } else if (mapInstance && userLocation && !routeGeoJson) {
            // If no route, but user location is present, ensure map is centered on user
            // This might be redundant if 'center' prop is already userLocation
            // mapInstance.setView(userLocation, zoom);
        }
    }, [mapInstance, routeGeoJson, userLocation]);

    return (
        <MapContainer 
            style={{ height: '500px', width: '100%' }} 
            whenCreated={setMapInstance} // Get map instance
        >
            <MapFlyToFocus coordinates={mapFocusCoordinates} zoom={mapFocusZoom} />
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="OpenStreetMap">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite Imagery">
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA FSA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    />
                </LayersControl.BaseLayer>
            </LayersControl>
            {stations && stations.map(station => (
                station.AddressInfo && typeof station.AddressInfo.Latitude === 'number' && typeof station.AddressInfo.Longitude === 'number' && (
                    <Marker 
                        key={station.ID} 
                        position={[station.AddressInfo.Latitude, station.AddressInfo.Longitude]}
                        icon={highlightedStationId === station.ID ? highlightedChargingStationIcon : chargingStationIcon}
                        eventHandlers={{
                            click: () => {
                                if (onStationMarkerClick) {
                                    // Pass LatLng as well if needed by handler, for now just ID
                                    onStationMarkerClick(station.ID, station.AddressInfo.Latitude, station.AddressInfo.Longitude);
                                }
                            }
                        }}
                    >
                        <Popup>
                            <strong>{station.AddressInfo.Title}</strong><br />
                            {station.AddressInfo.AddressLine1}<br />
                            {station.AddressInfo.Town}, {station.AddressInfo.StateOrProvince} {station.AddressInfo.Postcode}<br />
                            <h6>Connectors:</h6>
                            {station.Connections && station.Connections.length > 0 ? (
                                <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '0.85em' }}>
                                    {station.Connections.map((conn, index) => (
                                        <div key={conn.ID || index} className="mb-1 border-bottom pb-1">
                                            <p className="mb-0">
                                                <strong>Type:</strong> {conn.ConnectionType?.Title || 'N/A'}
                                                {conn.Level?.Title && <span className="badge bg-info ms-1" style={{fontSize: '0.75em'}}>{conn.Level.Title}</span>}
                                            </p>
                                            <p className="mb-0">
                                                <strong>Power:</strong> {conn.PowerKW != null ? `${conn.PowerKW} kW` : 'N/A'}
                                                {conn.CurrentType?.Title && <span className="badge bg-secondary ms-1" style={{fontSize: '0.75em'}}>{conn.CurrentType.Title}</span>}
                                            </p>
                                            <p className="mb-0">
                                                <strong>Qty:</strong> {conn.Quantity != null ? conn.Quantity : 'N/A'}
                                                {conn.StatusType?.Title &&
                                                    <span className={`badge ms-1 ${conn.StatusType?.IsOperational === true ? 'bg-success' : 'bg-warning text-dark'}`} style={{fontSize: '0.75em'}}>
                                                        {conn.StatusType.Title}
                                                    </span>
                                                }
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{fontSize: '0.85em'}}>No connection details available.</p>
                            )}
                            Distance: {station.AddressInfo.Distance?.toFixed(2)} km<br />
                            {onGetRouteClick && (
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); // Prevent popup from closing if that's an issue
                                        onGetRouteClick(station);
                                    }} 
                                    className="btn btn-primary btn-sm mt-2"
                                >
                                    Get Route
                                </button>
                            )}
                        </Popup>
                    </Marker>
                )
            ))}
            {userLocation && (
                <Marker position={userLocation} icon={userMarkerIcon}>
                    <Popup>You are here</Popup>
                </Marker>
            )}
            {routeGeoJson && (
                <GeoJSON 
                    key={JSON.stringify(routeGeoJson)} // Ensures re-render if GeoJSON object changes
                    data={routeGeoJson} 
                    style={() => ({ color: 'blue', weight: 5 })} 
                />
            )}
            {/* Render Traffic Incidents */}
            {trafficIncidents && trafficIncidents.map((incident, index) => {
                if (!incident.position || typeof incident.position.lat !== 'number' || typeof incident.position.lon !== 'number') {
                    console.warn('Skipping traffic incident due to missing or invalid position:', incident);
                    return null;
                }
                const incidentName = incident.poi?.name || 'Traffic Incident';
                const incidentCategory = incident.poi?.categories?.join(', ') || 'N/A';

                return (
                    <Marker 
                        key={`traffic-${incident.id || index}`} // Use incident.id if available, otherwise index
                        position={[incident.position.lat, incident.position.lon]}
                        icon={trafficIncidentIcon}
                    >
                        <Popup>
                            <strong>{incidentName}</strong><br />
                            Category: {incidentCategory}<br />
                            Lat: {incident.position.lat.toFixed(5)}, Lon: {incident.position.lon.toFixed(5)}
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

export default MapDisplay;
