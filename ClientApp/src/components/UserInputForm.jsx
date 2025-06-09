"use client"

import { useState, useEffect } from "react"
import { FiSearch, FiSettings, FiZap, FiMapPin } from "react-icons/fi"

const UserInputForm = ({ onSubmit, availableConnectorTypes = [] }) => {
  const [batteryPercentage, setBatteryPercentage] = useState("")
  const [rangeKm, setRangeKm] = useState("")
  const [searchRadius, setSearchRadius] = useState(25)
  const [minPower, setMinPower] = useState(() => {
    const savedMinPower = localStorage.getItem("minPower")
    return savedMinPower ? Number.parseInt(savedMinPower, 10) : 0
  })
  const [preferredConnectorTypes, setPreferredConnectorTypes] = useState(() => {
    const savedConnectorTypes = localStorage.getItem("preferredConnectorTypes")
    return savedConnectorTypes ? JSON.parse(savedConnectorTypes) : []
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if ((!batteryPercentage && !rangeKm) || !searchRadius) {
      alert("Please enter either battery percentage or range in km, and a search radius.")
      return
    }

    onSubmit({
      batteryPercentage: batteryPercentage ? Number.parseInt(batteryPercentage) : null,
      rangeKm: rangeKm ? Number.parseInt(rangeKm) : null,
      searchRadius: Number.parseInt(searchRadius),
      minPower: Number.parseInt(minPower),
      preferredConnectorTypes: preferredConnectorTypes,
    })
  }

  useEffect(() => {
    localStorage.setItem("minPower", minPower.toString())
  }, [minPower])

  useEffect(() => {
    localStorage.setItem("preferredConnectorTypes", JSON.stringify(preferredConnectorTypes))
  }, [preferredConnectorTypes])

  const powerOptions = [
    { value: 0, label: "Any Power", icon: "⚡" },
    { value: 7, label: "7 kW+ (Level 2)", icon: "🔌" },
    { value: 22, label: "22 kW+ (Fast AC)", icon: "⚡" },
    { value: 50, label: "50 kW+ (DC Fast)", icon: "🚀" },
    { value: 100, label: "100 kW+ (Rapid)", icon: "⚡" },
    { value: 150, label: "150 kW+ (Ultra-Rapid)", icon: "🚀" },
  ]

  const connectorOptions = [
    "Type 1 (J1772)",
    "Type 2 (Mennekes)",
    "CCS (Type 1)",
    "CCS (Type 2)",
    "CHAdeMO",
    "Tesla (Roadster)",
    "Tesla (Model S/X)",
    "Tesla (CCS)",
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Search Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-group">
          <label htmlFor="batteryPercentage" className="form-label">
            <FiZap className="inline mr-2" />
            Current Battery (%)
          </label>
          <input
            type="number"
            className="form-control"
            id="batteryPercentage"
            value={batteryPercentage}
            onChange={(e) => setBatteryPercentage(e.target.value)}
            placeholder="e.g., 50"
            min="0"
            max="100"
          />
        </div>

        <div className="form-group">
          <div className="flex items-center justify-center py-4">
            <span className="text-gray-500 font-medium">OR</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rangeKm" className="form-label">
            <FiMapPin className="inline mr-2" />
            Remaining Range (km)
          </label>
          <input
            type="number"
            className="form-control"
            id="rangeKm"
            value={rangeKm}
            onChange={(e) => setRangeKm(e.target.value)}
            placeholder="e.g., 150"
            min="0"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="searchRadius" className="form-label">
          Search Radius (miles)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            className="flex-1"
            id="searchRadius"
            value={searchRadius}
            onChange={(e) => setSearchRadius(e.target.value)}
            min="1"
            max="100"
            style={{
              background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${searchRadius}%, var(--gray-200) ${searchRadius}%, var(--gray-200) 100%)`,
            }}
          />
          <span className="badge badge-info min-w-[60px] text-center">{searchRadius} mi</span>
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <div className="border-t pt-4">
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="btn btn-secondary btn-sm">
          <FiSettings className="mr-2" />
          {showAdvanced ? "Hide" : "Show"} Advanced Options
        </button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg fade-in">
          <h4 className="font-semibold text-gray-800 mb-4">Charging Preferences</h4>

          <div className="form-group">
            <label htmlFor="minPower" className="form-label">
              Minimum Power Output
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {powerOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    minPower === option.value
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="minPower"
                    value={option.value}
                    checked={minPower === option.value}
                    onChange={(e) => setMinPower(Number.parseInt(e.target.value))}
                    className="sr-only"
                  />
                  <span className="mr-2">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="preferredConnectorTypes" className="form-label">
              Preferred Connector Types
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg bg-white">
              {connectorOptions.map((connector) => (
                <label key={connector} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    value={connector}
                    checked={preferredConnectorTypes.includes(connector)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferredConnectorTypes([...preferredConnectorTypes, connector])
                      } else {
                        setPreferredConnectorTypes(preferredConnectorTypes.filter((type) => type !== connector))
                      }
                    }}
                    className="mr-3 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm">{connector}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Select multiple connector types that your vehicle supports</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <button type="submit" className="btn btn-primary btn-lg">
          <FiSearch className="mr-2" />
          Search Charging Stations
        </button>
      </div>

      <p className="text-sm text-gray-500 text-center">
        Enter either your current battery percentage or estimated remaining range to find suitable charging stations.
      </p>
    </form>
  )
}

export default UserInputForm
