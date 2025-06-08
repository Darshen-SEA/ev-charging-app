# API Integration Guide: EV Charging Stations

This document outlines the steps to integrate and utilize API data for the EV charging station project.

## Core Functionality Checklist

-   [X] **Fetch EV Charging Station Data:**
    -   [X] Implement functionality to retrieve a list of electric vehicle (EV) charging stations. (Basic implementation in `ChargingStationList.js` using `openChargeMapService.js`)
    -   [X] Ensure all relevant station details (location, charger types, power levels, etc.) are fetched. (Now fetching verbose data for detailed information)
    -   [X] Display detailed station connector information (charger types, power levels, quantities, statuses) in UI.

-   [X] **Display Station Availability:**
    -   [X] Show real-time or near real-time availability status for each charging station. (Basic status text displayed)
    -   [X] Clearly indicate if a station/charger is currently in use, available, or out of order. (Enhanced with Bootstrap badges in `ChargingStationList.js`)

-   [X] **Implement Station Suggestion Logic:**
    -   [X] Allow users to input their car's current battery percentage or estimated kilometers remaining. (Implemented `UserInputForm.js` and integrated into `Home.js`)
    -   [X] Develop an algorithm to suggest suitable charging stations based on:
        -   [X] Current location (if available) or a user-defined search area. (Implemented browser geolocation in `Home.js`; form takes search radius)
        -   [X] Car's remaining range (battery % or km). (Implemented range-based filtering in `ChargingStationList.js`)
        -   [X] Real-time traffic conditions to estimate travel time. (Integrated with TomTom Traffic API)
        -   [X] Charger compatibility with the user's vehicle. (Basic compatibility based on connector types)
        -   [X] User preferences (e.g., preferred charging networks, fast charging). (Implemented minimum power (kW) and preferred connector types. Preferences saved to localStorage. Min power filtered via API, connector types filtered client-side.)

-   [X] **Integrate with Open Charge Map API:**
    -   [X] Utilize the Open Charge Map API as a primary data source. (Service created: `openChargeMapService.js`)
    -   [X] API Key: `9423fff2-ad41-449e-8200-24a69a412d9d` (Stored in `.env`)
    -   [X] Implement appropriate error handling for API requests (e.g., rate limits, network issues, invalid responses). (Basic error handling in service and component)
    -   [X] Implement caching strategies for API responses (e.g., Open Charge Map data). (Completed - Client-side localStorage caching for Open Charge Map with 15-min expiry)
    -   [X] Consider data caching strategies to improve performance and reduce API call frequency. (Implemented client-side caching for Open Charge Map)

-   [ ] **Integrate Traffic API (TomTom):**
    -   [X] Set up API service for TomTom Traffic API. (Created `tomTomService.js`)
    -   [X] Integrate TomTom Traffic API:
    -   [X] Fetch and display incident counts.
    -   [X] Display traffic incidents as markers on the map for relevant areas. (Integrated into `Home.js` to fetch incidents for current search area)
    -   [ ] Display basic traffic information on the map or alongside route suggestions. (Basic incident count displayed in `Home.js`)
    -   [ ] Use traffic data to adjust estimated travel times for station suggestions. (Pending)

