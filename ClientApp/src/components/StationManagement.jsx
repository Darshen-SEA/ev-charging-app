"use client"

import { useState } from "react"
import { FiSettings, FiEdit, FiTrash2, FiPlus, FiSearch, FiFilter, FiMapPin } from "react-icons/fi"

const StationManagement = () => {
  const [stations, setStations] = useState([
    {
      id: 1,
      name: "Downtown Charging Hub",
      address: "123 Main St, Los Angeles, CA 90012",
      status: "operational",
      connectors: [
        { type: "CCS", power: 150, status: "available" },
        { type: "CHAdeMO", power: 100, status: "available" },
        { type: "Type 2", power: 22, status: "in-use" },
      ],
      lastMaintenance: "2023-05-15",
      nextMaintenance: "2023-11-15",
    },
    {
      id: 2,
      name: "Westside EV Station",
      address: "456 Ocean Ave, Santa Monica, CA 90401",
      status: "operational",
      connectors: [
        { type: "CCS", power: 350, status: "available" },
        { type: "CCS", power: 350, status: "in-use" },
        { type: "Type 2", power: 22, status: "available" },
      ],
      lastMaintenance: "2023-06-22",
      nextMaintenance: "2023-12-22",
    },
    {
      id: 3,
      name: "Valley Charging Center",
      address: "789 Valley Blvd, Sherman Oaks, CA 91403",
      status: "maintenance",
      connectors: [
        { type: "CCS", power: 50, status: "offline" },
        { type: "CHAdeMO", power: 50, status: "offline" },
        { type: "Type 2", power: 11, status: "offline" },
      ],
      lastMaintenance: "2023-08-05",
      nextMaintenance: "2024-02-05",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const filteredStations = stations.filter((station) => {
    const matchesSearch =
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.address.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || station.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDeleteStation = (id) => {
    if (window.confirm("Are you sure you want to delete this station?")) {
      setStations(stations.filter((station) => station.id !== id))
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "operational":
        return <span className="badge badge-success">Operational</span>
      case "maintenance":
        return <span className="badge badge-warning">Maintenance</span>
      case "offline":
        return <span className="badge badge-danger">Offline</span>
      default:
        return <span className="badge badge-secondary">{status}</span>
    }
  }

  const getConnectorStatusBadge = (status) => {
    switch (status) {
      case "available":
        return <span className="badge badge-success">Available</span>
      case "in-use":
        return <span className="badge badge-info">In Use</span>
      case "offline":
        return <span className="badge badge-danger">Offline</span>
      default:
        return <span className="badge badge-secondary">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="dashboard-header">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Station Management</h1>
              <p className="text-primary-100">Manage and monitor your charging station network</p>
            </div>
            <div className="flex items-center gap-4">
              <FiSettings className="text-4xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Controls */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <input
                    type="text"
                    className="form-control pl-10"
                    placeholder="Search stations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <FiFilter className="text-gray-500" />
                  <select
                    className="form-control form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="operational">Operational</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                  <FiPlus className="mr-2" />
                  Add Station
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stations List */}
        <div className="space-y-6">
          {filteredStations.length === 0 ? (
            <div className="card text-center py-8">
              <FiMapPin className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Stations Found</h3>
              <p className="text-gray-500">No stations match your search criteria. Try adjusting your filters.</p>
            </div>
          ) : (
            filteredStations.map((station) => (
              <div key={station.id} className="card">
                <div className="card-body">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{station.name}</h3>
                          <p className="text-gray-600 flex items-center gap-1">
                            <FiMapPin className="text-xs" />
                            {station.address}
                          </p>
                        </div>
                        <div>{getStatusBadge(station.status)}</div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Connectors</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {station.connectors.map((connector, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{connector.type}</span>
                                <span className="text-sm text-gray-600">{connector.power} kW</span>
                              </div>
                              <div>{getConnectorStatusBadge(connector.status)}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">Last Maintenance</span>
                          <div className="font-medium">{station.lastMaintenance}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Next Maintenance</span>
                          <div className="font-medium">{station.nextMaintenance}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-3 justify-start">
                      <button className="btn btn-secondary">
                        <FiEdit className="mr-2" />
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDeleteStation(station.id)}>
                        <FiTrash2 className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Station Modal (placeholder) */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="text-xl font-semibold">Add New Station</h2>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p className="text-gray-600">This is a placeholder for the add station form.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary">Add Station</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StationManagement
