"use client"

import { useState, useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import AppRoutes from "./AppRoutes"
import "./custom.css"
import { FiX, FiInfo, FiCheckCircle, FiAlertTriangle, FiZap } from "react-icons/fi"

const App = () => {
  const [notification, setNotification] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState(null)

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setNotification({
        type: "success",
        title: "Connected",
        message: "You are back online.",
        icon: <FiCheckCircle />,
        timeout: 3000,
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      setNotification({
        type: "warning",
        title: "Offline",
        message: "You are currently offline. Some features may be limited.",
        icon: <FiAlertTriangle />,
        timeout: 0, // No timeout for offline notification
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check initial status
    if (!navigator.onLine) {
      handleOffline()
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Handle service worker registration and updates
  useEffect(() => {
    const handleServiceWorkerRegistered = (event) => {
      setServiceWorkerRegistration(event.detail)
    }

    const handleInAppNotification = (event) => {
      const { title, message } = event.detail

      setNotification({
        type: "info",
        title,
        message,
        icon: <FiInfo />,
        timeout: 5000,
      })
    }

    window.addEventListener("serviceWorkerRegistered", handleServiceWorkerRegistered)
    window.addEventListener("inAppNotification", handleInAppNotification)

    return () => {
      window.removeEventListener("serviceWorkerRegistered", handleServiceWorkerRegistered)
      window.removeEventListener("inAppNotification", handleInAppNotification)
    }
  }, [])

  // Handle service worker update
  const handleUpdate = () => {
    if (serviceWorkerRegistration && serviceWorkerRegistration.waiting) {
      // Send a message to the service worker to skip waiting and activate the new version
      serviceWorkerRegistration.waiting.postMessage({ type: "SKIP_WAITING" })
      setIsUpdateAvailable(false)

      // Reload the page to ensure the new service worker takes control
      window.location.reload()
    }
  }

  // Clear notification after timeout
  useEffect(() => {
    if (notification && notification.timeout > 0) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, notification.timeout)

      return () => clearTimeout(timer)
    }
  }, [notification])

  return (
    <div className="app-container">
      {/* Notification System */}
      {notification && (
        <div className={`notification notification-${notification.type} fade-in`}>
          <div className="notification-icon">{notification.icon}</div>
          <div className="notification-content">
            <h4 className="notification-title">{notification.title}</h4>
            <p className="notification-message">{notification.message}</p>
          </div>
          <button className="notification-close" onClick={() => setNotification(null)} aria-label="Close notification">
            <FiX />
          </button>
        </div>
      )}

      {/* Update Available Banner */}
      {isUpdateAvailable && (
        <div className="update-banner">
          <div className="container">
            <div className="update-banner-content">
              <FiInfo className="update-banner-icon" />
              <span>A new version is available!</span>
              <button className="btn btn-sm btn-primary" onClick={handleUpdate}>
                Update Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="offline-indicator">
          <div className="container">
            <FiAlertTriangle className="offline-indicator-icon" />
            <span>Offline Mode</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="app-main">
        <Routes>
          {AppRoutes.map((route, index) => {
            const { element, ...rest } = route
            return <Route key={index} {...rest} element={element} />
          })}
        </Routes>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <FiZap className="footer-logo-icon" />
              <span>EV Charging Station Manager</span>
            </div>
            <div className="footer-links">
              <a href="#about">About</a>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#help">Help</a>
            </div>
            <div className="footer-copyright">
              &copy; {new Date().getFullYear()} EV Charging Station Manager. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
