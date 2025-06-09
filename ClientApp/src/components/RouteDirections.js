// c:\Coding\ev-charging-app\ClientApp\src\components\RouteDirections.js
import React from 'react';

const RouteDirections = ({ steps, elevationInfo, trafficDelay, estimatedWaitTime, totalTimeWithDelays }) => {
    if (!steps || steps.length === 0) {
        return <p>No turn-by-turn directions available.</p>;
    }

    // Helper to convert meters to a more readable format (km or m)
    const formatDistance = (distanceMeters) => {
        if (distanceMeters >= 1000) {
            return `${(distanceMeters / 1000).toFixed(1)} km`;
        }
        return `${Math.round(distanceMeters)} m`;
    };

    // Helper to convert seconds to a more readable format (min or sec)
    const formatDuration = (durationSeconds) => {
        if (durationSeconds >= 60) {
            return `${Math.round(durationSeconds / 60)} min`;
        }
        return `${Math.round(durationSeconds)} sec`;
    };

    // Helper to format time in minutes to a readable format (hours and minutes)
    const formatMinutes = (minutes) => {
        if (minutes < 60) return `${Math.round(minutes)} min`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
    };

    return (
        <div className="mt-3">
            {/* Route Summary */}
            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title">Route Summary</h5>
                    {trafficDelay > 0 && (
                        <div className="alert alert-warning">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            Traffic delay: ~{formatMinutes(trafficDelay)} due to road conditions
                        </div>
                    )}
                    {estimatedWaitTime > 0 && (
                        <div className="alert alert-info">
                            <i className="bi bi-clock-history me-2"></i>
                            Estimated wait time at station: ~{formatMinutes(estimatedWaitTime)}
                        </div>
                    )}
                    {totalTimeWithDelays > 0 && (
                        <div className="alert alert-light">
                            <i className="bi bi-clock me-2"></i>
                            <strong>Total estimated time (travel + wait):</strong> ~{formatMinutes(totalTimeWithDelays)}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Elevation Info */}
            {elevationInfo && <p className="alert alert-info">{elevationInfo}</p>}
            
            {/* Turn-by-Turn Directions */}
            <h5>Turn-by-Turn Directions:</h5>
            <ul className="list-group">
                {steps.map((step, index) => (
                    <li key={index} className="list-group-item">
                        <strong>{index + 1}.</strong> {step.instruction}
                        {step.name && step.name.length > 0 && (
                            <em> on {step.name}</em>
                        )}
                        <br />
                        <small>
                            Distance: {formatDistance(step.distance)} | Duration: {formatDuration(step.duration)}
                        </small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RouteDirections;
