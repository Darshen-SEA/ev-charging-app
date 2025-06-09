import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals"

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Collect and report Core Web Vitals metrics
    getCLS(onPerfEntry) // Cumulative Layout Shift
    getFID(onPerfEntry) // First Input Delay
    getFCP(onPerfEntry) // First Contentful Paint
    getLCP(onPerfEntry) // Largest Contentful Paint
    getTTFB(onPerfEntry) // Time to First Byte

    // Log performance metrics to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("Performance metrics are being collected")
    }

    // Custom metric tracking for app-specific events
    trackAppSpecificMetrics(onPerfEntry)
  }
}

// Track app-specific performance metrics
const trackAppSpecificMetrics = (onPerfEntry) => {
  // Track time to load map
  window.addEventListener("mapLoaded", (event) => {
    const metric = {
      name: "map-load-time",
      value: event.detail.loadTime,
      id: "map",
    }
    onPerfEntry(metric)
  })

  // Track time to load station data
  window.addEventListener("stationsLoaded", (event) => {
    const metric = {
      name: "stations-load-time",
      value: event.detail.loadTime,
      id: "stations",
    }
    onPerfEntry(metric)
  })

  // Track route calculation time
  window.addEventListener("routeCalculated", (event) => {
    const metric = {
      name: "route-calculation-time",
      value: event.detail.calculationTime,
      id: "route",
    }
    onPerfEntry(metric)
  })
}

export default reportWebVitals
