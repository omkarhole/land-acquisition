# SIH26017: Land Acquisition Delay Early Warning System
## Complete System Setup & Installation Guide

This document provides step-by-step instructions for running the **Predictive Analytics System for Early Detection of Land Acquisition Delays** (Smart India Hackathon 2026 - Problem Statement: SIH26017 / PS ID: 25017, Ministry of Rural Development).

---

## 🛠️ System Prerequisites

| Component | Minimum Version | Recommended |
| :--- | :--- | :--- |
| **Python** | 3.10+ | 3.11 / 3.12 / 3.14 |
| **Node.js** | 18.x+ | 20.x LTS |
| **Database** | SQLite 3 (included) | PostgreSQL 15/16 + PostGIS |
| **Docker** *(Optional)* | 20.10+ | Docker Desktop with Docker Compose v2 |

---

## 🚀 Quick Start (Choose Your Preferred Setup)

### Option 1: Local Development Run (Zero-Config SQLite / Local PostgreSQL)

#### Step 1: Clone or Navigate to the Workspace Directory
```bash
cd sih26017-land-acquisition
```

#### Step 2: Set Up Python Virtual Environment & Dependencies
```bash
# Create and activate virtual environment
python -m venv venv

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install backend & ML dependencies
pip install -r backend/requirements.txt
```

#### Step 3: Database & Demo Data Initialization
The system automatically creates and seeds the database on first run. If you want to explicitly re-seed:
```bash
# Generate synthetic LARR 2013 dataset & train ML models
python ml/data/generate_dataset.py
python ml/src/train.py

# Seed database with 10 flagship Indian infrastructure projects & 5 demo accounts
python -m backend.app.seed
```

#### Step 4: Start the FastAPI Backend Server
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **Backend Health Check**: `http://localhost:8000`
- **Interactive Swagger API Docs**: `http://localhost:8000/docs`

#### Step 5: Start the React Frontend UI
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
- **Web Application UI**: `http://localhost:5173`

---

### Option 2: Full Docker Compose Production Deployment (PostgreSQL 16 + FastAPI + Nginx)

Run the entire multi-tier stack (PostgreSQL database, Python ML FastAPI backend, and Nginx-served React frontend) with a single command:

```bash
cd sih26017-land-acquisition

# Build and start all containers
docker-compose up --build -d
```

- **Web Frontend**: `http://localhost:5173`
- **FastAPI Backend**: `http://localhost:8000`
- **PostgreSQL Database**: `localhost:5432` (User: `app`, DB: `sih26017`, Password: `postgres_password_2026`)

To stop the containers:
```bash
docker-compose down
```

---

## 🗄️ PostgreSQL Database Setup (Standalone)

If you are running your own local PostgreSQL instance (e.g., PostgreSQL installed on port 5432):

### 1. Create the Database
```sql
CREATE DATABASE sih26017;
CREATE USER app WITH ENCRYPTED PASSWORD 'postgres_password_2026';
GRANT ALL PRIVILEGES ON DATABASE sih26017 TO app;
```

### 2. Run the DDL Schema Script
Execute the provided PostgreSQL production schema script:
```bash
psql -U app -d sih26017 -f backend/app/schema_postgres.sql
```

### 3. Configure the `.env` file
Create a `.env` file in the project root:
```ini
DATABASE_URL=postgresql://app:postgres_password_2026@localhost:5432/sih26017
JWT_SECRET=sih26017_ministry_rural_dev_secret_key_2026_x7a9q2
```

### 4. Run the Seed Script
```bash
python -m backend.app.seed
```

---

## 🔑 Pre-Configured Demo Accounts (1-Click Fast Login)

The login page contains a **1-Click Demo Persona Switcher** for instant hackathon evaluation:

