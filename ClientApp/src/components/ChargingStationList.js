// c:\Coding\ev-charging-app\ClientApp\src\components\ChargingStationList.js
import React, { useState, useMemo, useEffect, useRef, createRef } from 'react';
import RouteDirections from './RouteDirections'; // Import the new component

// Helper function to determine badge class based on status
const getStatusBadge = (statusTitle) => {
    const title = statusTitle?.toLowerCase() || 'unknown';
    if (title.includes('operational') || title.includes('available')) {
        return 'badge bg-success me-1';
    } else if (title.includes('in use') || title.includes('charging')) {
        return 'badge bg-primary me-1';
    } else if (title.includes('unavailable') || title.includes('out of order') || title.includes('not operational')) {
        return 'badge bg-danger me-1';
    } else if (title.includes('planned') || title.includes('under construction')) {
        return 'badge bg-warning text-dark me-1';
    }
    return 'badge bg-secondary me-1';
};

const ChargingStationList = ({ 
    searchParams, 
    stations: stationsFromProps, 
    isLoadingStations, 
    stationsError: errorFromProps,
    onStationRouteRequest, 
    selectedStationRoute, 
    routeLoadingForStationId, 
    routeError,
    highlightedStationId,
    onStationListItemClick,
    preferredConnectorTypes, // Destructure the new prop
    routeElevationInfo // Add new prop for elevation info
}) => {
    const stationRefs = useRef({});

    // Local state for client-side filtering message
    const [clientFilterMessage, setClientFilterMessage] = useState(null);

    // Client-side filtering based on rangeKm from searchParams
    const stationsToDisplay = useMemo(() => {
        setClientFilterMessage(null); 
        if (!stationsFromProps || stationsFromProps.length === 0) {
            return [];
        }
        let filteredByRange = stationsFromProps;
        if (searchParams && searchParams.rangeKm) {
            const rangeInMiles = parseFloat(searchParams.rangeKm) * 0.621371;
            filteredByRange = stationsFromProps.filter(station => 
                station.AddressInfo && typeof station.AddressInfo.Distance === 'number' && 
                station.AddressInfo.Distance <= rangeInMiles
            );
            if (stationsFromProps.length > 0 && filteredByRange.length === 0) {
                setClientFilterMessage(`No stations found within your specified range of ${searchParams.rangeKm} km from the ${stationsFromProps.length} stations initially loaded for your area.`);
                return []; // Return early if no stations match range
            }
        }

        // Further filter by preferredConnectorTypes
        if (preferredConnectorTypes && preferredConnectorTypes.length > 0) {
            const filteredByConnector = filteredByRange.filter(station => 
                station.Connections && station.Connections.some(conn => 
                    conn.ConnectionType && preferredConnectorTypes.includes(conn.ConnectionType.Title)
                )
            );
            if (filteredByRange.length > 0 && filteredByConnector.length === 0) {
                setClientFilterMessage(prevMessage => 
                    (prevMessage ? prevMessage + ' ' : '') + 
                    `Additionally, no stations match your preferred connector types: ${preferredConnectorTypes.join(', ')}.`
                );
            }
            return filteredByConnector;
        }

        return filteredByRange; // If no connector types preference, return range-filtered list
    }, [stationsFromProps, searchParams, preferredConnectorTypes]);


    // Ensure refs are created for each station in the current display list
    useEffect(() => {
        const newRefs = {};
        stationsToDisplay.forEach(station => {
            newRefs[station.ID] = stationRefs.current[station.ID] || createRef();
        });
        stationRefs.current = newRefs;
    }, [stationsToDisplay]);


    useEffect(() => {
        if (highlightedStationId && stationRefs.current[highlightedStationId] && stationRefs.current[highlightedStationId].current) {
            stationRefs.current[highlightedStationId].current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, [highlightedStationId, stationsToDisplay]); // Rerun if highlightedStationId or stationsToDisplay change

    const handleStationSelect = (station) => {
        if (onStationRouteRequest) {
            onStationRouteRequest(station);
        }
    };
    
    // useEffect to log route data (optional, for debugging)
    useEffect(() => {
        if (selectedStationRoute && selectedStationRoute.routes && selectedStationRoute.routes.length > 0) {
            const stationTitle = stationsToDisplay.find(s => 
                s.AddressInfo.Longitude === selectedStationRoute.routes[0].summary.query.coordinates[1][0] && 
                s.AddressInfo.Latitude === selectedStationRoute.routes[0].summary.query.coordinates[1][1]
            )?.AddressInfo.Title || 'selected station';
            const summary = selectedStationRoute.routes[0].summary;
            console.log(`ChargingStationList: Route to ${stationTitle}: Distance: ${(summary.distance/1000).toFixed(2)} km, Duration: ${(summary.duration/60).toFixed(2)} mins`);
        }
    }, [selectedStationRoute, stationsToDisplay]);

    if (isLoadingStations) {
        return <p><em>Loading station data...</em></p>;
    }

    if (errorFromProps) {
        return <p style={{ color: 'red' }}>Error loading stations: {errorFromProps}</p>;
    }

    if (clientFilterMessage) {
        return <p style={{ color: 'orange' }}><em>{clientFilterMessage}</em></p>;
    }

    if (!stationsToDisplay || stationsToDisplay.length === 0) {
        return <p><em>No charging stations found matching your criteria.</em></p>;
    }

    return (
        <div className="mt-4">
            <style>
                {`
                    tr.highlighted-station td {
                        background-color: #e7f3ff !important; /* Light blue highlight for table cells */
                    }
                    tr.highlighted-station {
                        border: 2px solid #007bff;
                    }
                `}
            </style>
            <h3>Available Charging Stations</h3>
            <div className="table-responsive"> {/* Added for better responsiveness on small screens */}
                <table className='table table-striped table-hover' aria-labelledby="tabelLabel">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Distance (Miles)</th>
                            <th>Connections</th>
                            <th>Overall Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stationsToDisplay.map(station => (
                            <tr 
                                key={station.ID} 
                                ref={el => stationRefs.current[station.ID] = el}
                                style={station.ID === highlightedStationId ? { backgroundColor: '#e0f3ff', fontWeight: 'bold', cursor: 'pointer' } : { cursor: 'pointer' }}
                                onClick={() => onStationListItemClick && onStationListItemClick(station)}
                            >
                                <td>{station.AddressInfo?.Title || 'N/A'}</td>
                                <td>
                                    {station.AddressInfo?.AddressLine1 || ''}, {station.AddressInfo?.Town || ''}, {station.AddressInfo?.StateOrProvince || ''} {station.AddressInfo?.Postcode || ''}
                                </td>
                                <td>
                                    {station.AddressInfo?.Distance?.toFixed(2) || 'N/A'}
                                    {searchParams && searchParams.rangeKm && station.AddressInfo && typeof station.AddressInfo.Distance === 'number' && 
                                     (station.AddressInfo.Distance > (parseFloat(searchParams.rangeKm) * 0.621371)) && (
                                        <><br /><small style={{ color: 'orange' }}>(Potentially out of range)</small></>
                                    )}
                                </td>
                                {station.Connections && station.Connections.length > 0 ? (
                                    <td colSpan="4"> 
                                      <h6>Connectors:</h6>
                                      <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                        {station.Connections.map((conn, index) => (
                                          <div key={conn.ID || index} className="mb-2 p-2 border rounded" style={{ fontSize: '0.9em' }}>
                                            <p className="mb-0">
                                              <strong>Type:</strong> {conn.ConnectionType?.Title || 'N/A'}
                                              {conn.Level?.Title && <span className="badge bg-info ms-2">{conn.Level.Title}</span>}
                                            </p>
                                            <p className="mb-0">
                                              <strong>Power:</strong> {conn.PowerKW != null ? `${conn.PowerKW} kW` : 'N/A'}
                                              {conn.CurrentType?.Title && <span className="badge bg-secondary ms-2">{conn.CurrentType.Title}</span>}
                                            </p>
                                            <p className="mb-0">
                                              <strong>Quantity:</strong> {conn.Quantity != null ? conn.Quantity : 'N/A'}
                                              {conn.StatusType?.Title && 
                                                <span className={`badge ms-2 ${conn.StatusType?.IsOperational === true ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                  {conn.StatusType.Title}
                                                </span>
                                              }
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </td>
                                  ) : (
                                    <td colSpan="4">No connection details available.</td>
                                  )}
                                <td>
                                    <span className={getStatusBadge(station.StatusType?.Title)}>
                                        {station.StatusType?.Title || 'N/A'}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-info"
                                        onClick={() => handleStationSelect(station)}
                                        disabled={routeLoadingForStationId === station.ID}
                                    >
                                        {routeLoadingForStationId === station.ID ? 'Loading...' : 'Get Route'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Route Information Display - Moved outside the loop and table */}
            {routeError && <p className="mt-3 alert alert-danger">Route Error: {routeError}</p>}
            
            {selectedStationRoute && selectedStationRoute.routes && selectedStationRoute.routes.length > 0 && (
                <div className="mt-3 alert alert-info">
                    <h4>Route Information:</h4>
                    <p><strong>To:</strong> {
                        stationsToDisplay.find(s => 
                            s.AddressInfo.Longitude === selectedStationRoute.routes[0].summary.query.coordinates[1][0] && 
                            s.AddressInfo.Latitude === selectedStationRoute.routes[0].summary.query.coordinates[1][1]
                        )?.AddressInfo.Title || 
                        `Lat: ${selectedStationRoute.routes[0].summary.query.coordinates[1][1]}, Lon: ${selectedStationRoute.routes[0].summary.query.coordinates[1][0]}`
                    }</p>
                    <p><strong>Distance:</strong> {(selectedStationRoute.routes[0].summary.distance / 1000).toFixed(2)} km</p>
                    <p><strong>Estimated Duration:</strong> {(selectedStationRoute.routes[0].summary.duration / 60).toFixed(2)} minutes</p>
                    {searchParams && searchParams.rangeKm && (
                        <p style={{
                            fontWeight: 'bold', 
                            color: (selectedStationRoute.routes[0].summary.distance / 1000) <= searchParams.rangeKm ? 'green' : 'red' 
                        }}>
                            {(selectedStationRoute.routes[0].summary.distance / 1000) <= searchParams.rangeKm 
                                ? `This station is within your specified range of ${searchParams.rangeKm} km.`
                                : `This station is BEYOND your specified range of ${searchParams.rangeKm} km.`
                            }
                        </p>
                    )}
                    {/* Display Turn-by-Turn Directions */}
                    {selectedStationRoute.routes[0].segments && 
                     selectedStationRoute.routes[0].segments.length > 0 && 
                     selectedStationRoute.routes[0].segments[0].steps && (
                        <RouteDirections steps={selectedStationRoute.routes[0].segments[0].steps} elevationInfo={routeElevationInfo} />
                    )}
                </div>
            )}
        </div>
    );
};

export default ChargingStationList;
