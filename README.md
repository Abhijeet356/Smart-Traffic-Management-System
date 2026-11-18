# 🚦 Smart Traffic Management System (STMS)

An intelligent, full-stack traffic monitoring, incident reporting, and adaptive signal control platform built with the **MERN Stack** (MongoDB, Express, React, Node.js) and Leaflet OpenStreetMap.

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TailwindCSS-06b6d4)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-22c55e)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Community-emerald)](https://www.mongodb.com/)
[![Map](https://img.shields.io/badge/Map-Leaflet%20OpenStreetMap-blue)](https://leafletjs.com/)
[![Tests](https://img.shields.io/badge/Tests-30%20Passing-success)](https://jestjs.io/)

---

## 📌 Project Overview

- 🗺️ **Interactive Geographic Traffic Map:** Real-time road status visualizer using OpenStreetMap with colored congestion overlays (Low, Medium, High, Severe).
- 🏙️ **Multi-Region & Multi-State Support:** Instant switching between cities (Patna, Delhi NCR, Mumbai, Bengaluru, etc.) with custom intersection registration.
- 🚦 **Adaptive Signal Control:** Dynamically balances traffic light green splits across North, South, East, and West lanes based on real-time vehicle density.
- 🚨 **Incident Reporting & Triage:** Crowdsourced incident submissions (accidents, congestion, waterlogging, hazards) with verification controls for police and admins.
- 🚑 **Emergency Green Corridor:** Manual override mode allowing traffic police to give priority green clearance to emergency vehicles (ambulances, fire engines).
- 👥 **Role-Based Access Control (RBAC):** Dedicated views and permissions for **Administrator**, **Traffic Police**, and **Citizens**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React-Leaflet, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js, REST APIs |
| **Database** | MongoDB (Community Server / Atlas / In-Memory Fallback), Mongoose |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password hashing |
| **Testing** | Jest, Supertest (30 automated tests) |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# In the backend directory:
cd backend
npm install

# In the frontend directory:
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Inside `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/smart_traffic_db
JWT_SECRET=smart_traffic_super_secret_jwt_key_2026
```

### 3. Seed Initial Demo Data
Populates initial monitored intersections (Patna & Delhi), traffic signals, and user accounts:
```bash
cd backend
npm run seed
```

### 4. Run the Project
```bash
# Start backend (runs on http://localhost:5000)
cd backend
npm run dev

# In another terminal, start frontend (runs on http://localhost:3000)
cd frontend
npm run dev
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@traffic.gov` | `Password123!` |
| **Traffic Police** | `officer.sharma@traffic.gov` | `Password123!` |
| **Citizen User** | `ananya.citizen@gmail.com` | `Password123!` |

*(You can also use the 1-Click Demo Login buttons directly on the login page).*

---

## 🧪 Automated Tests
Run the test suite:
```bash
cd backend
npm test
```
All **30 unit and integration tests** pass successfully covering health checks, authentication, density calculations, and signal optimization.

---

## 👥 Authors
- **Abhijeet** & Team
- B.Tech Computer Science & Engineering Capstone Project
- Repository: [Abhijeet356/Smart-Traffic-Management-System](https://github.com/Abhijeet356/Smart-Traffic-Management-System)
