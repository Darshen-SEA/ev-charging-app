import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import * as serviceWorkerRegistration from "./serviceWorkerRegistration"
import reportWebVitals from "./reportWebVitals"
import "./index.css"

const baseUrl = document.getElementsByTagName("base")[0].getAttribute("href")
const rootElement = document.getElementById("root")
const root = createRoot(rootElement)

root.render(
  <React.StrictMode>
    <BrowserRouter basename={baseUrl}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// Register service worker for offline functionality
serviceWorkerRegistration.register()

// Performance monitoring
reportWebVitals()