-   [X] **Integrate Routing Service (Openrouteservice):**
    -   [X] Set up API service for Openrouteservice. (Created `openRouteService.js`)
    -   [X] Ensure API key `REACT_APP_OPENROUTESERVICE_API_KEY` is configured in `.env`.
    -   [X] Implement function to fetch a route between user's location and a selected charging station.
    -   [X] Use route data (distance, duration) in station suggestion logic. (Partially done: Displays if selected station route is within user's range; added as-the-crow-flies range heuristic and client-side filtering in `ChargingStationList.js`)
    -   [X] Display turn-by-turn directions for the selected route.
    -   [X] Optionally, display route on a map. (Implemented: Route state lifted to Home.js, GeoJSON passed to MapDisplay)
    -   [X] **UI Display for Elevation Impact**: Display warnings or notes about elevation impact on vehicle range. (Implemented in `RouteDirections.js` via data flow from `Home.js` and `ChargingStationList.js`)

-   [X] **Integrate Map Display (Leaflet):**
    -   [X] Install Leaflet and react-leaflet.
    -   [X] Create `MapDisplay.js` component to show OpenStreetMap tiles.
    -   [X] Refactor `Home.js` to fetch stations and pass to `MapDisplay` and `ChargingStationList` (state lifted up).
    -   [X] Display fetched charging stations as markers on the map in `Home.js`.
    -   [X] Display user's current location on the map. (Map centers on it, and a distinct marker is shown)
    -   [X] Display selected route polyline on the map. (Route state lifted to Home.js, GeoJSON passed to MapDisplay)
    -   [X] Adjust map bounds to fit user location and selected route polyline when displayed.

-   [X] **Customize Map Markers:**
    -   [X] Use a custom icon for the user's current location marker. (Assumes `user-marker.png` in `public/assets/icons`)
    -   [X] Use a basic custom icon for charging station markers. (Assumes `charging-station.png` in `public/assets/icons`; further differentiation pending)
    -   [X] Use custom icons for traffic incident markers. (Assumes `traffic-warning.png` in `public/assets/icons`)

-   [X] **Map Interactivity Enhancements:**
    -   [X] Enable clicking a station marker on the map to highlight it in the list (and scroll to it).
    -   [X] Enable clicking a list item to highlight its marker on the map (and pan/zoom).
    -   [X] Add "Get Route" button in map popups for direct routing requests.

## Map Service Options

### Components that can use OpenStreetMap (OSM):
- [X] **Base Map Display**
  - Use Leaflet.js or OpenLayers with OSM tiles
  - Free and open-source
  - Example: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`

- [X] **Geocoding**
  - Use Nominatim (OSM's geocoding service)
  - Free with rate limits
  - Example: `https://nominatim.openstreetmap.org/search?format=json&q=`

- [X] **Reverse Geocoding**
  - Also uses Nominatim
  - Example: `https://nominatim.openstreetmap.org/reverse?format=json&lat=...&lon=...`

### Components that need alternatives:
- [X] **Routing/Navigation**
  - **Openrouteservice**
    - API Key: `5b3ce3597851110001cf6248b591bbd10b1c42758a1bd8f45275189f`
    - Documentation: [Openrouteservice API](https://openrouteservice.org/)
    - Provides: Turn-by-turn directions, isochrones, and route optimization

- [X] **Traffic Data**
  - **TomTom Traffic API** (Recommended)
    - API Key: `Q83z4YYIRBrBXvSHBEkyVLGV7lhQfN63`
    - Provides: Real-time traffic flow, incidents, and speeds
    - Documentation: [TomTom Traffic API](https://developer.tomtom.com/traffic-api/traffic-api-documentation-traffic-incidents)
    - Note: Consider caching responses to stay within free tier limits

- [X] **Elevation Data**
  - **Open-Meteo Elevation API**
    - No API key required
    - Example: `https://api.open-meteo.com/v1/elevation?latitude=52.52&longitude=13.41`
    - Documentation: [Open-Meteo Elevation API](https://open-meteo.com/en/docs/elevation-api)
    - Status: Integrated but not yet used in routing calculations

- [X] **Satellite/Imagery**
  - **ESRI World Imagery**
    - No API key required
    - URL Template: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
    - Note: Check [ESRI's Terms of Use](https://www.esri.com/en-us/legal/terms/full-master-agreement) for usage restrictions
    - Status: Implemented as an optional map layer using Leaflet LayersControl.

## Additional Considerations

-   [X] **User Interface (UI) for Station Information:**
    -   [X] Design a clear and intuitive way to display station information on a map and in list views.
    -   [X] Show details like address, operating hours, pricing (if available), and user reviews.
-   [ ] **Real-world Scenarios:**
    -   [X] Account for factors like station operating hours.
    -   [ ] Consider elevation changes if routing through hilly/mountainous areas, as this affects range.
    -   [ ] Factor in potential wait times at busy stations.
-   [X] **Security:**
    -   [X] API keys moved to `ClientApp/.env` file.
    -   [X] `ClientApp/.env` added to `.gitignore`.
-   [ ] **Data Accuracy:**
    -   [ ] Be mindful of the potential for data inaccuracies from any API and provide disclaimers if necessary.
