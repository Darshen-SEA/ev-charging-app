// c:\Coding\ev-charging-app\ClientApp\src\components\UserInputForm.js
import React, { useState, useEffect } from 'react';

const UserInputForm = ({ onSubmit, availableConnectorTypes = [] }) => {
    const [batteryPercentage, setBatteryPercentage] = useState('');
    const [rangeKm, setRangeKm] = useState('');
    const [searchRadius, setSearchRadius] = useState(25); // Default search radius in miles
    const [minPower, setMinPower] = useState(() => {
        const savedMinPower = localStorage.getItem('minPower');
        return savedMinPower ? parseInt(savedMinPower, 10) : 0;
    });
    const [preferredConnectorTypes, setPreferredConnectorTypes] = useState(() => {
        const savedConnectorTypes = localStorage.getItem('preferredConnectorTypes');
        return savedConnectorTypes ? JSON.parse(savedConnectorTypes) : [];
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if ((!batteryPercentage && !rangeKm) || !searchRadius) {
            alert('Please enter either battery percentage or range in km, and a search radius.');
            return;
        }
        onSubmit({
            batteryPercentage: batteryPercentage ? parseInt(batteryPercentage) : null,
            rangeKm: rangeKm ? parseInt(rangeKm) : null,
            searchRadius: parseInt(searchRadius),
            minPower: parseInt(minPower),
            preferredConnectorTypes: preferredConnectorTypes
        });
    };

    useEffect(() => {
        localStorage.setItem('minPower', minPower.toString());
    }, [minPower]);

    useEffect(() => {
        localStorage.setItem('preferredConnectorTypes', JSON.stringify(preferredConnectorTypes));
    }, [preferredConnectorTypes]);

    return (
        <form onSubmit={handleSubmit} className="mb-3">
            <h4>Find Suitable Stations</h4>
            {/* Row for Battery/Range and Search Radius */}
            <div className="row g-3 align-items-end mb-3">
                <div className="col-md">
                    <label htmlFor="batteryPercentage" className="form-label">Current Battery (%)</label>
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
                <div className="col-md-auto pt-3">
                    <span className="form-text">OR</span>
                </div>
                <div className="col-md">
                    <label htmlFor="rangeKm" className="form-label">Remaining Range (km)</label>
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
                <div className="col-md">
                    <label htmlFor="searchRadius" className="form-label">Search Radius (miles)</label>
                    <input
                        type="number"
                        className="form-control"
                        id="searchRadius"
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(e.target.value)}
                        min="1"
                        required
                    />
                </div>
            </div>

            {/* Row for Preferences */}
            <h5>Preferences</h5>
            <div className="row g-3 align-items-end mb-3">
                <div className="col-md">
                    <label htmlFor="minPower" className="form-label">Minimum Power (kW)</label>
                    <select 
                        className="form-select" 
                        id="minPower" 
                        value={minPower} 
                        onChange={(e) => setMinPower(e.target.value)}
                    >
                        <option value="0">Any Power</option>
                        <option value="7">7 kW+</option>
                        <option value="22">22 kW+</option>
                        <option value="50">50 kW+ (Fast)</option>
                        <option value="100">100 kW+ (Rapid)</option>
                        <option value="150">150 kW+ (Ultra-Rapid)</option>
                    </select>
                </div>
                <div className="col-md">
                    <label htmlFor="preferredConnectorTypes" className="form-label">Preferred Connector Types</label>
                    <select 
                        multiple 
                        className="form-select" 
                        id="preferredConnectorTypes" 
                        value={preferredConnectorTypes} 
                        onChange={(e) => setPreferredConnectorTypes(Array.from(e.target.selectedOptions, option => option.value))}
                        style={{ height: '150px' }} // Adjust height as needed
                    >
                        {/* These should ideally be populated from a central list or API data */}
                        <option value="Type 1 (J1772)">Type 1 (J1772)</option>
                        <option value="Type 2 (Mennekes)">Type 2 (Mennekes)</option>
                        <option value="CCS (Type 1)">CCS (Type 1)</option>
                        <option value="CCS (Type 2)">CCS (Type 2)</option>
                        <option value="CHAdeMO">CHAdeMO</option>
                        <option value="Tesla (Roadster)">Tesla (Roadster)</option>
                        <option value="Tesla (Model S/X)">Tesla (Model S/X)</option>
                        <option value="Tesla (CSS)">Tesla (CCS)</option>
                        {/* Add more common types or dynamically populate */}
                        {availableConnectorTypes && availableConnectorTypes.map(ct => (
                            <option key={ct.ID || ct.Title} value={ct.Title}>{ct.Title}</option>
                        ))}
                    </select>
                    <small className="form-text text-muted">Hold Ctrl/Cmd to select multiple.</small>
                </div>
            </div>

            {/* Submit Button Row */}
            <div className="row">
                <div className="col">
                    <button type="submit" className="btn btn-primary w-100">Search Stations</button>
                </div>
            </div>
            <small className="form-text text-muted mt-2 d-block">
                Enter either your current battery percentage or estimated remaining range in kilometers.
            </small>
        </form>
    );
};

export default UserInputForm;
