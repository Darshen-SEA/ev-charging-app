// c:\Coding\ev-charging-app\ClientApp\src\services\openRouteService.js
const ORS_API_KEY = process.env.REACT_APP_OPENROUTESERVICE_API_KEY;
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2';
import { fetchElevationDataForCoords, calculateElevationChanges } from './openMeteoService';

const MAX_ELEVATION_SAMPLES = 15; // Max number of points to sample for elevation

/**
 * Fetches a route between two points using Openrouteservice.
 * @param {object} params - The parameters for the directions API.
 * @param {Array<number>} params.startCoordinates - Starting point [longitude, latitude].
 * @param {Array<number>} params.endCoordinates - Ending point [longitude, latitude].
 * @param {string} [params.profile='driving-car'] - Routing profile (e.g., 'driving-car', 'cycling-regular').
 * @returns {Promise<object>} A promise that resolves to the route data.
 */
export const fetchRoute = async ({ startCoordinates, endCoordinates, profile = 'driving-car' }) => {
    if (!ORS_API_KEY) {
        console.error('Openrouteservice API key is missing.');
        throw new Error('Openrouteservice API key is not configured.');
    }

    if (!startCoordinates || !endCoordinates || startCoordinates.length !== 2 || endCoordinates.length !== 2) {
        console.error('Invalid start or end coordinates for routing.');
        throw new Error('Valid start and end coordinates are required for routing.');
    }

    const url = `${ORS_BASE_URL}/directions/${profile}`;
    
    const body = JSON.stringify({
        coordinates: [startCoordinates, endCoordinates],
        // Additional parameters can be added here, e.g.:
        // instructions: false, // to reduce response size if full instructions aren't needed
        // preference: 'fastest',
        // units: 'mi' // or 'km'
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': ORS_API_KEY,
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
            },
            body: body,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error('Openrouteservice API error:', errorData);
            let errorMessage = `Failed to fetch route: ${response.statusText}`;
            if (errorData && errorData.error && errorData.error.message) {
                errorMessage = `Openrouteservice Error: ${errorData.error.message}`;
            } else if (errorData && errorData.error) {
                 errorMessage = `Openrouteservice Error: ${JSON.stringify(errorData.error)}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Openrouteservice Route Data:', data);

        // Attempt to fetch and attach elevation data
        if (data.features && data.features[0] && data.features[0].geometry && data.features[0].geometry.coordinates) {
            const routeCoordsLonLat = data.features[0].geometry.coordinates;
            // OpenMeteo expects [lat, lon]
            const routeCoordsLatLon = routeCoordsLonLat.map(coord => [coord[1], coord[0]]); 

            let sampledCoords = routeCoordsLatLon;
            if (routeCoordsLatLon.length > MAX_ELEVATION_SAMPLES) {
                sampledCoords = [];
                const step = Math.floor(routeCoordsLatLon.length / (MAX_ELEVATION_SAMPLES -1));
                for (let i = 0; i < MAX_ELEVATION_SAMPLES - 1; i++) {
                    sampledCoords.push(routeCoordsLatLon[i * step]);
                }
                sampledCoords.push(routeCoordsLatLon[routeCoordsLatLon.length - 1]); // Ensure last point is included
            }
            
            try {
                const elevationData = await fetchElevationDataForCoords(sampledCoords);
                if (elevationData && elevationData.elevations && elevationData.elevations.length > 0) {
                    const changes = calculateElevationChanges(elevationData.elevations);
                    // Attach to the first route object (ORS typically returns one route in features[0] for basic requests)
                    // or directly to the data object if that's more convenient for Home.js
                    if (data.features[0].properties) { // ORS sometimes uses properties for summary
                         data.features[0].properties.elevationProfile = { 
                            ...changes, 
                            sampledElevations: elevationData.elevations 
                        };
                    } else {
                         data.features[0].elevationProfile = { 
                            ...changes, 
                            sampledElevations: elevationData.elevations 
                        };
                    }
                    console.log('Elevation profile added to route:', data.features[0].properties || data.features[0].elevationProfile);
                } else if (elevationData && elevationData.error) {
                    console.warn('Could not fetch elevation data for route:', elevationData.error);
                    if (data.features[0].properties) data.features[0].properties.elevationProfile = { error: elevationData.error };
                    else data.features[0].elevationProfile = { error: elevationData.error };
                }
            } catch (elevationError) {
                console.error('Error processing elevation data for route:', elevationError);
                if (data.features[0].properties) data.features[0].properties.elevationProfile = { error: elevationError.message };
                else data.features[0].elevationProfile = { error: elevationError.message };
            }
        }
        return data;
    } catch (error) {
        console.error('Error fetching route from Openrouteservice:', error);
        throw error;
    }
};

// Example usage (you'll call this from a component, likely when a station is selected)
/*
fetchRoute({
    startCoordinates: [-118.2437, 34.0522], // Los Angeles (lon, lat)
    endCoordinates: [-118.4903, 34.0194]    // Santa Monica (lon, lat)
}).then(data => {
    if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        console.log('Route Summary:', route.summary); // { distance, duration }
        console.log('Route Geometry (encoded polyline):', route.geometry);
    }
}).catch(err => console.error(err));
*/
