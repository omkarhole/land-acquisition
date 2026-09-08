# SIH26017: Real-Time Setup & Execution Guide
## Step-by-Step Setup for Database, Authentication, Backend, and Frontend

This guide walks you through setting up the entire **Land Acquisition Delay Early Warning Decision Support System** in real-time on your local machine.

---

## 📋 System Prerequisites

Make sure the following tools are installed:
- **Python**: Version 3.10, 3.11, 3.12, or 3.14 ([Download Python](https://www.python.org/downloads/))
- **Node.js & npm**: Node.js 18+ or 20+ LTS ([Download Node.js](https://nodejs.org/))
- **Database**: 
  - **Option A (Zero-Config Default)**: SQLite 3 (Pre-installed with Python, no extra installation required)
  - **Option B (Production)**: PostgreSQL 15/16 ([Download PostgreSQL](https://www.postgresql.org/download/)) or Docker Desktop

---

## 🗂️ Project Directory Structure

Ensure you are in the project root directory:
```
C:\Users\omkar\.gemini\antigravity\scratch\sih26017-land-acquisition
```

---

## ⚙️ STEP 1: Environment & Dependency Setup

### 1.1 Open Terminal / PowerShell in the Project Root
```powershell
cd C:\Users\omkar\.gemini\antigravity\scratch\sih26017-land-acquisition
```

### 1.2 Create and Activate a Python Virtual Environment
```powershell
# Create virtual environment
python -m venv venv

# Activate on Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Activate on Linux / macOS:
# source venv/bin/activate
```

### 1.3 Install Backend & ML Dependencies
```powershell
pip install -r backend/requirements.txt
```

---

## 🗄️ STEP 2: Database Configuration & Seeding

Choose either **SQLite (Zero Setup)** or **PostgreSQL**:

### Option A: SQLite (Default — Zero Setup Needed)
No external database installation is required. The system will automatically create `sih26017_land_delay.db` in your project folder.

### Option B: PostgreSQL Setup (If using PostgreSQL)
1. Open `psql` or pgAdmin and run:
   ```sql
   CREATE DATABASE sih26017;
   CREATE USER app WITH ENCRYPTED PASSWORD 'postgres_password_2026';
   GRANT ALL PRIVILEGES ON DATABASE sih26017 TO app;
   ```
2. (Optional) Initialize the schema directly via SQL:
   ```powershell
   psql -U app -d sih26017 -f backend/app/schema_postgres.sql
   ```
3. Create a `.env` file in the project root:
   ```ini
   DATABASE_URL=postgresql://app:postgres_password_2026@localhost:5432/sih26017
   JWT_SECRET=sih26017_ministry_rural_dev_secret_key_2026_x7a9q2
   ```

### 2.1 Generate ML Dataset & Train Model Pipelines
Before seeding the database, ensure the ML model artifacts are trained and ready:
```powershell
# Synthesize 3,000 realistic infrastructure acquisition cases
python ml/data/generate_dataset.py

# Train calibrated XGBoost classifier and delay days regressor
python ml/src/train.py
```
*Output will verify: `delay_model_v1.joblib` and `delay_days_regressor.joblib` saved in `ml/artifacts/`.*

### 2.2 Seed the Database with Demo Accounts & 10 Flagship Projects
```powershell
python -m backend.app.seed
```
*This populates 5 official role accounts and 10 realistic Indian infrastructure projects across 8 states.*

---

## 🔐 STEP 3: Authentication & Security Verification

The authentication system uses:
- **Password Security**: Direct `bcrypt` hashing with salt rounds
- **Token Format**: Standard RFC 7519 JSON Web Tokens (PyJWT) signed with HMAC-SHA256
- **Role-Based Access Control (RBAC)**: Enforced on all protected endpoints

### Pre-configured Demo Accounts:
| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@sih.gov.in` | `password123` | Full access, user administration, security audit logs |
| **Project Officer (LAO)** | `officer@sih.gov.in` | `password123` | Create projects, update stages, approve documents, record actions |
| **District Collector (DM)** | `district@sih.gov.in` | `password123` | District monitoring, high-risk triage, bottleneck escalations |
| **Ministry Joint Secretary** | `director@sih.gov.in` | `password123` | National executive overview, cabinet reports, policy simulations |
| **Policy / ML Analyst** | `analyst@sih.gov.in` | `password123` | ML model card inspection, drift monitoring, continuous retraining |

---

## 🖥️ STEP 4: Start the FastAPI Backend Server

In your first terminal (with virtual environment activated):

```powershell
cd C:\Users\omkar\.gemini\antigravity\scratch\sih26017-land-acquisition
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Verify Backend is Running:
1. **Health Check**: Open [http://localhost:8000](http://localhost:8000) in your browser (should return `{"status": "online", "problem_statement": "SIH26017"}`).
2. **Interactive API Docs (Swagger UI)**: Open [http://localhost:8000/docs](http://localhost:8000/docs).
3. **Test Authentication Endpoint**:
   - In Swagger UI, expand `POST /api/auth/login`
   - Click **Try it out**
   - Provide credentials:
     ```json
     {
       "email": "officer@sih.gov.in",
       "password": "password123"
     }
     ```
   - Click **Execute** and verify the 200 response returning `access_token`.

---

## 🎨 STEP 5: Start the React Frontend UI

Open a **second terminal window**:

```powershell
cd C:\Users\omkar\.gemini\antigravity\scratch\sih26017-land-acquisition\frontend

# 1. Install frontend packages (only needed once)
npm install

# 2. Start the Vite development server
npm run dev
```

### Access the Web Application:
- Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 STEP 6: Real-Time End-to-End Workflow Verification

Follow this 2-minute live walkthrough to verify all components work seamlessly together:

```
[Login Screen] ──> [Executive Dashboard] ──> [GIS Risk Map] ──> [Project 360° Dossier]
                                                                        │
                                                    ┌───────────────────┴───────────────────┐
                                                    ▼                                       ▼
                                          [Live ML Prediction]                   [What-If Simulator]
                                                    │                                       │
                                                    ▼                                       ▼
                                       [AI Next-Best Recommendations]         [Adopt to Action Plan]
```

1. **Sign In**:
   - Navigate to `http://localhost:5173/login`.
   - Click any of the **1-Click Demo Persona** buttons (e.g. *Project Officer* or *Administrator*).
2. **Explore Executive Dashboard**:
   - Verify the 6 KPI cards (Total Projects, Critical Risk, High Risk, Avg Delay Days, National R&R Progress, Active Alerts).
   - Inspect the **LARR 2013 Statutory Stage Bottleneck Bar Chart** vs legislative benchmarks.
3. **Inspect Interactive GIS Land Risk Map**:
   - Click **Risk Map** in the sidebar.
   - Filter by Sector (High-Speed Rail, Expressways, Irrigation) and click on map markers across India to inspect localized delay probabilities.
4. **Open Project 360° Dossier**:
   - Click **Projects** in the sidebar and select `LA-2026-0101` (Pune-Nashik Rail Corridor).
   - Click **Run / Refresh AI Prediction** to trigger real-time ML feature extraction and probability scoring.
   - Review the **Explainable AI (XAI) Attribution Waterfall** showing top positive/negative delay drivers.
5. **Simulate Policy Levers in What-If Simulator**:
   - Adjust the **Compensation Disbursed %** slider from 38% to 95%.
   - Notice the simulated probability reduce in real-time from 82% to 41% ($\Delta -41\%$).
6. **Adopt an AI Predictive Recommendation**:
   - Review the **AI Predictive Recommendations Card**.
   - Click **Adopt as Action Plan** on *"Convene Direct Bank Transfer (DBT) Settlement Drive"*.
   - Confirm assignment to the SDM and verify it appears under the **Action Plan** tab.

---

## 🐳 Alternative: 1-Command Docker Compose Deployment

If you prefer to run everything inside isolated Docker containers (PostgreSQL 16 + FastAPI + Nginx React):

```powershell
cd C:\Users\omkar\.gemini\antigravity\scratch\sih26017-land-acquisition
docker-compose up --build -d
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **PostgreSQL**: `localhost:5432`

To shut down:
```powershell
docker-compose down
```

---

## 🛠️ Automated Testing Verification

To run the automated integration test suite covering all 9 core pipelines:

```powershell
cd C:\Users\omkar\.gemini\antigravity\scratch\sih26017-land-acquisition
python backend/tests/run_tests.py
```

Expected output:
```
============================================================
SIH26017: RUNNING EXPANDED BACKEND & ML INTEGRATION TESTS
============================================================
 [PASS] 1. Root API Health Check
 [PASS] 2. JWT User Authentication & RBAC
 [PASS] 3. Dashboard Summary with National R&R KPI
 [PASS] 4. Geospatial Risk Points Query (10 Projects)
 [PASS] 5. Real-time Prediction & AI Recommendations
 [PASS] 6. 1-Click Adopt Recommendation to Action Plan
 [PASS] 7. What-If Scenario Policy Simulation
 [PASS] 8. R&R Progress Tracking & Settlement
 [PASS] 9. Continuous Model Retraining Pipeline
------------------------------------------------------------
RESULTS: 9/9 tests passed (100.0%)
============================================================
```
