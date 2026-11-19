# Software Requirements Specification (SRS)
## Smart Traffic Management System (STMS)

**Institution:** National Institute of Technology Patna (NIT Patna)  
**Department:** Department of Computer Science & Engineering  
**Project Authors:** Abhijeet & Ankita  
**Degree:** Bachelor of Technology (B.Tech) in CSE  
**Document Version:** 1.0.0 (Release Candidate)  
**Date:** November 2026  

---

## 1. Introduction & Project Scope

### 1.1 Purpose
This Software Requirements Specification (SRS) document details the complete functional and non-functional specifications for the **Smart Traffic Management System (STMS)**. It is prepared for academic evaluators, software engineering faculty, traffic control room personnel, and engineering teammates.

### 1.2 Problem Statement
Conventional urban traffic management in modern cities relies on pre-timed, fixed-cycle controllers. Under fixed timing, traffic lights assign identical green intervals to intersection approaches regardless of fluctuating vehicle queues. This causes massive cumulative commute delays, wasted fuel, severe queue spillbacks, and heightened emergency transit mortality when ambulances become trapped in cross-corridor gridlocks. STMS eliminates these bottlenecks by introducing real-time, density-driven signal allocation and integrated emergency corridor preemption.

### 1.3 Project Scope
The Smart Traffic Management System is a full-stack platform providing:
1. **Real-Time Geospatial Visualizer:** An OpenStreetMap-powered live monitoring grid tracking road congestion levels across multiple cities (Patna, Delhi NCR, Mumbai, Bengaluru, Kolkata).
2. **Adaptive Signal Optimization:** A Webster-inspired proportional split algorithm that dynamically adjusts 4-way green intervals based on instantaneous queue saturation.
3. **Emergency Green Corridor:** An authorized operational override allowing traffic controllers to clear lanes for emergency vehicles with a single click.
4. **Incident Reporting Workflow:** A crowdsourced portal enabling citizens to submit geo-tagged road hazards and accident reports for verification and resolution by traffic police.
5. **Role-Based Access Control (RBAC):** Segregated privilege tiers for Administrators, Traffic Police Officers, and General Citizens enforced via cryptographically signed JSON Web Tokens (JWT).

---

## 2. Overall System Description & Architecture

### 2.1 Architectural Pattern (3-Tier Client-Server Architecture)
- **Client Tier (Presentation):** Built with React 18 and Vite. Features a responsive Tailwind CSS dashboard, dynamic SVG signal light widgets, interactive Leaflet OpenStreetMap layers, and analytical charts powered by Recharts.
- **Application Tier (Business Logic):** Built on Node.js and Express.js RESTful architecture. Implements the mathematical traffic optimization engine, rule-based anomaly detection, JWT authentication middleware, and input sanitization.
- **Data Tier (Persistence):** Powered by MongoDB with Mongoose ODM. Organizes data into normalized collections with a built-in automated in-memory MongoDB fallback (`MongoMemoryServer`) for resilient offline demonstration.

### 2.2 Operating Environment
- **Server Hardware:** Minimum 2.0 GHz Dual-Core CPU, 4 GB RAM, 10 GB persistent storage.
- **Server Software:** Node.js v18.0.0 or higher, Windows 10/11 or Ubuntu Linux 22.04 LTS.
- **Database Engine:** MongoDB Community Server v7.0/v9.0 on port 27017, or embedded in-memory memory server.
- **Client Browsers:** Google Chrome 110+, Mozilla Firefox 110+, Microsoft Edge 110+, Apple Safari 16+.

---

## 3. User Classes & Actor Characteristics

| User Role | Privilege Level | Key Responsibilities & Permissions |
|---|---|---|
| **Administrator (👑)** | Global System Access | Register new monitored intersections, configure global min/max signal timing bounds, manage user accounts, view audit logs. |
| **Traffic Police Officer (👮)** | Operational Control | Activate Emergency Green Corridors, trigger dynamic Webster signal optimizations, verify/resolve crowdsourced incident tickets. |
| **Public Citizen (🚗)** | Public Read & Report | View live metropolitan traffic density map, track congestion levels, submit geo-located road incident reports. |

