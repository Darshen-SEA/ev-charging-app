// This code registers a service worker to enable offline capabilities,
// faster loading on subsequent visits, and PWA features.

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    window.location.hostname === "[::1]" ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/),
)

export function register(config) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href)

    if (publicUrl.origin !== window.location.origin) {
      // Service worker won't work if PUBLIC_URL is on a different origin
      return
    }

    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`

      if (isLocalhost) {
        // Running on localhost - check if service worker still exists
        checkValidServiceWorker(swUrl, config)

        navigator.serviceWorker.ready.then(() => {
          console.log(
            "EV Charging Station Manager is being served cache-first by a service worker. " +
              "For more information about PWAs, visit https://web.dev/progressive-web-apps/",
          )
        })
      } else {
        // Not localhost - register service worker
        registerValidSW(swUrl, config)
      }
    })
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Create a custom event for the app to listen to
      window.dispatchEvent(new CustomEvent("serviceWorkerRegistered", { detail: registration }))

      registration.onupdatefound = () => {
        const installingWorker = registration.installing
        if (installingWorker == null) {
          return
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // New content is available - notify the user
              console.log("New content is available and will be used when all tabs for this page are closed.")

              // Show update notification to the user
              showUpdateNotification()

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration)
              }
            } else {
              // Content is cached for offline use
              console.log("Content is cached for offline use.")

              // Show offline capability notification
              showOfflineCapabilityNotification()

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration)
              }
            }
          }
        }
      }
    })
    .catch((error) => {
      console.error("Error during service worker registration:", error)
    })
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found
  fetch(swUrl, {
    headers: { "Service-Worker": "script" },
  })
    .then((response) => {
      const contentType = response.headers.get("content-type")

      if (response.status === 404 || (contentType != null && contentType.indexOf("javascript") === -1)) {
        // No service worker found - reload the page
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload()
          })
        })
      } else {
        // Service worker found - proceed as normal
        registerValidSW(swUrl, config)
      }
    })
    .catch(() => {
      console.log("No internet connection found. App is running in offline mode.")

      // Show offline mode notification
      showOfflineModeNotification()
    })
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
      })
      .catch((error) => {
        console.error(error.message)
      })
  }
}

// Helper functions for notifications
function showUpdateNotification() {
  if ("Notification" in window && Notification.permission === "granted") {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification("EV Charging Station Manager", {
        body: "New version available! Close all tabs to update.",
        icon: "/logo192.png",
        badge: "/badge-icon.png",
        tag: "update-notification",
      })
    })
  } else {
    // Create an in-app notification if push notifications aren't available
    createInAppNotification("Update Available", "A new version is available. Please refresh to update.")
  }
}

function showOfflineCapabilityNotification() {
  createInAppNotification("Offline Ready", "App is now available offline!")
}

function showOfflineModeNotification() {
  createInAppNotification("Offline Mode", "You are currently offline. Some features may be limited.")
}

function createInAppNotification(title, message) {
  // This function will be implemented in the App component
  // We'll dispatch a custom event that the App component will listen for
  window.dispatchEvent(
    new CustomEvent("inAppNotification", {
      detail: { title, message, timestamp: new Date().getTime() },
    }),
  )
}
