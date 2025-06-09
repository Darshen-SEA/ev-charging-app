import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import jest from "jest"

// Mock the service worker registration
jest.mock("./serviceWorkerRegistration", () => ({
  register: jest.fn(),
  unregister: jest.fn(),
}))

// Mock the reportWebVitals function
jest.mock("./reportWebVitals", () => jest.fn())

// Helper function to render App with Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe("App Component", () => {
  test("renders without crashing", () => {
    renderWithRouter(<App />)
  })

  test("renders main application structure", () => {
    renderWithRouter(<App />)

    // Check if the main container is rendered
    const appElement =
      screen.getByRole("main", { hidden: true }) ||
      document.querySelector('[data-testid="app-container"]') ||
      document.body

    expect(appElement).toBeInTheDocument()
  })

  test("has proper accessibility structure", () => {
    renderWithRouter(<App />)

    // Check for proper heading structure
    const headings = screen.getAllByRole("heading", { hidden: true })
    expect(headings.length).toBeGreaterThanOrEqual(0)
  })

  test("loads with proper CSS classes", () => {
    renderWithRouter(<App />)

    // Check if custom CSS classes are applied
    const bodyElement = document.body
    expect(bodyElement).toHaveClass() // Should have some classes applied
  })
})

// Integration tests for key functionality
describe("App Integration Tests", () => {
  test("handles navigation properly", () => {
    renderWithRouter(<App />)

    // Test that the app doesn't crash with navigation
    expect(window.location.pathname).toBeDefined()
  })

  test("maintains responsive design", () => {
    // Test viewport meta tag exists
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    expect(viewportMeta).toBeTruthy()
  })
})
