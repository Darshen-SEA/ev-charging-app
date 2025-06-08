// c:\Coding\ev-charging-app\ClientApp\src\services\openMeteoService.js
const OPEN_METEO_ELEVATION_API_URL = 'https://api.open-meteo.com/v1/elevation';

/**
 * Fetches elevation data for a list of coordinates.
 * @param {Array<Array<number>>} coordinates - An array of [latitude, longitude] pairs.
 * @returns {Promise<object>} A promise that resolves to the elevation data.
 *                            Example: { elevations: [100, 150, 120] }
 */
export const fetchElevationDataForCoords = async (coordinates) => {
    if (!coordinates || coordinates.length === 0) {
        console.warn('No coordinates provided to fetchElevationDataForCoords');
        return { elevations: [] };
    }

    const latitudes = coordinates.map(coord => coord[0].toFixed(4)).join(',');
    const longitudes = coordinates.map(coord => coord[1].toFixed(4)).join(',');

    const url = `${OPEN_METEO_ELEVATION_API_URL}?latitude=${latitudes}&longitude=${longitudes}`;

    try {
        console.log(`Fetching elevation data from: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Open-Meteo Elevation API Error:', response.status, errorText);
            throw new Error(`Elevation API request failed with status ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        console.log('Open-Meteo Elevation Data:', data);
        // The API returns an object like { elevation: [elev1, elev2, ...] }
        // Let's standardize our return to be { elevations: [...] }
        return { elevations: data.elevation || [] }; 
    } catch (error) {
        console.error('Error fetching elevation data:', error);
        // Return a structure that won't break the calling code, but indicates failure
        return { elevations: [], error: error.message }; 
    }
};

/**
 * Calculates total ascent and descent from a list of elevation points.
 * @param {Array<number>} elevations - An array of elevation values in order.
 * @returns {object} An object containing totalAscent and totalDescent.
 */
export const calculateElevationChanges = (elevations) => {
    let totalAscent = 0;
    let totalDescent = 0;

    if (!elevations || elevations.length < 2) {
        return { totalAscent, totalDescent, message: 'Not enough data for elevation change calculation.' };
    }

    for (let i = 1; i < elevations.length; i++) {
        const diff = elevations[i] - elevations[i-1];
        if (diff > 0) {
            totalAscent += diff;
        } else {
            totalDescent += Math.abs(diff);
        }
    }
    return { totalAscent, totalDescent };
};
