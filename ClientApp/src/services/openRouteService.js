// c:\Coding\ev-charging-app\ClientApp\src\services\openRouteService.js
const ORS_API_KEY = process.env.REACT_APP_OPENROUTESERVICE_API_KEY;
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2';

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
        return data;
    } catch (error) {
        console.error('Error fetching route from Openrouteservice:', error);
        throw error;
    }
};
