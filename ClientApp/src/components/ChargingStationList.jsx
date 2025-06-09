"use client"

import { useState, useMemo, useEffect, useRef, createRef } from "react"
import { FiMapPin, FiNavigation, FiZap, FiClock, FiInfo, FiCheckCircle, FiAlertCircle, FiXCircle } from "react-icons/fi"
import RouteDirections from "./RouteDirections"

const getStatusIcon = (statusTitle) => {
  const title = statusTitle?.toLowerCase() || "unknown"
  if (title.includes("operational") || title.includes("available")) {
    return <FiCheckCircle className="text-success-500" />
  } else if (title.includes("in use") || title.includes("charging")) {
    return <FiClock className="text-primary-500" />
  } else if (title.includes("unavailable") || title.includes("out of order") || title.includes("not operational")) {
    return <FiXCircle className="text-error-500" />
  } else if (title.includes("planned") || title.includes("under construction")) {
    return <FiAlertCircle className="text-warning-500" />
  }
  return <FiInfo className="text-gray-500" />
}

const getStatusBadge = (statusTitle) => {
  const title = statusTitle?.toLowerCase() || "unknown"
  if (title.includes("operational") || title.includes("available")) {
    return "badge badge-success"
  } else if (title.includes("in use") || title.includes("charging")) {
    return "badge badge-info"
  } else if (title.includes("unavailable") || title.includes("out of order") || title.includes("not operational")) {
    return "badge badge-danger"
  } else if (title.includes("planned") || title.includes("under construction")) {
    return "badge badge-warning"
  }
  return "badge badge-secondary"
}

