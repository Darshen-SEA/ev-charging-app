// c:\\Coding\\ev-charging-app\\ClientApp\\src\\services\\openChargeMapService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.openchargemap.io/v3/poi';
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// In-memory cache
const cache = new Map();

/**
 * Fetches a list of EV charging stations from the Open Charge Map API.
 * @param {object} params - Query parameters for the API.
 * @param {number} params.latitude - Latitude for search center.
 * @param {number} params.longitude - Longitude for search center.
 * @param {number} params.distance - Search radius in miles.
 * @param {number} [params.minPower] - Minimum power in kW.
 * @returns {Promise<Array>} A promise that resolves to an array of charging station objects.
 */
export const fetchChargingStations = async (params = {}) => {
    // Check in-memory cache first
    const cacheKey = `stations_${params.latitude}_${params.longitude}_${params.distance}_${params.minPower || '0'}`;
    const now = Date.now();
    
    if (cache.has(cacheKey)) {
        const { data, timestamp } = cache.get(cacheKey);
        if (now - timestamp < CACHE_DURATION_MS) {
            return data; // Return cached data if not expired
        }
    }

    // Check localStorage cache
    try {
        const cachedItem = localStorage.getItem(cacheKey);
        if (cachedItem) {
            const { timestamp, data } = JSON.parse(cachedItem);
            if (Date.now() - timestamp < CACHE_DURATION_MS) {
                console.log('Serving from cache:', cacheKey);
                return data;
            }
            console.log('Cache stale, removing:', cacheKey);
            localStorage.removeItem(cacheKey);
        }
    } catch (error) {
        console.error('Error reading from cache:', error);
    }

    // If not in cache or cache expired, fetch from Open Charge Map API
    try {
        const queryParams = new URLSearchParams({
            latitude: params.latitude || 37.7749, // Default to San Francisco
            longitude: params.longitude || -122.4194, // Default to San Francisco
            distance: params.distance || 10, // Default to 10 miles
            distanceunit: 'km', // Default to kilometers
            maxresults: params.maxresults || 50, // Default to 50 results
            compact: false, // Fetch detailed data
            verbose: true,  // Fetch verbose data for connection details
        });

        // Add minpowerkw to queryParams if it's provided and valid
        if (params.minPower && parseFloat(params.minPower) > 0) {
            queryParams.set('minpowerkw', parseFloat(params.minPower));
        }

        const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error('Open Charge Map API Error:', errorData);
            throw new Error(`API request failed with status ${response.status}: ${errorData.message || response.statusText}`);
        }
        
        const data = await response.json();
        
        // Update in-memory cache
        cache.set(cacheKey, {
            data,
            timestamp: now
        });
        
        // Update localStorage cache
        try {
            localStorage.setItem(cacheKey, JSON.stringify({
                data,
                timestamp: now
            }));
        } catch (e) {
            console.warn('Failed to save to localStorage', e);
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching charging stations:', error);
        // If there's an error but we have cached data, return that
        if (cache.has(cacheKey)) {
            console.warn('Using cached data due to API error');
            return cache.get(cacheKey).data;
        }
        throw error;
    }
};