"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, GeoJSON } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
})

// Component to handle map panning/zooming when focusCoordinates change
const MapFlyToFocus = ({ coordinates, zoom }) => {
  const map = useMap()
  useEffect(() => {
    if (coordinates && coordinates.length === 2) {
      map.flyTo(coordinates, zoom)
    }
  }, [coordinates, zoom, map])
  return null
}

// Custom icons
const userMarkerIcon = L.divIcon({
  html: `<div style="
        background-color: #0ea5e9;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
    ">
        <div style="
            background-color: white;
            width: 8px;
            height: 8px;
            border-radius: 50%;
        "></div>
    </div>`,
  className: "custom-user-marker",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
})

const chargingStationIcon = L.divIcon({
  html: `<div style="
        background-color: #22c55e;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
    ">⚡</div>`,
  className: "custom-charging-marker",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
})

const highlightedChargingStationIcon = L.divIcon({
  html: `<div style="
        background-color: #0ea5e9;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        font-weight: bold;
        animation: pulse 2s infinite;
    ">⚡</div>
    <style>
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    </style>`,
  className: "custom-highlighted-marker",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
})

const trafficIncidentIcon = L.divIcon({
  html: `<div style="
        background-color: #f59e0b;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
    ">!</div>`,
  className: "custom-traffic-marker",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
})

const MapDisplay = ({
  stations,
  userLatitude,
  userLongitude,
  trafficIncidents,
  selectedRoute,
  onStationMarkerClick,
  highlightedStationId,
  focusCoordinates,
  onRouteRequestFromPopup,
}) => {
  const [mapInstance, setMapInstance] = useState(null)
  const mapFocusZoom = 15

  // Default center (Los Angeles if no user location)
  const defaultCenter = [34.0522, -118.2437]
  const center = userLatitude && userLongitude ? [userLatitude, userLongitude] : defaultCenter
  const zoom = userLatitude && userLongitude ? 12 : 10

  useEffect(() => {
    if (mapInstance && selectedRoute && userLatitude && userLongitude) {
      try {
        const routeLayer = L.geoJSON(selectedRoute)
        let bounds = routeLayer.getBounds()

        const userLatLng = L.latLng(userLatitude, userLongitude)
        bounds = bounds.extend(userLatLng)

        if (selectedRoute.features && selectedRoute.features[0]?.geometry?.coordinates) {
          const coords = selectedRoute.features[0].geometry.coordinates
          const endPoint = coords[coords.length - 1]
          const destinationLatLng = L.latLng(endPoint[1], endPoint[0])
          bounds = bounds.extend(destinationLatLng)
        }

        mapInstance.fitBounds(bounds, { padding: [50, 50] })
      } catch (error) {
        console.error("Error fitting bounds:", error)
      }
    }
  }, [mapInstance, selectedRoute, userLatitude, userLongitude])

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      whenCreated={setMapInstance}
      className="rounded-lg"
    >
      <MapFlyToFocus coordinates={focusCoordinates} zoom={mapFocusZoom} />

      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Street Map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {/* User Location Marker */}
      {userLatitude && userLongitude && (
        <Marker position={[userLatitude, userLongitude]} icon={userMarkerIcon}>
          <Popup>
            <div className="text-center">
              <strong>Your Location</strong>
              <br />
              <small>
                Lat: {userLatitude.toFixed(4)}, Lng: {userLongitude.toFixed(4)}
              </small>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Charging Station Markers */}
      {stations &&
        stations.map(
          (station) =>
            station.AddressInfo &&
            typeof station.AddressInfo.Latitude === "number" &&
            typeof station.AddressInfo.Longitude === "number" && (
              <Marker
                key={station.ID}
                position={[station.AddressInfo.Latitude, station.AddressInfo.Longitude]}
                icon={highlightedStationId === station.ID ? highlightedChargingStationIcon : chargingStationIcon}
                eventHandlers={{
                  click: () => {
                    if (onStationMarkerClick) {
                      onStationMarkerClick(station)
                    }
                  },
                }}
              >
                <Popup maxWidth={300} className="custom-popup">
                  <div className="p-2">
                    <h4 className="font-semibold text-gray-900 mb-2">{station.AddressInfo.Title}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {station.AddressInfo.AddressLine1}
                      <br />
                      {station.AddressInfo.Town}, {station.AddressInfo.StateOrProvince} {station.AddressInfo.Postcode}
                    </p>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Distance:</span>
                        <span className="text-sm">{station.AddressInfo.Distance?.toFixed(1)} mi</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <span
                          className={`badge text-xs ${
                            station.StatusType?.IsOperational ? "badge-success" : "badge-warning"
                          }`}
                        >
                          {station.StatusType?.Title || "Unknown"}
                        </span>
                      </div>
                    </div>

                    {station.Connections && station.Connections.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium mb-2">Connectors:</h5>
                        <div className="max-h-24 overflow-y-auto space-y-1">
                          {station.Connections.slice(0, 3).map((conn, index) => (
                            <div key={conn.ID || index} className="text-xs bg-gray-50 p-1 rounded">
                              <div className="flex justify-between">
                                <span className="font-medium">{conn.ConnectionType?.Title || "Unknown"}</span>
                                <span>{conn.PowerKW || 0} kW</span>
                              </div>
                              {conn.StatusType?.Title && (
                                <div
                                  className={`badge text-xs mt-1 ${
                                    conn.StatusType?.IsOperational ? "badge-success" : "badge-warning"
                                  }`}
                                >
                                  {conn.StatusType.Title}
                                </div>
                              )}
                            </div>
                          ))}
                          {station.Connections.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{station.Connections.length - 3} more connectors
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {onRouteRequestFromPopup && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRouteRequestFromPopup(station)
                        }}
                        className="btn btn-primary btn-sm w-full"
                      >
                        Get Directions
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ),
        )}

      {/* Traffic Incident Markers */}
      {trafficIncidents &&
        trafficIncidents.map((incident, index) => {
          if (
            !incident.position ||
            typeof incident.position.lat !== "number" ||
            typeof incident.position.lon !== "number"
          ) {
            return null
          }

          return (
            <Marker
              key={`traffic-${incident.id || index}`}
              position={[incident.position.lat, incident.position.lon]}
              icon={trafficIncidentIcon}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-warning-700 mb-1">{incident.poi?.name || "Traffic Incident"}</h4>
                  <p className="text-sm text-gray-600">Category: {incident.poi?.categories?.join(", ") || "N/A"}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {incident.position.lat.toFixed(5)}, {incident.position.lon.toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}

      {/* Route Display */}
      {selectedRoute && (
        <GeoJSON
          key={JSON.stringify(selectedRoute)}
          data={selectedRoute}
          style={() => ({
            color: "#0ea5e9",
            weight: 4,
            opacity: 0.8,
            dashArray: "5, 10",
          })}
        />
      )}
    </MapContainer>
  )
}

export default MapDisplay
