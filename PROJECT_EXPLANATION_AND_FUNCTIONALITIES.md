# SIH26017: Land Acquisition Delay Early Warning System
## Comprehensive Project Guide & Functional Specifications

---

## 📌 1. Project Overview & Problem Statement

* **Problem Statement ID**: SIH26017 / PS ID 25017
* **Ministry**: Ministry of Rural Development (MoRD) & Department of Land Resources (DoLR), Government of India
* **Title**: Predictive Analytics System for Early Detection of Land Acquisition Delays
* **Objective**: Land acquisition under the **RFCTLARR Act 2013** (Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act) often suffers from severe timeline slippages due to legal disputes, compensation delays, rehabilitation lag, statutory clearance bottlenecks, and sluggish inter-departmental coordination. 

This platform provides an end-to-end decision-support system to **Predict**, **Explain**, **Alert**, **Simulate**, and **Mitigate** land acquisition delays before they halt major national infrastructure corridors.

---

## 🏗️ 2. High-Level Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                                  REACT FRONTEND                                   |
|  Tailwind CSS • Lucide Icons • Recharts • Leaflet GIS • Vite (Port 5173 / SPA)    |
+-----------------------------------------------------------------------------------+
                                         │
                                   REST API / JWT
                                         ▼
+-----------------------------------------------------------------------------------+
|                                 FASTAPI BACKEND                                   |
|   RBAC Auth Engine • ORM (SQLAlchemy) • Pydantic Schemas • CORS • Python 3.10/3.14  |
+-----------------------------------------------------------------------------------+
                      │                                      │
                      ▼                                      ▼
