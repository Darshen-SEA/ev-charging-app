"use client"

import React, { useState, useEffect } from "react"
import { FiMapPin, FiNavigation, FiAlertCircle, FiZap, FiClock, FiTrendingUp, FiActivity } from "react-icons/fi"
import ChargingStationList from "./ChargingStationList"
import UserInputForm from "./UserInputForm"
import MapDisplay from "./MapDisplay"
import RouteDirections from "./RouteDirections"
import { fetchTrafficFlow } from "../services/tomTomService"
import { fetchChargingStations } from "../services/openChargeMapService"
import { fetchRoute } from "../services/openRouteService"

const COMMON_CONNECTOR_TYPES = [
  { ID: 1, Title: "Type 1 (J1772)" },
  { ID: 25, Title: "Type 2 (Socket Only)" },
  { ID: 1036, Title: "Type 2 (Tethered Connector)" },
  { ID: 32, Title: "CCS (Type 1)" },
  { ID: 33, Title: "CCS (Type 2)" },
  { ID: 2, Title: "CHAdeMO" },
  { ID: 8, Title: "Tesla (Roadster)" },
  { ID: 27, Title: "Tesla (Model S/X)" },
  { ID: 30, Title: "Tesla (CCS)" },
]

const Home = () => {
  const [searchParams, setSearchParams] = useState({
    latitude: null,
    longitude: null,
    distance: 25,
    minPower: 0,
    preferredConnectorTypes: [],
  })

  const [locationError, setLocationError] = useState(null)
  const [isLocating, setIsLocating] = useState(true)
  const [trafficData, setTrafficData] = useState(null)
  const [trafficLoading, setTrafficLoading] = useState(false)
  const [trafficError, setTrafficError] = useState(null)
  const [stations, setStations] = useState([])
  const [stationsLoading, setStationsLoading] = useState(true)
  const [stationsError, setStationsError] = useState(null)
  const [selectedStationRoute, setSelectedStationRoute] = useState(null)
  const [routeLoadingForStationId, setRouteLoadingForStationId] = useState(null)
  const [routeError, setRouteError] = useState(null)
  const [highlightedStationId, setHighlightedStationId] = useState(null)
  const [mapFocusCoordinates, setMapFocusCoordinates] = useState(null)

  // Calculate dashboard statistics
  const dashboardStats = React.useMemo(() => {
    const totalStations = stations.length
    const availableStations = stations.filter((station) =>
      station.Connections?.some(
        (conn) => conn.StatusType?.IsOperational && !conn.StatusType.Title.toLowerCase().includes("in use"),
      ),
    ).length

    const fastChargers = stations.filter((station) => station.Connections?.some((conn) => conn.PowerKW >= 50)).length

    const averageDistance =
      stations.length > 0
        ? (stations.reduce((sum, station) => sum + (station.AddressInfo?.Distance || 0), 0) / stations.length).toFixed(
            1,
          )
        : 0

    return {
      total: totalStations,
      available: availableStations,
      fastChargers,
      averageDistance,
    }
  }, [stations])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true)
      setLocationError(null)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSearchParams((prevParams) => ({
            ...prevParams,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }))
          setIsLocating(false)
        },
        (error) => {
          console.error("Geolocation error:", error)
          setLocationError(`Location access denied. Using default location.`)
          setSearchParams((prevParams) => ({
            ...prevParams,
            latitude: 34.0522,
            longitude: -118.2437,
          }))
          setIsLocating(false)
        },
      )
    } else {
      setLocationError("Geolocation not supported. Using default location.")
      setSearchParams((prevParams) => ({
        ...prevParams,
        latitude: 34.0522,
        longitude: -118.2437,
      }))
      setIsLocating(false)
    }
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  useEffect(() => {
    if (searchParams.latitude && searchParams.longitude) {
      const fetchTraffic = async () => {
        setTrafficLoading(true)
        setTrafficError(null)
        try {
          const distanceInMiles = searchParams.distance || 25
          const latDegrees = distanceInMiles / 69.0
          const lonDegrees = distanceInMiles / (69.0 * Math.cos((searchParams.latitude * Math.PI) / 180))

          const trafficApiParams = {
            north: searchParams.latitude + latDegrees,
            south: searchParams.latitude - latDegrees,
            east: searchParams.longitude + lonDegrees,
            west: searchParams.longitude - lonDegrees,
            zoom: 10,
          }

          const data = await fetchTrafficFlow(trafficApiParams)
          setTrafficData(data)
        } catch (error) {
          console.error("Failed to fetch traffic data:", error)
          setTrafficError(error.message || "Failed to load traffic data.")
        } finally {
          setTrafficLoading(false)
        }
      }
      fetchTraffic()
    }
  }, [searchParams.latitude, searchParams.longitude, searchParams.distance])

  useEffect(() => {
    if (searchParams.latitude && searchParams.longitude) {
      const getStations = async () => {
        setStationsLoading(true)
        setStationsError(null)
        try {
          const apiParams = {
            latitude: searchParams.latitude,
            longitude: searchParams.longitude,
            distance: searchParams.distance || 25,
            maxresults: 50,
            minpowerkw: searchParams.minPower > 0 ? searchParams.minPower : null,
          }

          const data = await fetchChargingStations(apiParams)
          setStations(data || [])
        } catch (err) {
          console.error("Failed to fetch stations:", err)
          setStationsError(err.message || "Failed to fetch stations.")
          setStations([])
        } finally {
          setStationsLoading(false)
        }
      }
      getStations()
    } else {
      setStations([])
      setStationsLoading(false)
    }
  }, [
    searchParams.latitude,
    searchParams.longitude,
    searchParams.distance,
    searchParams.minPower,
    searchParams.preferredConnectorTypes,
  ])

  const handleSearchSubmit = (userInput) => {
    setSearchParams((prevParams) => ({
      ...prevParams,
      distance: userInput.searchRadius,
      batteryPercentage: userInput.batteryPercentage,
      rangeKm: userInput.rangeKm,
      minPower: userInput.minPower,
      preferredConnectorTypes: userInput.preferredConnectorTypes,
    }))
  }

  const estimateWaitTime = (station) => {
    if (!station.Connections || station.Connections.length === 0) return 0

    const availableConnectors = station.Connections.reduce((total, conn) => {
      const isAvailable = conn.StatusType?.IsOperational && !conn.StatusType.Title.toLowerCase().includes("in use")
      return total + (isAvailable ? conn.Quantity || 1 : 0)
    }, 0)

    const totalConnectors = station.Connections.reduce((total, conn) => total + (conn.Quantity || 1), 0)

    let waitTime = 0
    const availabilityRatio = availableConnectors / totalConnectors

    if (availabilityRatio < 0.2) waitTime = 45
    else if (availabilityRatio < 0.5) waitTime = 20
    else if (availabilityRatio < 0.8) waitTime = 10

    const now = new Date()
    const hour = now.getHours()
    if ((hour >= 7 && hour < 10) || (hour >= 16 && hour < 19)) {
      waitTime = Math.ceil(waitTime * 1.5)
    }

    return waitTime
  }

  const handleStationMarkerClick = (station) => {
    setHighlightedStationId(station.ID)
  }

  const handleStationListItemClick = (station) => {
    setHighlightedStationId(station.ID)
    setMapFocusCoordinates([station.AddressInfo.Latitude, station.AddressInfo.Longitude])
  }

  const handleStationRouteRequest = async (station) => {
    if (!searchParams.latitude || !searchParams.longitude) {
      setRouteError("Your current location is not available to calculate a route.")
      setSelectedStationRoute(null)
      return
    }

    if (
      !station.AddressInfo ||
      typeof station.AddressInfo.Longitude !== "number" ||
      typeof station.AddressInfo.Latitude !== "number"
    ) {
      setRouteError("Selected station does not have valid coordinates for routing.")
      setSelectedStationRoute(null)
      return
    }

    setRouteLoadingForStationId(station.ID)
    setSelectedStationRoute(null)
    setRouteError(null)

    try {
      const routeData = await fetchRoute({
        startCoordinates: [searchParams.longitude, searchParams.latitude],
        endCoordinates: [station.AddressInfo.Longitude, station.AddressInfo.Latitude],
        profile: "driving-car",
      })

      if (routeData && routeData.features && routeData.features.length > 0) {
        let trafficDelay = 0
        if (trafficData && routeData.features[0]?.geometry?.coordinates) {
          const { calculateTrafficDelay } = await import("../services/tomTomService")
          trafficDelay = calculateTrafficDelay(routeData.features[0].geometry.coordinates, trafficData)

          if (trafficDelay > 0) {
            const route = routeData.features[0].properties
            route.duration += trafficDelay * 60
            if (route.summary) {
              route.summary.duration += trafficDelay * 60
            }
          }
        }

        const waitTime = estimateWaitTime(station)

        const enhancedRouteData = {
          ...routeData,
          trafficDelay,
          estimatedWaitTime: waitTime,
          totalTimeWithDelays: routeData.features[0].properties.duration / 60 + trafficDelay + waitTime,
        }

        setSelectedStationRoute(enhancedRouteData)
        setMapFocusCoordinates({
          lat: station.AddressInfo.Latitude,
          lng: station.AddressInfo.Longitude,
        })
      } else {
        setRouteError("No route found to the selected station.")
      }
    } catch (error) {
      console.error("Error getting route to station:", error)
      setRouteError(error.message || "Failed to get route to station")
    } finally {
      setRouteLoadingForStationId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">EV Charging Station Manager</h1>
              <p className="text-primary-100">Find and manage electric vehicle charging stations with real-time data</p>
            </div>
            <div className="flex items-center gap-4">
              <FiZap className="text-4xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Location Status */}
        {isLocating && (
          <div className="alert alert-info mb-6 fade-in">
            <div className="flex items-center gap-2">
              <div className="loading-spinner"></div>
              <span>Locating your position...</span>
            </div>
          </div>
        )}

        {locationError && (
          <div className="alert alert-warning mb-6 fade-in">
            <div className="flex items-center gap-2">
              <FiAlertCircle />
              <span>{locationError}</span>
            </div>
          </div>
        )}

        {!isLocating && searchParams.latitude && (
          <div className="card mb-6 fade-in">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiMapPin className="text-primary-600 text-xl" />
                  <div>
                    <p className="font-medium">Current Location</p>
                    <p className="text-sm text-gray-600">
                      {searchParams.latitude.toFixed(4)}, {searchParams.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={getCurrentLocation}
                  className="btn btn-secondary btn-sm"
                  aria-label="Update current location"
                >
                  <FiNavigation />
                  Re-center
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Statistics */}
        {!stationsLoading && stations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 fade-in">
            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stats-number">{dashboardStats.total}</div>
                  <div className="stats-label">Total Stations</div>
                </div>
                <FiMapPin className="text-2xl text-primary-500" />
              </div>
            </div>

            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stats-number">{dashboardStats.available}</div>
                  <div className="stats-label">Available Now</div>
                </div>
                <FiActivity className="text-2xl text-success-500" />
              </div>
            </div>

            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stats-number">{dashboardStats.fastChargers}</div>
                  <div className="stats-label">Fast Chargers</div>
                </div>
                <FiZap className="text-2xl text-warning-500" />
              </div>
            </div>

            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stats-number">{dashboardStats.averageDistance}</div>
                  <div className="stats-label">Avg Distance (mi)</div>
                </div>
                <FiTrendingUp className="text-2xl text-primary-500" />
              </div>
            </div>
          </div>
        )}

        {/* Search Form */}
        <div className="card mb-8 slide-in">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Find Charging Stations</h2>
            <p className="text-gray-600 mt-1">Search for EV charging stations based on your preferences</p>
          </div>
          <div className="card-body">
            <UserInputForm onSubmit={handleSearchSubmit} availableConnectorTypes={COMMON_CONNECTOR_TYPES} />
          </div>
        </div>

        {/* Traffic Information */}
        {trafficLoading && (
          <div className="alert alert-info mb-6">
            <div className="flex items-center gap-2">
              <div className="loading-spinner"></div>
              <span>Loading traffic data...</span>
            </div>
          </div>
        )}

        {trafficError && (
          <div className="alert alert-warning mb-6">
            <div className="flex items-center gap-2">
              <FiAlertCircle />
              <span>Traffic Error: {trafficError}</span>
            </div>
          </div>
        )}

        {trafficData && (
          <div className="card mb-6">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <FiClock className="text-warning-500 text-xl" />
                <div>
                  <p className="font-medium">Traffic Information</p>
                  <p className="text-sm text-gray-600">
                    {trafficData.incidents ? trafficData.incidents.length : 0} incidents in your area
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Station List */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">Charging Stations</h3>
              </div>
              <div className="card-body p-0">
                <ChargingStationList
                  searchParams={searchParams}
                  stations={stations}
                  isLoadingStations={stationsLoading}
                  stationsError={stationsError}
                  onStationRouteRequest={handleStationRouteRequest}
                  selectedStationRoute={selectedStationRoute}
                  routeLoadingForStationId={routeLoadingForStationId}
                  routeError={routeError}
                  highlightedStationId={highlightedStationId}
                  onStationListItemClick={handleStationListItemClick}
                  preferredConnectorTypes={searchParams.preferredConnectorTypes}
                />
              </div>
            </div>
          </div>

          {/* Map and Directions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold">Station Map</h3>
              </div>
              <div className="card-body p-0">
                <div className="h-[600px] map-container">
                  <MapDisplay
                    stations={stations}
                    userLatitude={searchParams.latitude}
                    userLongitude={searchParams.longitude}
                    trafficIncidents={trafficData ? trafficData.incidents : []}
                    selectedRoute={selectedStationRoute}
                    onStationMarkerClick={handleStationMarkerClick}
                    highlightedStationId={highlightedStationId}
                    focusCoordinates={mapFocusCoordinates}
                    onRouteRequestFromPopup={handleStationRouteRequest}
                  />
                </div>
              </div>
            </div>

            {/* Directions Panel */}
            {selectedStationRoute && (
              <div className="card fade-in">
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Route Directions</h3>
                    <button
                      onClick={() => setSelectedStationRoute(null)}
                      className="btn btn-secondary btn-sm"
                      aria-label="Close directions"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <RouteDirections
                    route={selectedStationRoute}
                    onClose={() => setSelectedStationRoute(null)}
                    steps={selectedStationRoute.routes?.[0]?.segments?.[0]?.steps || []}
                    elevationInfo={null}
                    trafficDelay={selectedStationRoute.trafficDelay || 0}
                    estimatedWaitTime={selectedStationRoute.estimatedWaitTime || 0}
                    totalTimeWithDelays={selectedStationRoute.totalTimeWithDelays || 0}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* No Location Fallback */}
        {!isLocating && !searchParams.latitude && (
          <div className="card text-center">
            <div className="card-body">
              <FiMapPin className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Location Required</h3>
              <p className="text-gray-600 mb-4">
                Please allow location access or enter an address to see charging stations.
              </p>
              <button onClick={getCurrentLocation} className="btn btn-primary">
                <FiNavigation />
                Enable Location
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