---

## 4. Functional Requirements (FR)

### FR-1: User Authentication & Role-Based Access Control (RBAC)
- **FR-1.1:** The system SHALL allow users to register with name, email, password, and designated role (Citizen, Officer, Admin).
- **FR-1.2:** The system SHALL hash all user passwords using bcryptjs with a minimum of 10 salt rounds before database persistence.
- **FR-1.3:** Upon valid credential submission, the server SHALL issue a cryptographically signed JSON Web Token (JWT) expiring in 24 hours.
- **FR-1.4:** Express route middleware SHALL intercept incoming requests, verify JWT signatures, and reject unauthorized role access with HTTP 403 Forbidden.

### FR-2: Geospatial Mapping & Multi-City Grid Visualizer
- **FR-2.1:** The map SHALL display monitored intersections with color-coded density circle markers: Green (0-39% Low), Yellow (40-69% Medium), Orange (70-84% High), and Red (85-100% Severe).
- **FR-2.2:** The map SHALL provide a Multi-City Region Selector supporting Patna (Bihar), Delhi NCR, Mumbai, Bengaluru, and Kolkata.
- **FR-2.3:** Selecting a city SHALL execute a smooth animated camera transition (`map.flyTo`) to the chosen city coordinates.
- **FR-2.4:** Clicking an intersection marker SHALL display a popup tooltip with current vehicle saturation, road capacity, and active signal mode.

### FR-3: IoT Telemetry Ingestion & Sensor Emulation Engine
- **FR-3.1:** The backend SHALL provide an endpoint (`POST /api/traffic/simulate-tick`) that updates vehicle counts across all active road segments.
- **FR-3.2:** The simulation model SHALL apply time-of-day rush-hour weighting (0.70 baseline during 8-10 AM and 5-8 PM; 0.40 baseline during off-peak hours) with a stochastic variance factor (±20%).
- **FR-3.3:** The frontend navbar SHALL feature a "Simulate Pulse" trigger allowing operators to simulate fresh traffic flow on demand.

### FR-4: Adaptive Signal Optimization (Webster Proportional Split Algorithm)
- **FR-4.1:** The system SHALL bound total intersection cycle time to a configurable duration (default: $C = 120$ seconds).
- **FR-4.2:** The algorithm SHALL deduct lost clearance time (4s yellow per arm, total 16s) to determine total available green time (104 seconds).
- **FR-4.3:** The system SHALL allocate green seconds proportionally to directional queue densities (North, South, East, West).
- **FR-4.4:** The algorithm SHALL enforce a strict Starvation Floor ($G_{\min} = 15\text{s}$) ensuring low-density arms and pedestrians are guaranteed minimum green clearance.
- **FR-4.5:** The algorithm SHALL enforce a Maximum Green Ceiling ($G_{\max} = 55\text{s}$) preventing perpetual green dominance.
- **FR-4.6:** The system SHALL log all generated timing plans into a persistent `SignalPlan` audit collection with timestamps and authorized user IDs.

### FR-5: Emergency Green Corridor & Manual Preemption Override
- **FR-5.1:** Traffic police officers SHALL have access to a "Manual Preemption" modal on each intersection controller.
- **FR-5.2:** The operator SHALL be able to select the target priority direction (North, South, East, or West) and green duration (30s to 120s).
- **FR-5.3:** Upon preemption activation, the system SHALL lock the target corridor to Continuous Green and force all conflicting cross-traffic arms to solid Red.
- **FR-5.4:** The system SHALL update the signal state badge from ADAPTIVE to MANUAL (Orange).
- **FR-5.5:** Upon corridor completion or when "Optimize Splits" is clicked, the system SHALL smoothly restore the signal to automated ADAPTIVE control without phase conflict.

