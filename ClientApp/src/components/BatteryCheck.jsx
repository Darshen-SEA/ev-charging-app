"use client"

import { useState } from "react"
import { FiBattery, FiZap, FiAlertTriangle, FiCheckCircle, FiBarChart2 } from "react-icons/fi"

const BatteryCheck = () => {
  const [batteryData, setBatteryData] = useState({
    health: 92,
    cycles: 156,
    temperature: 28,
    voltage: 380.5,
    capacity: 88,
    estimatedRange: 285,
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)

    // Simulate API call to get battery data
    setTimeout(() => {
      setBatteryData({
        health: Math.floor(Math.random() * 10) + 85,
        cycles: batteryData.cycles + Math.floor(Math.random() * 3),
        temperature: Math.floor(Math.random() * 10) + 25,
        voltage: 375 + Math.random() * 10,
        capacity: Math.floor(Math.random() * 10) + 80,
        estimatedRange: Math.floor(Math.random() * 30) + 270,
      })
      setIsLoading(false)
    }, 1500)
  }

  const getBatteryHealthStatus = (health) => {
    if (health >= 90) return { status: "Excellent", color: "text-success-600", icon: <FiCheckCircle /> }
    if (health >= 80) return { status: "Good", color: "text-primary-600", icon: <FiCheckCircle /> }
    if (health >= 70) return { status: "Fair", color: "text-warning-600", icon: <FiAlertTriangle /> }
    return { status: "Poor", color: "text-error-600", icon: <FiAlertTriangle /> }
  }

  const healthStatus = getBatteryHealthStatus(batteryData.health)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="dashboard-header">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Battery Health Check</h1>
              <p className="text-primary-100">Monitor and analyze your EV battery performance</p>
            </div>
            <div className="flex items-center gap-4">
              <FiBattery className="text-4xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Battery Health Overview</h2>
                  <button className="btn btn-secondary btn-sm" onClick={handleRefresh} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="loading-spinner mr-2"></div>
                        Refreshing...
                      </>
                    ) : (
                      <>Refresh</>
                    )}
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={
                          batteryData.health >= 90
                            ? "#22c55e"
                            : batteryData.health >= 80
                              ? "#0ea5e9"
                              : batteryData.health >= 70
                                ? "#f59e0b"
                                : "#ef4444"
                        }
                        strokeWidth="10"
                        strokeDasharray={`${batteryData.health * 2.83} 283`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                      <text x="50" y="45" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1f2937">
                        {batteryData.health}%
                      </text>
                      <text x="50" y="65" textAnchor="middle" fontSize="12" fill="#6b7280">
                        Health
                      </text>
                    </svg>
                  </div>

                  <div className="flex-1">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-lg font-semibold ${healthStatus.color}`}>
                          {healthStatus.icon}
                          <span className="ml-2">{healthStatus.status}</span>
                        </span>
                      </div>
                      <p className="text-gray-600">
                        Your battery is in {healthStatus.status.toLowerCase()} condition.
                        {batteryData.health >= 80
                          ? " It's performing well and should provide reliable service."
                          : " Consider having it checked by a professional."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Estimated Range</div>
                        <div className="text-2xl font-bold text-primary-700">{batteryData.estimatedRange} km</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Current Capacity</div>
                        <div className="text-2xl font-bold text-primary-700">{batteryData.capacity}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Battery Performance History</h2>
              </div>
              <div className="card-body">
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <FiBarChart2 className="text-4xl text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Battery performance history will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card mb-6">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Battery Details</h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiZap className="text-primary-500" />
                      <span className="font-medium">Voltage</span>
                    </div>
                    <span className="font-semibold">{batteryData.voltage.toFixed(1)} V</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiBarChart2 className="text-primary-500" />
                      <span className="font-medium">Charge Cycles</span>
                    </div>
                    <span className="font-semibold">{batteryData.cycles}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiAlertTriangle className="text-primary-500" />
                      <span className="font-medium">Temperature</span>
                    </div>
                    <span className="font-semibold">{batteryData.temperature}°C</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Recommendations</h2>
              </div>
              <div className="card-body">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-success-500 mt-1" />
                    <span>Avoid frequent fast charging to preserve battery health</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-success-500 mt-1" />
                    <span>Keep battery charge between 20% and 80% for optimal lifespan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-success-500 mt-1" />
                    <span>Park in shaded areas to prevent battery overheating</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FiCheckCircle className="text-success-500 mt-1" />
                    <span>Schedule a professional battery check every 10,000 miles</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BatteryCheck