const ChargingStationList = ({
  searchParams,
  stations: stationsFromProps,
  isLoadingStations,
  stationsError: errorFromProps,
  onStationRouteRequest,
  selectedStationRoute,
  routeLoadingForStationId,
  routeError,
  highlightedStationId,
  onStationListItemClick,
  preferredConnectorTypes,
}) => {
  const stationRefs = useRef({})
  const [clientFilterMessage, setClientFilterMessage] = useState(null)
  const [sortBy, setSortBy] = useState("distance")
  const [filterBy, setFilterBy] = useState("all")

  const stationsToDisplay = useMemo(() => {
    setClientFilterMessage(null)
    if (!stationsFromProps || stationsFromProps.length === 0) {
      return []
    }

    let filteredStations = stationsFromProps

    // Filter by range
    if (searchParams && searchParams.rangeKm) {
      const rangeInMiles = Number.parseFloat(searchParams.rangeKm) * 0.621371
      filteredStations = filteredStations.filter(
        (station) =>
          station.AddressInfo &&
          typeof station.AddressInfo.Distance === "number" &&
          station.AddressInfo.Distance <= rangeInMiles,
      )
      if (stationsFromProps.length > 0 && filteredStations.length === 0) {
        setClientFilterMessage(`No stations found within your specified range of ${searchParams.rangeKm} km.`)
        return []
      }
    }

    // Filter by connector types
    if (preferredConnectorTypes && preferredConnectorTypes.length > 0) {
      filteredStations = filteredStations.filter(
        (station) =>
          station.Connections &&
          station.Connections.some(
            (conn) => conn.ConnectionType && preferredConnectorTypes.includes(conn.ConnectionType.Title),
          ),
      )
      if (filteredStations.length === 0) {
        setClientFilterMessage(
          (prevMessage) =>
            (prevMessage ? prevMessage + " " : "") +
            `Additionally, no stations match your preferred connector types: ${preferredConnectorTypes.join(", ")}.`,
        )
      }
    }

    // Filter by availability
    if (filterBy === "available") {
      filteredStations = filteredStations.filter(
        (station) =>
          station.Connections &&
          station.Connections.some(
            (conn) => conn.StatusType?.IsOperational && !conn.StatusType.Title.toLowerCase().includes("in use"),
          ),
      )
    } else if (filterBy === "fast") {
      filteredStations = filteredStations.filter(
        (station) => station.Connections && station.Connections.some((conn) => conn.PowerKW >= 50),
      )
    }

    // Sort stations
    const sortedStations = [...filteredStations].sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return (a.AddressInfo?.Distance || 0) - (b.AddressInfo?.Distance || 0)
        case "power":
          const maxPowerA = Math.max(...(a.Connections?.map((c) => c.PowerKW || 0) || [0]))
          const maxPowerB = Math.max(...(b.Connections?.map((c) => c.PowerKW || 0) || [0]))
          return maxPowerB - maxPowerA
        case "name":
          return (a.AddressInfo?.Title || "").localeCompare(b.AddressInfo?.Title || "")
        default:
          return 0
      }
    })

    return sortedStations
  }, [stationsFromProps, searchParams, preferredConnectorTypes, sortBy, filterBy])

  useEffect(() => {
    const newRefs = {}
    stationsToDisplay.forEach((station) => {
      newRefs[station.ID] = stationRefs.current[station.ID] || createRef()
    })
    stationRefs.current = newRefs
  }, [stationsToDisplay])

  useEffect(() => {
    if (
      highlightedStationId &&
      stationRefs.current[highlightedStationId] &&
      stationRefs.current[highlightedStationId].current
    ) {
      stationRefs.current[highlightedStationId].current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [highlightedStationId, stationsToDisplay])

  const handleStationSelect = (station) => {
    if (onStationRouteRequest) {
      onStationRouteRequest(station)
    }
  }

  if (isLoadingStations) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="loading-spinner mr-3"></div>
        <span className="text-gray-600">Loading charging stations...</span>
      </div>
    )
  }

  if (errorFromProps) {
    return (
      <div className="alert alert-danger">
        <div className="flex items-center gap-2">
          <FiAlertCircle />
          <span>Error loading stations: {errorFromProps}</span>
        </div>
      </div>
    )
  }

  if (clientFilterMessage) {
    return (
      <div className="alert alert-warning">
        <div className="flex items-center gap-2">
          <FiInfo />
          <span>{clientFilterMessage}</span>
        </div>
      </div>
    )
  }

  if (!stationsToDisplay || stationsToDisplay.length === 0) {
    return (
      <div className="text-center p-8">
        <FiMapPin className="text-4xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Stations Found</h3>
        <p className="text-gray-500">
          No charging stations found matching your criteria. Try adjusting your search parameters.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <label htmlFor="sortBy" className="form-label text-sm">
            Sort by
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-control form-select"
          >
            <option value="distance">Distance</option>
            <option value="power">Max Power</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="filterBy" className="form-label text-sm">
            Filter by
          </label>
          <select
            id="filterBy"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="form-control form-select"
          >
            <option value="all">All Stations</option>
            <option value="available">Available Only</option>
            <option value="fast">Fast Chargers (50kW+)</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-4">
        <span className="text-sm text-gray-600">
          {stationsToDisplay.length} station{stationsToDisplay.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* Station Cards */}
      <div className="space-y-3">
        {stationsToDisplay.map((station) => (
          <div
            key={station.ID}
            ref={(el) => (stationRefs.current[station.ID] = el)}
            className={`card cursor-pointer transition-all duration-200 ${
              station.ID === highlightedStationId ? "ring-2 ring-primary-500 bg-primary-50" : "hover:shadow-md"
            }`}
            onClick={() => onStationListItemClick && onStationListItemClick(station)}
          >
            <div className="card-body">
              {/* Station Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {station.AddressInfo?.Title || "Unnamed Station"}
                  </h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <FiMapPin className="text-xs" />
                    {station.AddressInfo?.AddressLine1}, {station.AddressInfo?.Town},{" "}
                    {station.AddressInfo?.StateOrProvince}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-primary-600">
                    {station.AddressInfo?.Distance?.toFixed(1) || "N/A"} mi
                  </div>
                  <div className={getStatusBadge(station.StatusType?.Title)}>
                    {getStatusIcon(station.StatusType?.Title)}
                    <span className="ml-1">{station.StatusType?.Title || "Unknown"}</span>
                  </div>
                </div>
              </div>

              {/* Connectors */}
              {station.Connections && station.Connections.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Available Connectors</h5>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {station.Connections.map((conn, index) => (
                      <div
                        key={conn.ID || index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <FiZap className="text-primary-500" />
                          <span className="font-medium">{conn.ConnectionType?.Title || "Unknown"}</span>
                          {conn.Level?.Title && <span className="badge badge-info text-xs">{conn.Level.Title}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{conn.PowerKW || 0} kW</span>
                          <span className="text-gray-500">×{conn.Quantity || 1}</span>
                          {conn.StatusType?.Title && (
                            <span
                              className={`badge text-xs ${
                                conn.StatusType?.IsOperational ? "badge-success" : "badge-warning"
                              }`}
                            >
                              {conn.StatusType.Title}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-sm text-gray-500">
                  {searchParams &&
                    searchParams.rangeKm &&
                    station.AddressInfo &&
                    typeof station.AddressInfo.Distance === "number" &&
                    station.AddressInfo.Distance > Number.parseFloat(searchParams.rangeKm) * 0.621371 && (
                      <span className="text-warning-600 font-medium">⚠️ May be out of range</span>
                    )}
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStationSelect(station)
                  }}
                  disabled={routeLoadingForStationId === station.ID}
                >
                  {routeLoadingForStationId === station.ID ? (
                    <>
                      <div className="loading-spinner mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <FiNavigation className="mr-2" />
                      Get Route
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Route Error */}
      {routeError && (
        <div className="alert alert-danger">
          <div className="flex items-center gap-2">
            <FiAlertCircle />
            <span>Route Error: {routeError}</span>
          </div>
        </div>
      )}

      {/* Route Information */}
      {selectedStationRoute && selectedStationRoute.routes && selectedStationRoute.routes.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h4 className="font-semibold">Route Information</h4>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-2xl font-bold text-primary-600">
                  {(selectedStationRoute.routes[0].summary.distance / 1000).toFixed(1)} km
                </div>
                <div className="text-sm text-gray-600">Distance</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600">
                  {(selectedStationRoute.routes[0].summary.duration / 60).toFixed(0)} min
                </div>
                <div className="text-sm text-gray-600">Estimated Time</div>
              </div>
            </div>

            {searchParams && searchParams.rangeKm && (
              <div
                className={`alert ${
                  (selectedStationRoute.routes[0].summary.distance / 1000) <= searchParams.rangeKm
                    ? "alert-success"
                    : "alert-warning"
                }`}
              >
                {selectedStationRoute.routes[0].summary.distance / 1000 <= searchParams.rangeKm
                  ? `✅ Within your specified range of ${searchParams.rangeKm} km`
                  : `⚠️ Beyond your specified range of ${searchParams.rangeKm} km`}
              </div>
            )}

            {selectedStationRoute.routes[0].segments &&
              selectedStationRoute.routes[0].segments.length > 0 &&
              selectedStationRoute.routes[0].segments[0].steps && (
                <RouteDirections
                  steps={selectedStationRoute.routes[0].segments[0].steps}
                  elevationInfo={null}
                  trafficDelay={selectedStationRoute.trafficDelay || 0}
                  estimatedWaitTime={selectedStationRoute.estimatedWaitTime || 0}
                  totalTimeWithDelays={selectedStationRoute.totalTimeWithDelays || 0}
                />
              )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ChargingStationList