### FR-6: Crowdsourced Incident & Hazard Reporting
- **FR-6.1:** Citizens SHALL be able to submit incident tickets specifying title, category (Accident, Congestion, Waterlogging, Hazard), severity, and map coordinates.
- **FR-6.2:** New tickets SHALL enter the system with status "reported".
- **FR-6.3:** Traffic police officers and administrators SHALL have privileges to review, verify ("verified"), and resolve ("resolved") active incident tickets.

### FR-7: Anomaly Detection & Priority Alert Dispatching
- **FR-7.1:** When road density exceeds 85% with vehicle velocity dropping below 10 km/h, the rule engine SHALL generate a high-priority "Severe Congestion Alert".
- **FR-7.2:** Active alerts SHALL appear in real time in the Command Center Priority Alerts Ticker and trigger navbar notification bell badges.

### FR-8: Traffic Analytics & Aggregated Metrics
- **FR-8.1:** The system SHALL calculate the City Saturation Index representing total vehicles on monitored roads divided by total road capacity.
- **FR-8.2:** The system SHALL compute 24-hour cumulative vehicle detections and average network velocity.
- **FR-8.3:** The system SHALL provide graphical hourly trend analysis (density vs speed) rendered via Recharts.

---

## 5. Non-Functional Requirements (NFR)

| ID | Category | Specification |
|---|---|---|
| **NFR-1** | **Performance** | API response time $< 200\text{ms}$; Signal optimization calculation $< 50\text{ms}$. |
| **NFR-2** | **Safety & Fail-Safe** | Mutual exclusion: Conflicting perpendicular arms (e.g. North and East) SHALL NEVER display green simultaneously. Mandatory 4s yellow change interval. |
| **NFR-3** | **Security** | Bcryptjs password encryption with 10 salt rounds; stateless JWT tokens with 24h expiration; server-side RBAC guards returning `403 Forbidden`. |
| **NFR-4** | **Portability** | Zero-configuration evaluation via automatic in-memory MongoDB fallback (`MongoMemoryServer`) when offline. |
| **NFR-5** | **Reliability & Testing** | 100% passing automated test suite with **30 unit and integration tests** using Jest and Supertest. |

---

## 6. Mathematical Formulation of the Traffic Engine

### 6.1 Road Density Formula
$$\text{Traffic Density (\%)} = \left( \frac{\text{Current Vehicle Count}}{\text{Road Saturation Capacity}} \right) \times 100$$

### 6.2 Webster Proportional Green Split Allocation
Given total cycle time $C = 120\text{s}$, 4 approach arms, and yellow change interval $Y = 4\text{s}$ per arm:
$$G_{\text{available}} = C - \sum_{i=1}^{4} Y_i = 120 - 16 = 104\text{ seconds}$$

The raw green time allocated to arm $i$ with instantaneous density $D_i$ is:
$$G_{\text{raw}, i} = \left( \frac{D_i}{\sum_{k=1}^{4} D_k} \right) \times G_{\text{available}}$$

Subject to boundary clamping for starvation prevention and maximum queue caps:
$$G_i = \max(G_{\min}, \min(G_{\max}, \text{round}(G_{\text{raw}, i})))$$
Where $G_{\min} = 15\text{s}$ and $G_{\max} = 55\text{s}$.

---

## 7. Verification & Automated Test Suite

| Test File | Test Scope | Result |
|---|---|---|
| `health.test.js` | API health check, system uptime telemetry, 404 handler | PASS (100%) |
| `auth.test.js` | User registration, password encryption, JWT authorization | PASS (100%) |
| `admin.test.js` | RBAC enforcement, unauthorized access blocked (403) | PASS (100%) |
| `trafficEngine.test.js` | Density math, anomaly detection, Webster split clamping | PASS (100%) |
| `integration.test.js` | Complete incident lifecycle (Citizen -> Police -> Resolved) | PASS (100%) |

**Summary: 5 test suites passed, 30 of 30 tests passed in 3.4 seconds.**
