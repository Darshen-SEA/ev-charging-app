import React, { useState, useEffect } from 'react';
import ChargingStationList from './ChargingStationList';
import UserInputForm from './UserInputForm';
import MapDisplay from './MapDisplay'; // Import MapDisplay
import RouteDirections from './RouteDirections';
import { fetchTrafficFlow } from '../services/tomTomService';
import { fetchChargingStations } from '../services/openChargeMapService';
import { fetchRoute } from '../services/openRouteService'; // Import fetchRoute for Home.js

// Converted Home to a functional component to use hooks for managing searchParams
// Define a list of common connector types that can be passed to the form
// In a real app, this might come from a config or an API call to OpenChargeMap's reference data
const COMMON_CONNECTOR_TYPES = [
  { ID: 1, Title: 'Type 1 (J1772)' },
  { ID: 25, Title: 'Type 2 (Socket Only)' }, // IEC 62196-2 Type 2 Socket
  { ID: 1036, Title: 'Type 2 (Tethered Connector)' }, // IEC 62196-2 Type 2 Tethered Cable
  { ID: 32, Title: 'CCS (Type 1)' }, // SAE J1772 Combo
  { ID: 33, Title: 'CCS (Type 2)' }, // Combined Charging System (Combo Type 2)
  { ID: 2, Title: 'CHAdeMO' },
  { ID: 8, Title: 'Tesla (Roadster)' }, // Tesla Proprietary, Gen1 (Roadster)
  { ID: 27, Title: 'Tesla (Model S/X)' }, // Tesla Proprietary, Gen2 (Model S/X)
  { ID: 30, Title: 'Tesla (CCS)' } // Tesla using CCS adapter or native CCS
  // Add other types as needed, ensure titles match what UserInputForm might expect or send
];

