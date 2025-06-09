"use client"

import { useState } from "react"
import { FiUser, FiTruck as FiCar, FiMapPin, FiBell, FiShield, FiSave } from "react-icons/fi"

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile")
  const [formData, setFormData] = useState({
    // Profile settings
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",

    // Vehicle settings
    vehicleMake: "Tesla",
    vehicleModel: "Model 3",
    vehicleYear: "2022",
    batteryCapacity: "75",
    maxRange: "350",

    // Location settings
    defaultLocation: "Los Angeles, CA",
    searchRadius: "25",

    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    lowBatteryAlerts: true,
    chargingCompleteAlerts: true,

    // Privacy settings
    shareLocation: true,
    shareChargingData: false,
    allowAnalytics: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate saving settings
    setTimeout(() => {
      alert("Settings saved successfully!")
    }, 500)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Profile Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="form-control"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="form-control"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )

      case "vehicle":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Vehicle Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="vehicleMake" className="form-label">
                  Vehicle Make
                </label>
                <input
                  type="text"
                  id="vehicleMake"
                  name="vehicleMake"
                  className="form-control"
                  value={formData.vehicleMake}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="vehicleModel" className="form-label">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  id="vehicleModel"
                  name="vehicleModel"
                  className="form-control"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="vehicleYear" className="form-label">
                  Vehicle Year
                </label>
                <input
                  type="text"
                  id="vehicleYear"
                  name="vehicleYear"
                  className="form-control"
                  value={formData.vehicleYear}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="batteryCapacity" className="form-label">
                  Battery Capacity
                </label>
                <input
                  type="text"
                  id="batteryCapacity"
                  name="batteryCapacity"
                  className="form-control"
                  value={formData.batteryCapacity}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="maxRange" className="form-label">
                  Max Range
                </label>
                <input
                  type="text"
                  id="maxRange"
                  name="maxRange"
                  className="form-control"
                  value={formData.maxRange}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )

      case "location":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Location Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="defaultLocation" className="form-label">
                  Default Location
                </label>
                <input
                  type="text"
                  id="defaultLocation"
                  name="defaultLocation"
                  className="form-control"
                  value={formData.defaultLocation}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="searchRadius" className="form-label">
                  Search Radius
                </label>
                <input
                  type="text"
                  id="searchRadius"
                  name="searchRadius"
                  className="form-control"
                  value={formData.searchRadius}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Notification Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="emailNotifications" className="form-label">
                  Email Notifications
                </label>
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  className="form-control"
                  checked={formData.emailNotifications}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="pushNotifications" className="form-label">
                  Push Notifications
                </label>
                <input
                  type="checkbox"
                  id="pushNotifications"
                  name="pushNotifications"
                  className="form-control"
                  checked={formData.pushNotifications}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lowBatteryAlerts" className="form-label">
                  Low Battery Alerts
                </label>
                <input
                  type="checkbox"
                  id="lowBatteryAlerts"
                  name="lowBatteryAlerts"
                  className="form-control"
                  checked={formData.lowBatteryAlerts}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="chargingCompleteAlerts" className="form-label">
                  Charging Complete Alerts
                </label>
                <input
                  type="checkbox"
                  id="chargingCompleteAlerts"
                  name="chargingCompleteAlerts"
                  className="form-control"
                  checked={formData.chargingCompleteAlerts}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )

      case "privacy":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Privacy Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="shareLocation" className="form-label">
                  Share Location
                </label>
                <input
                  type="checkbox"
                  id="shareLocation"
                  name="shareLocation"
                  className="form-control"
                  checked={formData.shareLocation}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="shareChargingData" className="form-label">
                  Share Charging Data
                </label>
                <input
                  type="checkbox"
                  id="shareChargingData"
                  name="shareChargingData"
                  className="form-control"
                  checked={formData.shareChargingData}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="allowAnalytics" className="form-label">
                  Allow Analytics
                </label>
                <input
                  type="checkbox"
                  id="allowAnalytics"
                  name="allowAnalytics"
                  className="form-control"
                  checked={formData.allowAnalytics}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="settings-container">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <FiUser /> Profile
        </button>
        <button
          className={`tab-button ${activeTab === "vehicle" ? "active" : ""}`}
          onClick={() => setActiveTab("vehicle")}
        >
          <FiCar /> Vehicle
        </button>
        <button
          className={`tab-button ${activeTab === "location" ? "active" : ""}`}
          onClick={() => setActiveTab("location")}
        >
          <FiMapPin /> Location
        </button>
        <button
          className={`tab-button ${activeTab === "notifications" ? "active" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          <FiBell /> Notifications
        </button>
        <button
          className={`tab-button ${activeTab === "privacy" ? "active" : ""}`}
          onClick={() => setActiveTab("privacy")}
        >
          <FiShield /> Privacy
        </button>
      </div>
      <form onSubmit={handleSubmit} className="settings-form">
        {renderTabContent()}
        <button type="submit" className="submit-button">
          <FiSave /> Save Settings
        </button>
      </form>
    </div>
  )
}

export default Settings