+------------------------------------+  +-------------------------------------------+
|          ML INFERENCE ENGINE       |  |             DATABASE STORAGE              |
| Dual Model (XGBoost + Regressor)   |  | SQLite / PostgreSQL (PostGIS Compatible)  |
| 34 Features • XAI Attribution      |  | 14 ORM Entities • Immutable Audit Logs    |
+------------------------------------+  +-------------------------------------------+
```

### Technology Stack Details:
1. **Frontend**: React 18, Vite, Tailwind CSS, Recharts (Data Visualizations), Leaflet.js (Geospatial Mapping), Lucide-React Icons.
2. **Backend**: FastAPI (Python), SQLAlchemy ORM, Pydantic v2, PyJWT, Passlib (bcrypt).
3. **Machine Learning Pipeline**:
   - **XGBoost Classifier**: Predicts delay probability ($P_{delay} \in [0, 1]$) calibrated via Sigmoid/Isotonic alignment.
   - **Gradient Boosting Regressor**: Predicts estimated delay duration in days ($10 \text{ to } 300+$ days).
   - **Explainable AI (XAI)**: Feature-level factor attribution providing top positive/negative delay drivers.
   - **AI Predictive Recommendations Engine**: Next-Best-Action generator based on LARR 2013 statutory rules.
   - **What-If Scenario Simulator**: Evaluates real-time risk reduction upon policy/field intervention changes.
4. **Database Engine**: Dual Support:
   - **SQLite**: Local zero-config development database (`sih26017_land_delay.db`).
   - **PostgreSQL**: Production-ready schema with PostGIS spatial extension compatibility (`schema_postgres.sql`).

---

## 🗄️ 3. Database Architecture (14 ORM Entities)

| Entity | Table Name | Purpose | Key Attributes |
| :--- | :--- | :--- | :--- |
| `User` | `users` | Role-Based Access Control | `email`, `password_hash`, `role` (admin, officer, district, director, analyst) |
| `Project` | `projects` | Core infrastructure project record | `project_code`, `state`, `district`, `land_area_hectares`, `project_value_cr`, `latitude`, `longitude` |
| `Stage` | `stages` | LARR 2013 6 statutory stages | `stage_order` (1 to 6), `stage_name`, `days_in_stage`, `status` |
| `Document` | `documents` | Statutory clearances & gazettes | `document_type`, `title`, `status` (Approved / Pending) |
| `Compensation` | `compensation` | Land award disbursement | `total_amount_cr`, `disbursed_amount_cr`, `disbursement_pct` |
| `Rehabilitation` | `rehabilitation` | R&R resettlement tracking | `total_families`, `families_rehabilitated`, `progress_pct`, `resettlement_site_status` |
| `Possession` | `possession` | Cadastral land parcel handover | `total_parcels`, `acquired_parcels`, `pending_parcels`, `disputed_parcels` |
| `Stakeholder` | `stakeholders` | Inter-departmental line depts | `department_name`, `avg_response_days`, `responsiveness_score` |
| `Recommendation` | `recommendations` | AI suggested mitigation actions | `title`, `category`, `urgency`, `expected_risk_reduction_pct`, `action_steps` |
| `Prediction` | `predictions` | ML model prediction logs | `probability`, `risk_level`, `estimated_delay_days`, `model_version` |
| `Explanation` | `explanations` | XAI delay drivers per prediction | `feature_name`, `feature_label`, `contribution`, `direction` |
| `Alert` | `alerts` | Early warning alert logs | `severity`, `alert_type`, `message`, `status` (ACTIVE, ACKNOWLEDGED, RESOLVED) |
| `Action` | `actions` | Corrective intervention plans | `action_type`, `title`, `assigned_to`, `due_date`, `status`, `initial_risk`, `post_action_risk` |
| `AuditLog` | `audit_logs` | Security & compliance audit trail | `user_email`, `action`, `entity_type`, `entity_id`, `details` |

---

## ⚡ 4. REST API Endpoint Specifications

### 🔑 Authentication & User Management (`/api/auth`)
* `POST /api/auth/login`: Authenticate user and issue JWT bearer token (24-hour validity).
* `GET /api/auth/me`: Get profile of currently authenticated user.
* `GET /api/auth/demo-users`: Retrieve list of 5 seeded demo personas for fast role switching.

### 📊 Executive Dashboard (`/api/dashboard`)
* `GET /api/dashboard/summary`: High-level metrics (Total Projects, Critical Risk Count, Avg Delay Probability, National R&R KPI).
* `GET /api/dashboard/geo-data`: Coordinates, project titles, and risk scores for Leaflet map markers.
* `GET /api/dashboard/stage-bottlenecks`: Average delay analysis across LARR 2013 6 statutory stages.
* `GET /api/dashboard/district-analytics`: District-level historical delay rates and performance rankings.

### 🏗️ Projects & 360° Management (`/api/projects`)
* `GET /api/projects`: Searchable list of projects with state, district, stage, and risk level filtering.
* `POST /api/projects`: Create a new land acquisition project with auto-generated 6 statutory stages and standard document checklists.
* `GET /api/projects/{id}`: Detailed 360° view including stages, documents, R&R, possession, stakeholders, recommendations, and predictions.
* `POST /api/projects/{id}/predict`: Force immediate real-time ML risk re-scoring.
* `POST /api/projects/{id}/simulate`: Run interactive "What-If" scenario simulation with custom overrides.
* `POST /api/projects/{id}/recommendations/{rec_id}/adopt`: Convert an AI recommendation into an actionable intervention plan.
* `PATCH /api/projects/{id}/rehabilitation`: Update R&R family counts and resettlement status.
* `PATCH /api/projects/{id}/possession`: Update acquired, pending, and disputed parcel counts.
* `POST /api/projects/{id}/stakeholders`: Register inter-departmental line department response metrics.
* `PATCH /api/projects/{id}/documents/{doc_id}/approve`: Mark statutory document as approved.
* `PATCH /api/projects/{id}/compensation`: Update compensation disbursed amount.

### 🔔 Early Warning Alerts (`/api/alerts`)
* `GET /api/alerts`: List active/acknowledged/resolved risk alerts.
* `PATCH /api/alerts/{id}/acknowledge`: Mark alert as acknowledged by assigned official.
* `PATCH /api/alerts/{id}/resolve`: Resolve alert and update active alert counters.

### 🛠️ Interventions & Action Hub (`/api/actions`)
* `GET /api/actions`: List all corrective action plans.
* `POST /api/actions/{project_id}`: Create custom intervention plan.
* `PATCH /api/actions/{action_id}`: Update action status to `COMPLETED` and auto-calculate post-intervention risk reduction delta ($P_{initial} \to P_{post}$).

### 📜 Reports & Governance (`/api/reports`)
* `GET /api/reports/project/{id}`: Generate executive project status report summary.
* `GET /api/reports/audit-logs`: Fetch immutable security audit logs.
* `GET /api/reports/model-card`: Model card specifications, ROC-AUC metrics, and feature importance rankings.
* `POST /api/reports/retrain`: Trigger automated model retraining pipeline over updated historical dataset.

---

## 🎨 5. Frontend Pages & Interactive Features

1. **Executive Dashboard (`/dashboard`)**: KPI metric cards, Stage Bottlenecks chart, Risk Distribution chart, Quick Alert feed.
2. **Geospatial Risk Map (`/map`)**: Interactive Leaflet map rendering color-coded risk markers (CRITICAL=Red, HIGH=Orange, MEDIUM=Yellow, LOW=Green) across Indian states with popup detail cards.
3. **Projects Registry (`/projects`)**: Full table with search, district filters, stage filters, risk badges, and New Project creation modal.
4. **Project 360° View (`/projects/{id}`)**:
   - LARR 2013 Statutory Stage Timeline.
   - Statutory Document Verification Checklist.
   - Compensation Disbursement Progress.
   - Rehabilitation & Resettlement (R&R) Site Tracker.
   - Cadastral Parcel Possession Matrix.
   - Inter-Departmental Responsiveness Dashboard.
   - Real-time XAI Explainability Card.
   - Interactive What-If Scenario Policy Simulator.
   - AI Predictive Recommendations Cards with 1-Click Adoption.
5. **Early Warning Alerts (`/alerts`)**: Severity-graded alert triage hub with 1-click Acknowledge & Resolve workflows.
6. **Interventions Hub (`/interventions`)**: Corrective Action Plan tracker with "Complete & Re-Score" capability showing live before vs. after risk reduction.
7. **Model Governance (`/governance`)**: Model card metrics, benchmark model comparison ladder (XGBoost vs. Random Forest vs. Gradient Boosting), and 1-Click Retraining button.
8. **Executive Reports & Audit (`/reports`)**: Formal project report exporter and compliance audit trail viewer.
9. **Fast Role Switcher (Navbar)**: 1-click switcher between 5 official personas (Admin, LAO Officer, District Magistrate, Ministry Secretary, Analyst).

---

## 🔐 6. Role-Based Access Control (RBAC) Matrix

| Persona / Role | Email | Scope & Permissions |
| :--- | :--- | :--- |
| **Administrator** | `admin@sih.gov.in` | Full system access, model retraining, user management, project creation/deletion. |
| **Project Officer (LAO)** | `officer@sih.gov.in` | Field officer scope: update stages, approve documents, disburse compensation, update R&R and land possession. |
| **District Collector (DM)** | `district@sih.gov.in` | District oversight: resolve alerts, adopt AI recommendations, create corrective actions, inspect district analytics. |
| **Ministry Secretary** | `director@sih.gov.in` | Executive dashboard, high-level reporting, national R&R KPI review. |
| **ML & Policy Analyst** | `analyst@sih.gov.in` | Model governance, XAI feature attribution analysis, What-If simulation. |

---

## 🧪 7. Automated Integration Verification Suite

The repository includes a 10-test automated integration suite in `backend/tests/run_tests.py`:

1. **Root API Health Check**: Verifies system availability and problem statement ID (`SIH26017`).
2. **JWT User Authentication & RBAC**: Verifies password hashing and JWT token issuance.
3. **Dashboard Summary & National R&R KPI**: Validates aggregate calculation logic.
4. **Geospatial Risk Points Query**: Verifies GIS coordinate output for all projects.
5. **Real-Time ML Prediction & Recommendations**: Tests inference pipeline execution.
6. **1-Click Recommendation Adoption**: Validates conversion of suggestions into action plans.
7. **Complete & Re-Score Action Lifecycle**: Tests `PATCH /api/actions/{id}` status completion and risk delta calculation.
8. **What-If Scenario Policy Simulation**: Validates parameter overrides and risk delta output.
9. **R&R Progress Tracking & Settlement**: Tests rehabilitation record mutation.
10. **Continuous Model Retraining Pipeline**: Verifies model retraining execution and metric updates.
