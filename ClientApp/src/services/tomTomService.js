// c:\Coding\ev-charging-app\ClientApp\src\services\tomTomService.js
const TOMTOM_API_KEY = process.env.REACT_APP_TOMTOM_API_KEY;
const TOMTOM_BASE_URL = 'https://api.tomtom.com/traffic/services/4';

/**
 * Fetches traffic flow data for a given bounding box.
 * @param {object} params - The parameters for the traffic API.
 * @param {number} params.north - North latitude of the bounding box.
 * @param {number} params.south - South latitude of the bounding box.
 * @param {number} params.east - East longitude of the bounding box.
 * @param {number} params.west - West longitude of the bounding box.
 * @param {number} [params.zoom=12] - Zoom level for the traffic tiles.
 * @returns {Promise<object>} A promise that resolves to the traffic flow data.
 */
export const fetchTrafficFlow = async ({ north, south, east, west, zoom = 12 }) => {
    if (!TOMTOM_API_KEY) {
        console.error('TomTom API key is missing.');
        throw new Error('TomTom API key is not configured.');
    }

    // Example: Fetching traffic flow tiles (binary data, often for map display)
    // For simplicity in this step, we'll fetch incident details which is more readily usable as JSON.
    // The request below is for Traffic Incident Details.
    // TomTom API URL for incident details:
    // /incidentDetails/s3/{minLat},{minLon},{maxLat},{maxLon}/{zoom}/{style}/json?key={apiKey}&projection=EPSG4326&geometries=original
    // We'll simplify to a point and radius for now, or a bounding box.
    // Let's use the "Traffic Flow Segment" endpoint for a specific point, which is more relevant for checking conditions.
    // This endpoint is not directly available. Let's use incident details for a bounding box.
    
    // Bounding box string: minLon,minLat,maxLon,maxLat
    const bbox = `${west},${south},${east},${north}`;
    // const incidentDetailsUrl = `${TOMTOM_BASE_URL}/incidentDetails/s3/${bbox}/${zoom}/tile/json?key=${TOMTOM_API_KEY}&projection=EPSG4326`;
    // Note: The above URL might be for a specific tile format.
    // A more general incident API: /incidentDetails/s3/{minLat},{minLon},{maxLat},{maxLon}/{zoom}/json?key={API_KEY}
    // Using: /incidentDetails/json?key={API_KEY}&bbox={bbox_string}&fields={tmcs_fields_string}
    
    const url = `${TOMTOM_BASE_URL}/incidentDetails/json?key=${TOMTOM_API_KEY}&bbox=${bbox}&fields=%7Bincidents%7Btype%2Cgeometry%7Btype%2Ccoordinates%7D%2Cproperties%7BiconCategory%2CmagnitudeOfDelay%2CstartTime%2CendTime%2Cfrom%2Cto%2Clength%2Cdelay%2CroadNumbers%2Caci%7BprobabilityOfOccurrence%2CoriginalProbabilityOfOccurrence%2CnumberOfReports%7D%7D%7D%7D`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error('TomTom API error:', errorData);
            throw new Error(`Failed to fetch TomTom traffic incidents: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        console.log('TomTom Traffic Incidents Data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching TomTom traffic incidents:', error);
        throw error;
    }
};

/**
 * Calculates additional travel time (in minutes) based on traffic incidents along the route
 * @param {Array} routeCoordinates - Array of [longitude, latitude] coordinates representing the route
 * @param {Object} trafficIncidents - Traffic incidents data from fetchTrafficFlow
 * @returns {number} - Additional travel time in minutes
 */
export const calculateTrafficDelay = (routeCoordinates, trafficIncidents) => {
    if (!trafficIncidents?.incidents || !Array.isArray(trafficIncidents.incidents)) {
        return 0;
    }

    let totalDelay = 0;
    const ROUTE_BUFFER_KM = 1; // 1km buffer around route to consider incidents
    
    trafficIncidents.incidents.forEach(incident => {
        if (!incident?.geometry?.coordinates || !incident.properties) return;
        
        const [incidentLon, incidentLat] = incident.geometry.coordinates;
        
        // Check if incident is near the route
        const isNearRoute = routeCoordinates.some(([routeLon, routeLat]) => {
            const distance = getDistanceFromLatLonInKm(
                incidentLat, incidentLon,
                routeLat, routeLon
            );
            return distance <= ROUTE_BUFFER_KM;
        });
        
        if (isNearRoute) {
            // Add delay based on incident severity
            const severity = incident.properties.magnitudeOfDelay || 0;
            // Convert delay from seconds to minutes and scale by severity (1-4)
            const incidentDelay = (incident.properties.delay || 0) / 60 * (severity * 0.5);
            totalDelay += incidentDelay;
        }
    });
    
    return Math.round(totalDelay);
};

// Helper function to calculate distance between two points in kilometers
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Example usage (you'll call this from a component)
/*
fetchTrafficFlow({
    north: 34.1, 
    south: 34.0, 
    east: -118.2, 
    west: -118.3, 
    zoom: 12 
}).then(data => console.log(data)).catch(err => console.error(err));
*/