const Home = () => {
  const [searchParams, setSearchParams] = useState({
    latitude: null, // Default to null, will be set by geolocation or default
    longitude: null,
    distance: 25,
    minPower: 0, // Default to 0 (any power)
    preferredConnectorTypes: [], // Default to empty (any connector type)
  });
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(true); // Start in locating state

  const [trafficData, setTrafficData] = useState(null);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [trafficError, setTrafficError] = useState(null);

  // State for charging stations
  const [stations, setStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(true);
  const [stationsError, setStationsError] = useState(null);

  // State for Openrouteservice route
  const [selectedStationRoute, setSelectedStationRoute] = useState(null);
  const [routeLoadingForStationId, setRouteLoadingForStationId] = useState(null);
  const [routeError, setRouteError] = useState(null);
  const [highlightedStationId, setHighlightedStationId] = useState(null);
  const [mapFocusCoordinates, setMapFocusCoordinates] = useState(null);
  const [routeElevationInfo, setRouteElevationInfo] = useState(null);

  // Function to fetch current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSearchParams(prevParams => ({
            ...prevParams,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setIsLocating(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError(`Error: ${error.message}. Defaulting to Los Angeles.`);
          // Default to a fixed location if user denies or error occurs
          setSearchParams(prevParams => ({
            ...prevParams,
            latitude: 34.0522, // Default: Los Angeles
            longitude: -118.2437,
          }));
          setIsLocating(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser. Defaulting to Los Angeles.");
      setSearchParams(prevParams => ({
        ...prevParams,
        latitude: 34.0522, // Default: Los Angeles
        longitude: -118.2437,
      }));
      setIsLocating(false);
    }
  };

  // Get current location on initial component mount
  useEffect(() => {
    getCurrentLocation();
  }, []); // Empty dependency array means this runs once on mount

  // Effect to fetch traffic data when location changes
  useEffect(() => {
    if (searchParams.latitude && searchParams.longitude) {
      const fetchTraffic = async () => {
        setTrafficLoading(true);
        setTrafficError(null);
        try {
          // Calculate a bounding box based on current location and search distance
          const distanceInMiles = searchParams.distance || 25;
          const latDegrees = distanceInMiles / 69.0; // Approx miles per degree latitude
          const lonDegrees = distanceInMiles / (69.0 * Math.cos(searchParams.latitude * Math.PI / 180));

          const trafficApiParams = {
            north: searchParams.latitude + latDegrees,
            south: searchParams.latitude - latDegrees,
            east: searchParams.longitude + lonDegrees,
            west: searchParams.longitude - lonDegrees,
            zoom: 10, // Adjust zoom as needed, affects tile granularity if using tile-based APIs
          };
          console.log("Fetching traffic with params:", trafficApiParams);
          const data = await fetchTrafficFlow(trafficApiParams);
          setTrafficData(data);
        } catch (error) {
          console.error("Failed to fetch traffic data in Home component:", error);
          setTrafficError(error.message || "Failed to load traffic data.");
        } finally {
          setTrafficLoading(false);
        }
      };
      fetchTraffic();
    }
  }, [searchParams.latitude, searchParams.longitude, searchParams.distance]); // Re-fetch if location or distance changes

  // Effect to fetch charging stations when location or relevant search params change
  useEffect(() => {
    if (searchParams.latitude && searchParams.longitude) {
      const getStations = async () => {
        setStationsLoading(true);
        setStationsError(null);
        try {
          const apiParams = {
            latitude: searchParams.latitude,
            longitude: searchParams.longitude,
            distance: searchParams.distance || 25,
            maxresults: 50, // Or make this configurable if needed
            minpowerkw: searchParams.minPower > 0 ? searchParams.minPower : null, // Add minpowerkw to API params if > 0
            // connectiontypeid: searchParams.preferredConnectorTypes.join(','), // API expects comma-separated IDs, not titles. Client-side filtering for now for titles.
          };
          console.log("Home.js: Fetching stations with params:", apiParams);
          const data = await fetchChargingStations(apiParams);
          setStations(data || []);
        } catch (err) {
          console.error("Home.js: Failed to fetch stations:", err);
          setStationsError(err.message || 'Failed to fetch stations.');
          setStations([]);
        } finally {
          setStationsLoading(false);
        }
      };
      getStations();
    } else {
      // If no location, clear stations and set loading to false
      setStations([]);
      setStationsLoading(false);
    }
  }, [searchParams.latitude, searchParams.longitude, searchParams.distance, searchParams.minPower, searchParams.preferredConnectorTypes]); // Re-fetch if core location/distance or preferences change

  const handleSearchSubmit = (userInput) => {
    // Ensure lat/long are preserved if they were set by geolocation
    setSearchParams(prevParams => ({
      ...prevParams, // This keeps existing lat/long
      distance: userInput.searchRadius,
      batteryPercentage: userInput.batteryPercentage,
      rangeKm: userInput.rangeKm,
      minPower: userInput.minPower, // Add minPower from form
      preferredConnectorTypes: userInput.preferredConnectorTypes, // Add preferredConnectorTypes from form
    }));
  };

  // Handler for when a station is selected in ChargingStationList to get a route
  const estimateWaitTime = (station) => {
    if (!station.Connections || station.Connections.length === 0) return 0;
    
    // Calculate available connectors
    const availableConnectors = station.Connections.reduce((total, conn) => {
      const isAvailable = conn.StatusType?.IsOperational && 
                         !conn.StatusType.Title.toLowerCase().includes('in use');
      return total + (isAvailable ? (conn.Quantity || 1) : 0);
    }, 0);

    // Calculate total connectors
    const totalConnectors = station.Connections.reduce(
      (total, conn) => total + (conn.Quantity || 1), 0
    );

    // Base wait time based on availability (in minutes)
    let waitTime = 0;
    const availabilityRatio = availableConnectors / totalConnectors;
    
    if (availabilityRatio < 0.2) waitTime = 45; // Very busy
    else if (availabilityRatio < 0.5) waitTime = 20; // Busy
    else if (availabilityRatio < 0.8) waitTime = 10; // Some availability
    // else 0 minutes wait

    // Adjust based on time of day (example: peak hours)
    const now = new Date();
    const hour = now.getHours();
    if ((hour >= 7 && hour < 10) || (hour >= 16 && hour < 19)) {
      waitTime = Math.ceil(waitTime * 1.5); // 50% longer wait during peak hours
    }

    return waitTime;
  };

  const handleStationMarkerClick = (station) => {
    console.log("Home.js: Station marker clicked:", station);
    setHighlightedStationId(station.ID);
    // Optional: Pan map to this station if not already focused
    // setMapFocusCoordinates([station.AddressInfo.Latitude, station.AddressInfo.Longitude]);
  };

  // Handle when a station is clicked in the list
  const handleStationListItemClick = (station) => {
    setHighlightedStationId(station.ID);
    setMapFocusCoordinates([station.AddressInfo.Latitude, station.AddressInfo.Longitude]);
  };

  // Handle route request to a station
  const handleStationRouteRequest = async (station) => {
    if (!searchParams.latitude || !searchParams.longitude) {
      setRouteError("Your current location is not available to calculate a route.");
      setSelectedStationRoute(null);
      return;
    }
    
    if (!station.AddressInfo || typeof station.AddressInfo.Longitude !== 'number' || 
        typeof station.AddressInfo.Latitude !== 'number') {
      setRouteError("Selected station does not have valid coordinates for routing.");
      setSelectedStationRoute(null);
      return;
    }

    setRouteLoadingForStationId(station.ID);
    setSelectedStationRoute(null); // Clear previous route
    setRouteError(null); // Clear previous error

    try {
      // Get the route from user's location to the station
      const routeData = await fetchRoute({
        startCoordinates: [searchParams.longitude, searchParams.latitude],
        endCoordinates: [station.AddressInfo.Longitude, station.AddressInfo.Latitude],
        profile: 'driving-car',
      });

      if (routeData && routeData.features && routeData.features.length > 0) {
        // Calculate traffic delay if we have traffic data
        let trafficDelay = 0;
        if (trafficData && routeData.features[0]?.geometry?.coordinates) {
          const { calculateTrafficDelay } = await import('../services/tomTomService');
          trafficDelay = calculateTrafficDelay(
            routeData.features[0].geometry.coordinates,
            trafficData
          );
          
          if (trafficDelay > 0) {
            // Update the route duration with traffic delay
            const route = routeData.features[0].properties;
            route.duration += trafficDelay * 60; // Convert minutes to seconds
            if (route.summary) {
              route.summary.duration += trafficDelay * 60;
            }
          }
        }


        // Calculate estimated wait time at the station
        const waitTime = estimateWaitTime(station);
        
        // Add traffic and wait time information to the route data
        const enhancedRouteData = {
          ...routeData,
          trafficDelay,
          estimatedWaitTime: waitTime,
          totalTimeWithDelays: (routeData.features[0].properties.duration / 60) + trafficDelay + waitTime
        };

        setSelectedStationRoute(enhancedRouteData);
        setMapFocusCoordinates({
          lat: station.AddressInfo.Latitude,
          lng: station.AddressInfo.Longitude
        });
      } else {
        setRouteError("No route found to the selected station.");
      }
    } catch (error) {
      console.error('Error getting route to station:', error);
      setRouteError(error.message || 'Failed to get route to station');
    } finally {
      setRouteLoadingForStationId(null);
    }
  };

  return (
    <div>
      <h1>EV Charging Station Finder</h1> {/* Updated title */}
      {isLocating && <p><em>Locating you...</em></p>}
      {locationError && <p style={{ color: 'red' }}>{locationError}</p>}
      {!isLocating && searchParams.latitude && (
        <p>
          Current Location: Lat: {searchParams.latitude.toFixed(4)}, Lon: {searchParams.longitude.toFixed(4)}
          <button onClick={getCurrentLocation} className="btn btn-sm btn-outline-secondary ms-2">Re-center</button>
        </p>
      )}

      <MapDisplay 
        stations={stations} 
        userLatitude={searchParams.latitude}
        userLongitude={searchParams.longitude}
        trafficIncidents={trafficData ? trafficData.incidents : []} // Pass only incidents array
        selectedRoute={selectedStationRoute} // Pass the selected route GeoJSON
        onStationMarkerClick={handleStationMarkerClick} // Pass handler for marker click
        highlightedStationId={highlightedStationId}
        focusCoordinates={mapFocusCoordinates} // Pass focus coordinates
        onRouteRequestFromPopup={handleStationRouteRequest} // Pass route request handler
      />
      
      <hr />
      <UserInputForm onSubmit={handleSearchSubmit} availableConnectorTypes={COMMON_CONNECTOR_TYPES} />
      <hr />

      {/* Traffic Information Display */}
      {trafficLoading && <p><em>Loading traffic data...</em></p>}
      {trafficError && <p style={{ color: 'red' }}>Traffic Error: {trafficError}</p>}
      {trafficData && (
        <div>
          <p>Traffic Incidents in Area: {trafficData.incidents ? trafficData.incidents.length : 0}</p>
          {/* Consider rendering a small list or summary of incidents if needed */}
        </div>
      )}
      <hr />

      {/* Charging Station List Display */}
      {/* Charging Station List */}
      {isLocating && !searchParams.latitude && <p><em>Locating you...</em></p>} {/* Message while initially locating and no default is set yet*/}
      {stationsLoading && searchParams.latitude && <p><em>Loading charging stations...</em></p>}
      {stationsError && <p style={{ color: 'red' }}>Stations Error: {stationsError}</p>}
      {!isLocating && !stationsLoading && searchParams.latitude && searchParams.longitude && (
        <>
          <ChargingStationList
              stations={stations}
              preferredConnectorTypes={searchParams.preferredConnectorTypes} 
              searchParams={searchParams} 
              isLoadingStations={stationsLoading} 
              stationsError={stationsError}
              onStationRouteRequest={handleStationRouteRequest} 
              selectedStationRoute={selectedStationRoute}
              routeLoadingForStationId={routeLoadingForStationId}
              routeError={routeError}
              highlightedStationId={highlightedStationId} 
              onStationListItemClick={handleStationListItemClick}
              routeElevationInfo={routeElevationInfo}
          />
          
          {selectedStationRoute?.routes?.[0]?.segments?.[0]?.steps && (
            <div className="mt-4">
              <h3>Route Details</h3>
              <RouteDirections 
                steps={selectedStationRoute.routes[0].segments[0].steps} 
                elevationInfo={routeElevationInfo}
                trafficDelay={selectedStationRoute.trafficDelay || 0}
                estimatedWaitTime={selectedStationRoute.estimatedWaitTime || 0}
                totalTimeWithDelays={selectedStationRoute.totalTimeWithDelays || 0}
              />
            </div>
          )}
        </>
      )}
      {!isLocating && !searchParams.latitude && (
        <p>Enter address or allow location access to see stations.</p>
      )}
    </div>
  );
};

export default Home; // Updated export
