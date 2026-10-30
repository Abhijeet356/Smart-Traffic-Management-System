# Smart Traffic Management System — API Specification

Base URL: `http://localhost:5000/api`

All protected routes require an HTTP Authorization header formatted as:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Module (`/api/auth`)

### `POST /api/auth/register`
* **Access:** Public
* **Description:** Register a new user (defaults to `citizen`).
* **Request Body:**
```json
{
  "name": "Ananya Verma",
  "email": "ananya.citizen@gmail.com",
  "password": "Password123!",
  "contactNumber": "+91 99887 76655"
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Ananya Verma",
    "email": "ananya.citizen@gmail.com",
    "role": "citizen"
  }
}
```

### `POST /api/auth/login`
* **Access:** Public
* **Description:** Authenticate user and return signed JWT.
* **Request Body:**
```json
{
  "email": "officer.sharma@traffic.gov",
  "password": "Password123!"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Inspector Rajesh Sharma",
    "email": "officer.sharma@traffic.gov",
    "role": "police",
    "badgeNumber": "TP-DELHI-809"
  }
}
```

### `GET /api/auth/me`
* **Access:** Authenticated (Any role)
* **Response (200 OK):** Returns logged-in user profile.

---

## 2. Locations & Intersections (`/api/locations`)

### `GET /api/locations`
* **Access:** Public
* **Query Params:** `?status=active&roadType=intersection`
* **Response (200 OK):** Returns array of monitored intersections with GPS coordinates and capacities.

### `POST /api/locations`
* **Access:** Private (`admin` only)
* **Request Body:**
```json
{
  "name": "Lajpat Nagar Ring Road Crossing",
  "code": "INT-106",
  "coordinates": {
    "latitude": 28.5677,
    "longitude": 77.2433
  },
  "roadCapacity": 850,
  "speedLimit": 50,
  "roadType": "intersection",
  "description": "High commercial crossing near metro line"
}
```

### `PUT /api/locations/:id`
* **Access:** Private (`admin` only)

### `DELETE /api/locations/:id`
* **Access:** Private (`admin` only)

---

## 3. Traffic Telemetry & Ingestion (`/api/traffic`)

### `GET /api/traffic/live`
* **Access:** Public
* **Description:** Real-time telemetry feed across all active intersections including vehicle count, velocity, density %, congestion category, and signal state.

### `GET /api/traffic/history/:locationId`
* **Access:** Public
* **Query Params:** `?limit=50`
* **Description:** Chronological time-series readings for charting.

### `POST /api/traffic/telemetry`
* **Access:** Private (`police`, `admin`)
* **Request Body:**
```json
{
  "locationId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "vehicleCount": 720,
  "averageSpeed": 16,
  "source": "sensor_sim"
}
```

### `POST /api/traffic/simulate-tick`
* **Access:** Private (`police`, `admin`)
* **Description:** Manually triggers a complete simulation pulse updating all intersections and running adaptive signal optimization.

---

## 4. Signal Management & Adaptive Timing (`/api/signals`)

### `GET /api/signals`
* **Access:** Public
* **Description:** Returns all signal controllers with directional arms (North, South, East, West) and phase timers.

### `POST /api/signals/:id/optimize`
* **Access:** Private (`police`, `admin`)
* **Description:** Triggers dynamic Webster-proportional optimization algorithm.
* **Request Body:**
```json
{
  "directionalDensities": {
    "North": 85,
    "South": 30,
    "East": 15,
    "West": 15
  }
}
```

### `PUT /api/signals/:id/override`
* **Access:** Private (`police`, `admin`)
* **Description:** Manual signal preemption for emergency corridors (ambulances, convoys).
* **Request Body:**
```json
{
  "greenDirection": "North",
  "greenDuration": 60,
  "mode": "manual"
}
```

---

## 5. Incidents & Road Hazards (`/api/incidents`)

### `GET /api/incidents`
* **Access:** Public
* **Query Params:** `?status=reported&severity=critical`

### `POST /api/incidents`
* **Access:** Authenticated (`citizen`, `police`, `admin`)
* **Request Body:**
```json
{
  "locationId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "type": "accident",
  "severity": "high",
  "description": "Truck collision blocking 2 eastbound lanes"
}
```

### `PUT /api/incidents/:id/status`
* **Access:** Private (`police`, `admin`)
* **Request Body:**
```json
{
  "status": "resolved",
  "resolutionNotes": "Wrecker cleared obstruction, lane reopened"
}
```

---

## 6. Alerts & Notifications (`/api/alerts`)

### `GET /api/alerts`
* **Access:** Public
* **Query Params:** `?status=new`

### `PUT /api/alerts/:id/ack`
* **Access:** Private (`police`, `admin`)

### `PUT /api/alerts/:id/resolve`
* **Access:** Private (`police`, `admin`)

### `GET /api/alerts/notifications`
* **Access:** Authenticated (User-specific notification inbox)

---

## 7. Reports & Analytics (`/api/reports`)

### `GET /api/reports/dashboard-stats`
* **Access:** Public
* **Description:** High-level summary metrics (active signals, total vehicles in last 24h, congestion counts).

### `GET /api/reports/analytics`
* **Access:** Public
* **Query Params:** `?days=7`
* **Description:** Hourly breakdown of density vs velocity, rush hour volume, and incident distributions for charts.

---

## 8. User Administration (`/api/users`)

### `GET /api/users`
* **Access:** Private (`admin` only)
* **Query Params:** `?role=police&search=sharma`

### `PUT /api/users/:id/role`
* **Access:** Private (`admin` only)
* **Request Body:** `{ "role": "police" }`

### `PUT /api/users/:id/status`
* **Access:** Private (`admin` only)
* **Description:** Toggles active/deactivated state.

---

## 9. System Settings (`/api/settings`)

### `GET /api/settings`
* **Access:** Authenticated

### `PUT /api/settings`
* **Access:** Private (`admin` only)
* **Request Body:**
```json
{
  "lowDensityMax": 30,
  "mediumDensityMax": 60,
  "highDensityMax": 80,
  "autoOptimization": true,
  "autoSimulation": true,
  "emergencyPreemption": true
}
```
