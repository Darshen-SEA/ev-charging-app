// c:\Coding\ev-charging-app\ClientApp\src\components\RouteDirections.js
import React from 'react';

const RouteDirections = ({ steps, elevationInfo }) => {
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

    return (
        <div className="mt-3">
            {elevationInfo && <p className="alert alert-info">{elevationInfo}</p>}
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
