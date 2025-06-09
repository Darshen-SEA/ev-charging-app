import { lazy, Suspense } from "react"

// Lazy load components for better performance
const Home = lazy(() => import("./components/Home"))
const BatteryCheck = lazy(() => import("./components/BatteryCheck"))
const StationManagement = lazy(() => import("./components/StationManagement"))
const RouteOptimizer = lazy(() => import("./components/RouteOptimizer"))
const Settings = lazy(() => import("./components/Settings"))

// Loading fallback component
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner-large"></div>
    <p className="loading-text">Loading...</p>
  </div>
)

// Create placeholder components for routes that don't exist yet
const BatteryCheckPlaceholder = () => (
  <div className="container py-8">
    <h1 className="text-2xl font-bold mb-4">Battery Check</h1>
    <p className="text-gray-600">This feature is coming soon. Stay tuned for updates!</p>
  </div>
)

const StationManagementPlaceholder = () => (
  <div className="container py-8">
    <h1 className="text-2xl font-bold mb-4">Station Management</h1>
    <p className="text-gray-600">This feature is coming soon. Stay tuned for updates!</p>
  </div>
)

const RouteOptimizerPlaceholder = () => (
  <div className="container py-8">
    <h1 className="text-2xl font-bold mb-4">Route Optimizer</h1>
    <p className="text-gray-600">This feature is coming soon. Stay tuned for updates!</p>
  </div>
)

const SettingsPlaceholder = () => (
  <div className="container py-8">
    <h1 className="text-2xl font-bold mb-4">Settings</h1>
    <p className="text-gray-600">This feature is coming soon. Stay tuned for updates!</p>
  </div>
)

const AppRoutes = [
  {
    index: true,
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: "/battery-check",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <BatteryCheckPlaceholder />
      </Suspense>
    ),
  },
  {
    path: "/station-management",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <StationManagementPlaceholder />
      </Suspense>
    ),
  },
  {
    path: "/route-optimizer",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <RouteOptimizerPlaceholder />
      </Suspense>
    ),
  },
  {
    path: "/settings",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SettingsPlaceholder />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <div className="container py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
        <a href="/" className="btn btn-primary">
          Return to Home
        </a>
      </div>
    ),
  },
]

export default AppRoutes
