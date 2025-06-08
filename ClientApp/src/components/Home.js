import React, { useState, useEffect } from 'react';
import ChargingStationList from './ChargingStationList';
import UserInputForm from './UserInputForm';
import MapDisplay from './MapDisplay'; // Import MapDisplay
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
  const handleStationRouteRequest = async (station) => {
    if (!searchParams.latitude || !searchParams.longitude) {
      setRouteError("Your current location is not available to calculate a route.");
      setSelectedStationRoute(null);
      return;
    }
    if (!station.AddressInfo || typeof station.AddressInfo.Longitude !== 'number' || typeof station.AddressInfo.Latitude !== 'number') {
      setRouteError("Selected station does not have valid coordinates for routing.");
      setSelectedStationRoute(null);
      return;
    }

    setRouteLoadingForStationId(station.ID);
    setSelectedStationRoute(null); // Clear previous route
    setRouteError(null); // Clear previous error

    try {
      const startLon = parseFloat(searchParams.longitude);
      const startLat = parseFloat(searchParams.latitude);
      const endLon = parseFloat(station.AddressInfo.Longitude);
      const endLat = parseFloat(station.AddressInfo.Latitude);

      if (isNaN(startLon) || isNaN(startLat) || isNaN(endLon) || isNaN(endLat)) {
        throw new Error("Invalid coordinate format for routing.");
      }

      // Assuming fetchRoute is imported or available here
      // For now, we'll need to import it in Home.js
      const routeData = await fetchRoute({ // fetchRoute would need to be imported from '../services/openRouteService'
        startCoordinates: [startLon, startLat],
        endCoordinates: [endLon, endLat],
      });

      if (routeData && routeData.routes && routeData.routes.length > 0) {
        setSelectedStationRoute(routeData);
      } else {
        setRouteError("No route found to the selected station by Openrouteservice.");
      }
    } catch (err) {
      console.error("Home.js: Failed to fetch route for station:", station.ID, err);
      setRouteError(err.message || "Failed to fetch route in Home.js.");
    } finally {
      setRouteLoadingForStationId(null);
    }
  };

  const getRouteForStation = async (stationInput) => {
    let station;
    if (typeof stationInput === 'object' && stationInput !== null && stationInput.ID) {
      station = stationInput;
    } else { // stationInput is an ID
      station = stations.find(s => s.ID === stationInput);
    }

    if (!station) {
      console.error('Station not found for routing:', stationInput);
      setRouteError('Station details not found.');
      setRouteLoadingForStationId(null);
      return;
    }

    setRouteLoadingForStationId(station.ID);
    setRouteError(null);
    setSelectedStationRoute(null);

    try {
      const startLon = parseFloat(searchParams.longitude);
      const startLat = parseFloat(searchParams.latitude);
      const endLon = parseFloat(station.AddressInfo.Longitude);
      const endLat = parseFloat(station.AddressInfo.Latitude);

      if (isNaN(startLon) || isNaN(startLat) || isNaN(endLon) || isNaN(endLat)) {
        throw new Error("Invalid coordinate format for routing.");
      }

      const routeData = await fetchRoute({ 
        startCoordinates: [startLon, startLat],
        endCoordinates: [endLon, endLat],
      });

      let elevationMessage = null;
      if (routeData.features && routeData.features[0] && routeData.features[0].properties && routeData.features[0].properties.elevationProfile) {
        const profile = routeData.features[0].properties.elevationProfile;
        if (profile.error) {
          elevationMessage = `Note: Could not retrieve elevation data for this route (${profile.error}).`;
        } else if (typeof profile.totalAscent === 'number' && typeof profile.totalDescent === 'number') {
          if (profile.totalAscent > 100 || profile.totalDescent > 100) { // Threshold for significant change, e.g., 100m
            elevationMessage = `Route Elevation: Ascent: ${profile.totalAscent.toFixed(0)}m, Descent: ${profile.totalDescent.toFixed(0)}m. This may impact range.`;
          }
        }
      }
      setRouteElevationInfo(elevationMessage);

      if (routeData && routeData.routes && routeData.routes.length > 0) {
        setSelectedStationRoute(routeData);
      } else {
        setRouteError("No route found to the selected station by Openrouteservice.");
      }
    } catch (err) {
      console.error("Home.js: Failed to fetch route for station:", station.ID, err);
      setRouteError(`Failed to fetch route for station ${station.ID}.`);
    } finally {
      setRouteLoadingForStationId(null);
    }
  };

  const handleHighlightStation = (stationId, stationLat = null, stationLng = null) => {
    setHighlightedStationId(stationId);
    if (stationLat !== null && stationLng !== null) {
      setMapFocusCoordinates([stationLat, stationLng]);
    } else {
      const station = stations.find(s => s.ID === stationId);
      if (station) {
        setMapFocusCoordinates([station.AddressInfo.Latitude, station.AddressInfo.Longitude]);
      }
    }
  };

  // Specific handler for list item click to ensure map focus
  const handleStationListItemClick = (station) => {
    setHighlightedStationId(station.ID);
    setMapFocusCoordinates([station.AddressInfo.Latitude, station.AddressInfo.Longitude]);
  };

  const handleStationMarkerClick = (station) => {
    console.log("Home.js: Station marker clicked:", station);
    setHighlightedStationId(station.ID);
    // Optional: Pan map to this station if not already focused
    // setMapFocusCoordinates([station.AddressInfo.Latitude, station.AddressInfo.Longitude]);
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
        <ChargingStationList
            stations={stations} // Pass all stations fetched (potentially pre-filtered by API for minPower)
            // We will add client-side filtering for preferredConnectorTypes within ChargingStationList or here before passing down
            // For now, pass the preference to ChargingStationList to handle
            preferredConnectorTypes={searchParams.preferredConnectorTypes} 
            searchParams={searchParams} 
            isLoadingStations={stationsLoading} 
            stationsError={stationsError}
            // Props for route handling
            onStationRouteRequest={handleStationRouteRequest} 
            selectedStationRoute={selectedStationRoute}
            routeLoadingForStationId={routeLoadingForStationId}
            routeError={routeError}
            highlightedStationId={highlightedStationId} 
            onStationListItemClick={handleStationListItemClick}
            routeElevationInfo={routeElevationInfo} />
      )}
      {!isLocating && !searchParams.latitude && (
        <p>Enter address or allow location access to see stations.</p>
      )}
    </div>
  );
};

export default Home; // Updated export
