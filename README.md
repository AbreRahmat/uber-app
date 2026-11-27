# Uber Clone

A full-stack ride-hailing application for riders and captains. It provides user and captain authentication, address search, fare estimates, ride creation and acceptance, live location updates, ride status tracking, and real-time Socket.IO events.

## Features

- Separate rider and captain registration and login
- JWT-based authentication with protected routes
- Ride creation, fare estimation, confirmation, start, and completion
- Six-digit ride OTP verification
- Captain matching within a configurable geographic radius
- Address autocomplete, geocoding, and route/distance calculations
- Real-time communication with Socket.IO
- Live captain location updates
- Responsive React interface with map displays

## Tech Stack

### Frontend

- React 18
- Vite
- React Router
- Tailwind CSS
- Leaflet and React Leaflet
- Axios
- Socket.IO Client
- GSAP

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT
- bcrypt
- Socket.IO
- express-validator
- Nominatim/OpenStreetMap and OSRM for map and routing data

## Project Structure

```text
uber-app/
|-- Backend/
|   |-- controllers/       # HTTP request handlers
|   |-- db/                # MongoDB connection
|   |-- middlewares/       # Authentication middleware
|   |-- models/            # Mongoose models
|   |-- routes/            # Express route definitions
|   |-- services/          # Ride, map, and domain logic
|   |-- app.js             # Express application setup
|   |-- server.js          # HTTP server and Socket.IO startup
|   `-- socket.js          # Real-time Socket.IO handlers
`-- frontend/
    |-- src/
    |   |-- components/    # Reusable ride, map, and UI components
    |   |-- context/       # Auth and Socket.IO contexts
    |   `-- pages/         # Rider and captain pages
    `-- vite.config.js
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB Atlas or a local MongoDB instance
- Internet access for Nominatim and OSRM map services

## Environment Variables

### Backend

Create `Backend/.env`:

```env
PORT=3000
DB_CONNECT=mongodb://127.0.0.1:27017/uber-clone
JWT_SECRET=replace-with-a-long-random-secret
COUNTRY_CODES=in
```

- `PORT`: Backend server port. Defaults to `3000`.
- `DB_CONNECT`: MongoDB connection string.
- `JWT_SECRET`: Secret used to sign and verify JWT tokens.
- `COUNTRY_CODES`: Comma-separated country codes used to restrict map search results. Defaults to `in`.

### Frontend

Create `frontend/.env`:

```env
VITE_BASE_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

`VITE_API_URL` and `VITE_BASE_URL` should contain the backend URL, including the protocol but not a trailing `/`.

Do not commit `.env` files or secrets. This project already ignores environment files at the repository root.

## Installation

Install dependencies separately for the frontend and backend:

```powershell
cd Backend
npm install

cd ..\frontend
npm install
```

## Running the Application

Start MongoDB, then run the backend:

```powershell
cd Backend
npm start
```

The API and Socket.IO server start at `http://localhost:3000` by default.

In a second terminal, start the frontend:

```powershell
cd frontend
npm run dev
```

Open the Vite URL printed in the terminal, usually `http://localhost:5173`.

## Available Scripts

### Backend

| Command | Description |
| --- | --- |
| `npm start` | Starts the Express and Socket.IO server |

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Creates a production build |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint |

## API Overview

All routes are defined under the following prefixes:

| Prefix | Purpose |
| --- | --- |
| `/users` | Rider registration, login, profile, and logout |
| `/captains` | Captain registration, login, profile, and logout |
| `/maps` | Coordinates, distance/time, and address suggestions |
| `/rides` | Fare estimates and ride lifecycle operations |

Example:

```http
GET http://localhost:3000/maps/get-suggestions?input=central
Authorization: Bearer <jwt-token>
```

Protected endpoints require a JWT in the `Authorization: Bearer <token>` header. See [Backend/README.md](Backend/README.md) for additional endpoint documentation.

## Real-Time Events

The backend uses Socket.IO for rider/captain presence and ride updates. The client:

- Registers a rider or captain with the `join` event
- Sends captain coordinates with `update-location-captain`
- Receives ride and ride-status events from the server

## Map Services

The project uses free public map providers:

- Nominatim/OpenStreetMap for geocoding and autocomplete
- OSRM for route and distance calculations

The public Nominatim service is intended for low-volume use. For production, use a hosted provider or a self-hosted Nominatim instance.

## Production Build

Build the frontend:

```powershell
cd frontend
npm run build
npm run preview
```

The generated static files are written to `frontend/dist`. Deploy the frontend and backend to separate hosts or configure a production server to serve the frontend and proxy API requests to the backend.
