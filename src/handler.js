const openChargeMapService = require('./services/openChargeMapService');
const openRouteService = require('./services/openRouteService');
const tomTomService = require('./services/tomTomService');

module.exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const path = event.path;
  const httpMethod = event.httpMethod;
  const queryParams = event.queryStringParameters || {};
  
  try {
    // Route requests to appropriate service
    if (path.includes('/api/charging-stations')) {
      const { lat, lng, distance, minPower } = queryParams;
      const result = await openChargeMapService.fetchChargingStations({
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        distance: parseInt(distance || 10),
        minPower: minPower ? parseInt(minPower) : undefined
      });
      return formatResponse(200, result);
    }
    
    if (path.includes('/api/route')) {
      const { start, end } = queryParams;
      const result = await openRouteService.getRoute(start, end);
      return formatResponse(200, result);
    }
    
    if (path.includes('/api/traffic')) {
      const { lat, lng, radius } = queryParams;
      const result = await tomTomService.getTrafficIncidents({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius: parseInt(radius || 10)
      });
      return formatResponse(200, result);
    }
    
    return formatResponse(404, { message: 'Not Found' });
    
  } catch (error) {
    console.error('Error:', error);
    return formatResponse(500, { 
      message: 'Internal Server Error',
      error: error.message 
    });
  }
};

function formatResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body),
  };
}
