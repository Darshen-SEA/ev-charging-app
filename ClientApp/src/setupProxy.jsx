const { createProxyMiddleware } = require("http-proxy-middleware")

const context = ["/api", "/weatherforecast", "/charging-stations", "/battery-check", "/route-planning"]

const onError = (err, req, resp, target) => {
  console.error(`${err.message}`)
}

module.exports = (app) => {
  const appProxy = createProxyMiddleware(context, {
    target: process.env.ASPNETCORE_HTTPS_PORT
      ? `https://localhost:${process.env.ASPNETCORE_HTTPS_PORT}`
      : process.env.ASPNETCORE_URLS
        ? process.env.ASPNETCORE_URLS.split(";")[0]
        : "https://localhost:7001",
    secure: false,
    headers: {
      Connection: "Keep-Alive",
    },
    onError: onError,
    logLevel: "debug",
    changeOrigin: true,
    // Add timeout for better error handling
    timeout: 30000,
    // Handle WebSocket connections if needed
    ws: true,
    // Custom error handling for better UX
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying ${req.method} ${req.url} to target`)
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`Received ${proxyRes.statusCode} from target for ${req.url}`)
    },
  })

  app.use(appProxy)

  // Health check endpoint for monitoring
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    })
  })
}