| Role | Email | Password | Persona & Authority |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@sih.gov.in` | `password123` | Master configuration, user management, and security audit trails |
| **Project Officer (LAO)** | `officer@sih.gov.in` | `password123` | Creates projects, updates statutory LARR stages, approves documents, logs interventions |
| **District Collector (DM)** | `district@sih.gov.in` | `password123` | Regional monitoring, district bottleneck resolution, high-risk triage |
| **Ministry Joint Secretary** | `director@sih.gov.in` | `password123` | National high-level decision support, cabinet briefings, executive PDF reports |
| **Policy / ML Analyst** | `analyst@sih.gov.in` | `password123` | ML model governance, feature importances, and continuous learning retraining |

---

## 🧪 Running Automated Tests

A comprehensive integration test suite is included to verify all API routes, ML models, R&R tracking, and recommendation workflows:

```bash
python backend/tests/run_tests.py
```

Expected Output:
```
============================================================
SIH26017: RUNNING EXPANDED BACKEND & ML INTEGRATION TESTS
============================================================
 [PASS] 1. Root API Health Check
 [PASS] 2. JWT User Authentication & RBAC
 [PASS] 3. Dashboard Summary with National R&R KPI
 [PASS] 4. Real-time Prediction & AI Recommendations
 [PASS] 5. 1-Click Adopt Recommendation to Action Plan
 [PASS] 6. R&R Progress Tracking & Settlement
 [PASS] 7. Continuous Model Retraining Pipeline
------------------------------------------------------------
RESULTS: 7/7 tests passed (100.0%)
============================================================
```

---

## 📁 Key Directories & Architecture Map

```
sih26017-land-acquisition/
├── backend/
│   ├── app/
│   │   ├── models/models.py       # 14 SQLAlchemy ORM entities (Project, Stage, Document, Compensation, R&R, Possession, Stakeholders, Recommendations, Alerts, Actions, AuditLog)
│   │   ├── schemas/schemas.py     # Pydantic validation and serialization models
│   │   ├── routes/                # REST API routers (auth, projects, dashboard, alerts, actions, reports)
│   │   ├── services/
│   │   │   ├── auth_service.py    # Direct bcrypt password hashing & PyJWT token handling
│   │   │   └── ml_service.py      # Dual ML inference, XAI attribution, and AI Recommendations generator
│   │   ├── schema_postgres.sql    # PostgreSQL + PostGIS DDL schema
│   │   ├── seed.py                # Database population with 10 flagship projects
│   │   ├── database.py            # Engine and connection pool configuration
│   │   └── main.py                # FastAPI entry point & CORS configuration
│   ├── tests/run_tests.py         # Automated integration test suite
│   ├── Dockerfile
│   └── requirements.txt
├── ml/
│   ├── data/generate_dataset.py   # LARR 2013 synthetic dataset synthesizer (3,000 cases)
│   ├── src/train.py               # Multi-model benchmarking, probability calibration, and days regressor
│   └── artifacts/
│       ├── delay_model_v1.joblib  # Trained calibrated classifier
│       ├── delay_days_regressor.joblib # Trained Gradient Boosting days regressor
│       ├── model_metrics.json     # Holdout benchmark metrics & top features
│       └── feature_schema.json    # 34 feature definitions
├── frontend/
│   ├── src/
│   │   ├── components/            # UI components (Navbar, Sidebar, RiskBadge, ExplainabilityCard, WhatIfSimulator, RecommendationsCard, CreateProjectModal)
│   │   ├── pages/                 # Full screens (Dashboard, RiskMap, Projects, ProjectDetail, Alerts, Interventions, ModelGovernance, Reports, Login)
│   │   ├── services/api.js        # Complete REST API client
│   │   ├── context/AuthContext.jsx # JWT auth state and fast role switcher
│   │   └── App.jsx                # Application root with client-side routing
│   ├── Dockerfile & nginx.conf
│   └── package.json & vite.config.js
├── docker-compose.yml
├── SETUP.md                       # This setup document
├── NEW_FEATURES_CHANGELOG.md      # Detailed changelog of all additions
└── README.md
```
