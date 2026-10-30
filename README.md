# Smart Traffic Management System (STMS)

An intelligent, real-time traffic monitoring and adaptive signal control system built as a B.Tech Computer Science and Engineering coursework project.

![Project Status](https://img.shields.io/badge/status-Phase%201%20Configured-emerald)
![Architecture](https://img.shields.io/badge/architecture-MERN%20Decoupled-blue)
![Database](https://img.shields.io/badge/database-MongoDB%20%2B%20Mongoose-green)

---

## 🚦 Project Overview
Urban traffic congestion leads to billions of hours wasted in commute delays, elevated carbon emissions, and hindered emergency vehicle transit. The **Smart Traffic Management System** addresses these issues through:
1. **IoT Sensor & Telemetry Emulation:** Ingests live vehicle counts, velocities, and road conditions across multiple intersections.
2. **Automated Density Analysis:** Real-time computation of saturation indices using the formula:
   $$\text{Traffic Density (\%)} = \left(\frac{\text{Vehicles Count}}{\text{Road Capacity}}\right) \times 100$$
   Categorized into **Low (0-30%)**, **Medium (31-60%)**, **High (61-80%)**, and **Severe (81-100%)**.
3. **Adaptive Signal Optimization:** Real-time dynamic green light allocation prioritizing heavily congested directional arms over empty roads.
4. **Automated Incident & Anomaly Detection:** Rule-based detection of road accidents, stationary bottlenecks, and citizen-reported issues.
5. **Role-Based Portals:** Specialized interfaces for **Admin**, **Traffic Police Operators**, and **General Citizens**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Leaflet / React-Leaflet, Lucide Icons |
| **Backend** | Node.js, Express.js, JWT, BCrypt.js, Express-Validator, Helmet, CORS, Morgan |
| **Database** | MongoDB Atlas / MongoDB with Mongoose ODM (includes automated In-Memory fallback for zero-install evaluation) |
| **Testing** | Jest, Supertest |

---

## 📂 Project Structure

```
Smart Traffic Management System/
├── backend/
│   ├── config/             # Database connection & constants
│   ├── controllers/        # Request handling logic
│   ├── middleware/         # JWT Auth, RBAC guards, validations
│   ├── models/             # Mongoose schemas (10 normalized entities)
│   ├── routes/             # RESTful API endpoints
│   ├── services/           # Adaptive algorithms, analyzer & simulator
│   ├── tests/              # Jest and Supertest suites
│   ├── .env.example        # Environment variable template
│   └── server.js           # Server entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components (map, signals, charts)
│   │   ├── context/        # Auth & theme state
│   │   ├── pages/          # Admin, Police, and Citizen views
│   │   ├── services/       # Axios API client
│   │   └── App.jsx         # App shell & routing
│   ├── vite.config.js      # Vite build & backend proxy config
│   └── tailwind.config.js  # Styling & custom traffic colors
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: (Optional) MongoDB Atlas URI or local MongoDB. If neither is present, the system automatically runs an in-memory database!

### 1. Backend Setup
```bash
cd backend
npm install
# Ensure .env is present (defaults to port 5000)
npm run dev
```
Backend API will be live at `http://localhost:5000` with healthcheck at `http://localhost:5000/api/health`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:3000`.

---

## 📑 Academic Development Roadmap
- [x] **Phase 1: Project Setup & Scaffolding** (Express, Vite React, Tailwind, health telemetry)
- [ ] **Phase 2: Database Schemas & JWT Role-Based Authentication**
- [ ] **Phase 3: Admin Module & Location Management**
- [ ] **Phase 4: Traffic Telemetry & Simulated Sensor Generator**
- [ ] **Phase 5: Adaptive Signal Optimization Algorithm**
- [ ] **Phase 6: Incident Detection & Emergency Alert Dispatch**
- [ ] **Phase 7: Interactive Dashboards & OpenStreetMap Visualizer**
- [ ] **Phase 8: Analytics, Traffic Reports & Testing Suite**
- [ ] **Phase 9: Final Polish & Comprehensive Documentation**
