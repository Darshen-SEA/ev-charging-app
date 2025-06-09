"use client"

import { useState } from "react"
import { FiMapPin, FiNavigation, FiZap, FiSettings } from "react-icons/fi"

const RouteOptimizer = () => {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [batteryLevel, setBatteryLevel] = useState(80)
  const [range, setRange] = useState(300)
  const [isLoading, setIsLoading] = useState(false)
  const [route, setRoute] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call to get optimized route
    setTimeout(() => {
      setRoute({
        distance: 450,
        duration: 5.5,
        stops: [
          {
            name: "Downtown Charging Hub",
            address: "123 Main St, Los Angeles, CA 90012",
            distance: 120,
            duration: 1.5,
            arrivalBattery: 60,
            chargingTime: 25,
            departureBattery: 90,
          },
          {
            name: "Westside EV Station",
            address: "456 Ocean Ave, Santa Monica, CA 90401",
            distance: 280,
            duration: 3.2,
            arrivalBattery: 40,
            chargingTime: 35,
            departureBattery: 95,
          },
        ],
        finalArrival: {
          distance: 450,
          duration: 5.5,
          arrivalBattery: 45,
        },
      })
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="dashboard-header">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Route Optimizer</h1>
              <p className="text-primary-100">Plan efficient routes with optimal charging stops</p>
            </div>
            <div className="flex items-center gap-4">
              <FiNavigation className="text-4xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Route Parameters</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="form-group">
                    <label htmlFor="origin" className="form-label">
                      <FiMapPin className="inline mr-2" />
                      Starting Point
                    </label>
                    <input
                      type="text"
                      id="origin"
                      className="form-control"
                      placeholder="Enter starting location"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="destination" className="form-label">
                      <FiMapPin className="inline mr-2" />
                      Destination
                    </label>
                    <input
                      type="text"
                      id="destination"
                      className="form-control"
                      placeholder="Enter destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="batteryLevel" className="form-label">
                      <FiZap className="inline mr-2" />
                      Current Battery Level: {batteryLevel}%
                    </label>
                    <input
                      type="range"
                      id="batteryLevel"
                      className="w-full"
                      min="0"
                      max="100"
                      value={batteryLevel}
                      onChange={(e) => setBatteryLevel(Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="range" className="form-label">
                      <FiNavigation className="inline mr-2" />
                      Vehicle Range: {range} km
                    </label>
                    <input
                      type="range"
                      id="range"
                      className="w-full"
                      min="100"
                      max="600"
                      step="10"
                      value={range}
                      onChange={(e) => setRange(Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <button type="button" className="btn btn-secondary btn-sm mb-4">
                      <FiSettings className="mr-2" />
                      Advanced Options
                    </button>

                    <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="loading-spinner mr-2"></div>
                          Calculating Route...
                        </>
                      ) : (
                        <>
                          <FiNavigation className="mr-2" />
                          Calculate Optimal Route
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {route ? (
              <div className="space-y-6">
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-xl font-semibold">Route Summary</h2>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Total Distance</div>
                        <div className="text-2xl font-bold text-primary-700">{route.distance} km</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Total Duration</div>
                        <div className="text-2xl font-bold text-primary-700">{route.duration} hours</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Charging Stops</div>
                        <div className="text-2xl font-bold text-primary-700">{route.stops.length}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                      <div className="font-medium">{origin}</div>
                      <div className="text-sm text-gray-500 ml-auto">Start: {batteryLevel}% battery</div>
                    </div>

                    {route.stops.map((stop, index) => (
                      <div key={index} className="mb-4">
                        <div className="ml-1.5 h-16 border-l-2 border-dashed border-gray-300 relative">
                          <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                            <div className="text-sm text-gray-500">{stop.distance} km</div>
                            <div className="text-sm text-gray-500">{stop.duration} hours</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="w-3 h-3 rounded-full bg-warning-500 mt-1.5"></div>
                          <div className="flex-1">
                            <div className="font-medium">{stop.name}</div>
                            <div className="text-sm text-gray-500">{stop.address}</div>
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <div className="text-gray-500">Arrival</div>
                                  <div className="font-medium">{stop.arrivalBattery}%</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Charging</div>
                                  <div className="font-medium">{stop.chargingTime} min</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Departure</div>
                                  <div className="font-medium">{stop.departureBattery}%</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="ml-1.5 h-16 border-l-2 border-dashed border-gray-300 relative">
                      <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                        <div className="text-sm text-gray-500">
                          {route.finalArrival.distance - route.stops[route.stops.length - 1].distance} km
                        </div>
                        <div className="text-sm text-gray-500">
                          {(route.finalArrival.duration - route.stops[route.stops.length - 1].duration).toFixed(1)}{" "}
                          hours
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success-500"></div>
                      <div className="font-medium">{destination}</div>
                      <div className="text-sm text-gray-500 ml-auto">
                        Arrival: {route.finalArrival.arrivalBattery}% battery
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h2 className="text-xl font-semibold">Route Map</h2>
                  </div>
                  <div className="card-body p-0">
                    <div className="h-[400px] bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <FiMapPin className="text-4xl text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Route map will be displayed here</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card h-full flex items-center justify-center text-center p-8">
                <div>
                  <FiNavigation className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Plan Your Journey</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Enter your starting point, destination, and vehicle details to calculate the optimal route with
                    charging stops.
                  </p>
                  <div className="flex justify-center">
                    <button className="btn btn-primary" onClick={() => document.getElementById("origin").focus()}>
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RouteOptimizer
