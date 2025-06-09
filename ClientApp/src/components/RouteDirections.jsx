import { FiNavigation, FiClock, FiAlertTriangle, FiInfo, FiMapPin, FiTrendingUp } from "react-icons/fi"

const RouteDirections = ({ steps, elevationInfo, trafficDelay, estimatedWaitTime, totalTimeWithDelays }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-center p-6">
        <FiNavigation className="text-4xl text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No turn-by-turn directions available.</p>
      </div>
    )
  }

  const formatDistance = (distanceMeters) => {
    if (distanceMeters >= 1000) {
      return `${(distanceMeters / 1000).toFixed(1)} km`
    }
    return `${Math.round(distanceMeters)} m`
  }

  const formatDuration = (durationSeconds) => {
    if (durationSeconds >= 60) {
      return `${Math.round(durationSeconds / 60)} min`
    }
    return `${Math.round(durationSeconds)} sec`
  }

  const formatMinutes = (minutes) => {
    if (minutes < 60) return `${Math.round(minutes)} min`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  const getInstructionIcon = (instruction) => {
    const inst = instruction.toLowerCase()
    if (inst.includes("left")) return "↰"
    if (inst.includes("right")) return "↱"
    if (inst.includes("straight") || inst.includes("continue")) return "↑"
    if (inst.includes("u-turn")) return "↶"
    if (inst.includes("exit")) return "↗"
    return "→"
  }

  return (
    <div className="space-y-4">
      {/* Route Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trafficDelay > 0 && (
          <div className="card bg-warning-50 border-warning-200">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <FiAlertTriangle className="text-warning-600 text-xl" />
                <div>
                  <div className="font-semibold text-warning-800">Traffic Delay</div>
                  <div className="text-sm text-warning-700">~{formatMinutes(trafficDelay)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {estimatedWaitTime > 0 && (
          <div className="card bg-info-50 border-primary-200">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <FiClock className="text-primary-600 text-xl" />
                <div>
                  <div className="font-semibold text-primary-800">Wait Time</div>
                  <div className="text-sm text-primary-700">~{formatMinutes(estimatedWaitTime)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {totalTimeWithDelays > 0 && (
          <div className="card bg-success-50 border-success-200">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <FiTrendingUp className="text-success-600 text-xl" />
                <div>
                  <div className="font-semibold text-success-800">Total Time</div>
                  <div className="text-sm text-success-700">~{formatMinutes(totalTimeWithDelays)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Elevation Info */}
      {elevationInfo && (
        <div className="alert alert-info">
          <div className="flex items-center gap-2">
            <FiInfo />
            <span>{elevationInfo}</span>
          </div>
        </div>
      )}

      {/* Turn-by-Turn Directions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FiNavigation />
            Turn-by-Turn Directions
          </h3>
        </div>
        <div className="card-body p-0">
          <div className="divide-y divide-gray-100">
            {steps.map((step, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Step Number and Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                  </div>

                  {/* Direction Icon */}
                  <div className="flex-shrink-0 text-2xl text-gray-600 mt-1">
                    {getInstructionIcon(step.instruction)}
                  </div>

                  {/* Instruction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 mb-1">{step.instruction}</div>
                    {step.name && step.name.length > 0 && (
                      <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                        <FiMapPin className="text-xs" />
                        on {step.name}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                        {formatDistance(step.distance)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="text-xs" />
                        {formatDuration(step.duration)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RouteDirections
