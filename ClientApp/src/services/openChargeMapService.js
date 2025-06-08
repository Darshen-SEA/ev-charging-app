// c:\Coding\ev-charging-app\ClientApp\src\services\openChargeMapService.js
const API_KEY = process.env.REACT_APP_OPEN_CHARGE_MAP_API_KEY;
const BASE_URL = 'https://api.openchargemap.io/v3/poi';
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes


/**
 * Fetches a list of EV charging stations.
 * @param {object} params - Query parameters for the API.
 * @param {number} params.latitude - Latitude for search center.
 * @param {number} params.longitude - Longitude for search center.
 * @param {number} params.distance - Search radius in miles.
 * @param {string} params.distanceunit - 'miles' or 'km'.
 * @param {number} params.maxresults - Maximum number of results.
 * @returns {Promise<Array>} A promise that resolves to an array of charging station objects.
 */
export const fetchChargingStations = async (params = {}) => {
    // Construct a cache key from the relevant request parameters
    const cacheKeyParams = {
        lat: params.latitude,
        lon: params.longitude,
        dist: params.distance,
        max: params.maxresults,
        minPkw: params.minpowerkw, // Ensure this is passed if used
    };
    // Sort keys for a consistent key string, filter out undefined values
    const sortedKey = Object.keys(cacheKeyParams)
        .filter(key => cacheKeyParams[key] !== undefined)
        .sort()
        .reduce((obj, key) => { 
            obj[key] = cacheKeyParams[key]; 
            return obj; 
        }, {});
    const cacheKey = `ocm_stations_${JSON.stringify(sortedKey)}`;

    // Try to load from cache
    try {
        const cachedItem = localStorage.getItem(cacheKey);
        if (cachedItem) {
            const { timestamp, data } = JSON.parse(cachedItem);
            if (Date.now() - timestamp < CACHE_DURATION_MS) {
                console.log('Serving from cache:', cacheKey);
                return data;
            }
            console.log('Cache stale, removing:', cacheKey);
            localStorage.removeItem(cacheKey); // Remove stale item
        }
    } catch (error) {
        console.error('Error reading from cache:', error);
        // Proceed to fetch from API if cache read fails
    }

    const queryParams = new URLSearchParams({
        output: 'json',
        key: API_KEY,
        latitude: params.latitude || 37.7749, // Default to San Francisco
        longitude: params.longitude || -122.4194, // Default to San Francisco
        distance: params.distance || 10, // Default to 10 miles
        distanceunit: 'km', // Default to kilometers
        maxresults: params.maxresults || 50, // Default to 50 results
        compact: false, // Fetch detailed data
        verbose: true,  // Fetch verbose data for connection details
    });

    // Add minpowerkw to queryParams if it's provided and valid
    if (params.minpowerkw && parseFloat(params.minpowerkw) > 0) {
        queryParams.set('minpowerkw', parseFloat(params.minpowerkw));
    }


    try {
        const response = await fetch(`${BASE_URL}?${queryParams.toString()}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error('Open Charge Map API Error:', errorData);
            throw new Error(`API request failed with status ${response.status}: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        // Cache the new data
        try {
            localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
            console.log('Cached new data:', cacheKey);
        } catch (error) {
            console.error('Error writing to cache:', error);
            // Potentially handle quota exceeded errors, e.g., by clearing older cache items
        }
        return data;
    } catch (error) {
        console.error('Error fetching charging stations:', error);
        throw error; // Re-throw to be caught by the calling component
    }
};

// Example of more specific parameters you might want to add later:
// connectiontypeid: e.g., 1 for J1772, 2 for CHAdeMO, 25 for CCS Type 1
// levelid: e.g., 1 for Level 1, 2 for Level 2, 3 for DC Fast
// usagecost: e.g., 'Free' or 'Paid'
// countrycode: e.g., 'US'
