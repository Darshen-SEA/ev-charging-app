# EV Charging & Battery Check Station

This is a web application built with .NET 6.0 and React for managing EV charging stations and battery check services.

## Prerequisites

Before you begin, ensure you have the following installed:

- [.NET 6.0 SDK](https://dotnet.microsoft.com/download/dotnet/6.0) or later
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js) or [Yarn](https://yarnpkg.com/)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ev-charging-app
```

### 2. Restore Dependencies

#### Backend (.NET) Dependencies

```bash
dotnet restore
```

#### Frontend (React) Dependencies

```bash
cd ClientApp
npm install
cd ..
```

### 3. Build the Application

First, ensure you're in the project's root directory. If your path contains spaces, make sure to use quotes:

```bash
cd "C:\Coding\ev-charging-app"
dotnet build
```

### 4. Development Mode

To run the application in development mode with hot-reload, you'll need to run both the backend and frontend servers separately.

#### Start the Backend (.NET) Server

In the root directory, run:

```bash
cd "C:\Coding\ev-charging-app"
dotnet run
```

This will start the .NET backend server on:
- `https://localhost:5001` (HTTPS)
- `http://localhost:5000` (HTTP)

#### Start the Frontend (React) Development Server

In a new terminal, navigate to the ClientApp directory and start the React development server:

```bash
cd "C:\Coding\ev-charging-app\ClientApp"
npm start
```

The React development server will start on `http://localhost:3000` with hot-reload enabled. If the browser doesn't open automatically, you can manually navigate to this URL.

### 5. Production Build

To create a production build of the application:

#### 1. Build the Frontend

```bash
cd ClientApp
npm run build
cd ..
```

This will create an optimized production build of the React app in the `ClientApp/build` directory.

#### 2. Publish the .NET Application

```bash
dotnet publish -c Release -o ./publish
```

#### 3. Run the Production Build

```bash
cd publish
dotnet MyReactApp.dll
```

The application will be served from the `wwwroot` folder and available at `https://localhost:5001` (or `http://localhost:5000`).

## Project Structure

- `/ClientApp` - Contains the React frontend application
- `/Controllers` - Backend API controllers
- `/Pages` - Server-side Razor pages (if any)
- `appsettings.json` - Application configuration
- `Program.cs` - Application entry point and service configuration

## Development Workflow

- The React app runs on port 44400 in development mode
- The .NET backend runs on port 5001 (HTTPS) and 5000 (HTTP)
- API requests from the React app are automatically proxied to the backend

## Building for Production

To create a production build:

```bash
cd ClientApp
npm run build
cd ..
dotnet publish -c Release -o ./publish
```

The production build will be available in the `./publish` directory.

## Troubleshooting

- If you encounter certificate trust issues, run:
  ```bash
  dotnet dev-certs https --trust
  ```
  (Windows/macOS only, Linux requires manual certificate configuration)

- If you get port conflicts, check which process is using the port and terminate it, or update the ports in:
  - `launchSettings.json` (for backend)
  - `ClientApp/package.json` (for frontend port)

## License

[Specify your license here]
