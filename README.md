# SIH26017: Predictive Analytics System for Early Detection of Land Acquisition Delays

[![Ministry](https://img.shields.io/badge/Ministry-Rural%20Development-blue.svg)](https://rural.gov.in)
[![Hackathon](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-orange.svg)](https://sih.gov.in)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com)
[![XGBoost](https://img.shields.io/badge/ML%20Model-Calibrated%20XGBoost%20(ROC--AUC%200.953)-success.svg)](https://xgboost.readthedocs.io)

> **Official Problem Statement ID**: SIH26017  
> **Organization**: Ministry of Rural Development, Government of India  
> **Category**: Software / Full Stack + Data Science  

---

## 🎯 Problem Overview & Value Proposition
Land acquisition under the **RFCTLARR Act 2013** is one of the most complex workflows in major infrastructure execution (Highways, High-Speed Rail, DFCs, Irrigation, Smart Cities). Current monitoring is reactive: project delays are recognized only after deadlines have elapsed.

**Prerna-LA (SIH26017)** transforms reactive monitoring into a proactive, transparent decision-support system:
1. **Predicts Timeline Slippage**: Estimates calibrated delay probability ($0-100\%$) and estimated delay days months ahead.
2. **Explains Root Causes (XAI)**: Demystifies predictions using SHAP-style directional feature attribution ($\uparrow$ increases risk / $\downarrow$ mitigates risk).
3. **Interactive What-If Simulation**: Enables administrators to test the risk impact of potential interventions before taking action.
4. **Early-Warning & Action Lifecycle**: Triggers automated alerts on risk threshold breach and tracks intervention action plans from logging to post-action remeasurement (`Predict -> Explain -> Alert -> Act -> Measure`).

---

## 🌟 Key Features

| Module | Features & Capabilities |
| :--- | :--- |
| **Executive Dashboard** | 6 high-level KPI cards, LARR 2013 stage bottleneck duration analysis, risk distribution donut chart, active alerts stream. |
| **Geospatial Risk Map** | Leaflet-based interactive India GIS heatmap with color-coded pins (Critical $\ge 85\%$, High $70-84\%$, Medium $40-69\%$, Low $<40\%$) and sector filters. |
| **Project 360° Dossier** | Complete visual timeline of all 6 statutory stages, regulatory documents tracker with 1-click approvals, and direct benefit compensation monitoring. |
| **Explainable AI (XAI)** | Transparent waterfall of top 5 contributing process factors with natural language explanations. |
| **What-If Scenario Simulator** | Real-time policy levers (compensation disbursement %, pending files, objections, court stays) showing simulated probability deltas. |
| **Early-Warning Alerts** | Automated multi-tier alerts for high/critical risks with acknowledgment and resolution workflows. |
| **Interventions Tracker** | Corrective action logger that recalculates project risk after completion, measuring realized improvements. |
| **Governance & Reporting** | Printable official Executive Dossier report, ML Model Card, and 100% immutable audit log. |

---

## 🏗️ System Architecture

```
+-----------------------------------------------------------------------------------+
|                        React 18 + Vite Web Application                            |
|       (Dashboard, GIS Map, Project 360°, XAI Waterfall, What-If Simulator)        |
+----------------------------------------+------------------------------------------+
                                         | REST / JSON APIs
                                         v
+-----------------------------------------------------------------------------------+
|                           FastAPI Backend Service                                 |
|  - Role-Based Access Control (Admin, Officer, Collector, Secretary, Analyst)      |
|  - Dynamic Feature Engineering Engine (28 process variables)                      |
|  - Prediction, Simulation, Alerts, Actions, and Audit Logging Services           |
+-------------------+---------------------------------------+-----------------------+
                    |                                       |
                    v                                       v
+-------------------------------+       +-------------------------------------------+
|  SQLite / PostgreSQL Database |       |   Machine Learning Engine (Trained Model) |
|  - users, projects, stages    |       |   - Calibrated XGBoost & LightGBM         |
|  - documents, compensation    |       |   - ROC-AUC: 0.9532 | Recall: 99.36%       |
|  - predictions, explanations  |       |   - Directional Feature Attribution (XAI) |
|  - alerts, actions, audit_logs|       |   - What-If Scenario Simulation Engine    |
+-------------------------------+       +-------------------------------------------+
```

---

## 🚀 Quick Start: Running Locally

### 1. Prerequisites
- Python 3.10+ (or Python 3.14)
- Node.js 18+ & npm

### 2. Backend & Machine Learning Setup
```bash
# Navigate to project root
cd sih26017-land-acquisition

# Install Python requirements
pip install -r backend/requirements.txt

# Generate synthetic dataset and train the ML models
python ml/data/generate_dataset.py
python ml/src/train.py

# Run the automated backend test suite (100% Pass)
python backend/tests/run_tests.py

# Start the FastAPI server (runs on http://localhost:8000)
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
# Open a new terminal in frontend directory
cd sih26017-land-acquisition/frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🔑 Pre-Configured Demo Accounts

For fast evaluation and judging, the login screen includes 1-click login buttons for all 5 roles:

| Role | Email | Password | Scope & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Project Officer (LAO)** | `officer@sih.gov.in` | `password123` | Creates projects, updates stages, approves documents, logs action plans. |
| **District Collector (DM)** | `district@sih.gov.in` | `password123` | Monitors district heatmap, reviews critical cases, exports official dossiers. |
| **Ministry Joint Secretary** | `director@sih.gov.in` | `password123` | National executive KPIs, sector bottleneck analysis, budget overview. |
| **System Administrator** | `admin@sih.gov.in` | `password123` | System settings, user role management, data controls. |
| **Policy & ML Analyst** | `analyst@sih.gov.in` | `password123` | ML Model Card inspection, calibration analysis, audit trail review. |

---

## 📊 Machine Learning Model Benchmarking

Holdout validation results across candidate model ladder:

| Model Architecture | ROC-AUC | PR-AUC | Delay Recall | F1-Score | Brier Score |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Logistic Regression (Baseline) | 0.8916 | 0.9923 | 88.11% | 0.9284 | 0.0941 |
| Random Forest Classifier | 0.9493 | 0.9967 | 99.79% | 0.9701 | 0.0376 |
| Gradient Boosting | 0.9354 | 0.9959 | 99.58% | 0.9730 | 0.0459 |
| LightGBM Classifier | 0.9494 | 0.9968 | 98.30% | 0.9747 | 0.0418 |
| **Calibrated XGBoost (Selected)** | **0.9532** | **0.9970** | **99.36%** | **0.9760** | **0.0384** |

---

## 🐳 Docker Deployment
To run the entire system with Docker Compose:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`

---

## 📚 Documentation Catalog
- [System Architecture & ERD](docs/architecture.md)
- [REST API Specification](docs/api.md)
- [ML Model Card & Governance](docs/model_card.md)
- [12-Slide Pitch Deck Presentation](docs/sih_presentation_12_slides.md)
- [3-Minute Live Judging Demo Script](docs/demo_script_3_min.md)





+---------------------------------------------------------------------------------------------------+
|  MODULE                  | CURRENT PROTOTYPE STATUS            | WHAT REMAINS FOR YOUR CODING     |
+--------------------------+-------------------------------------+----------------------------------+
| 1. Real-World Data (ETL) | Synthetic LARR 2013 data (2,500 rows)| Ingest real CSV/Excel/Gov APIs   |
| 2. Production Database   | SQLite (zero-config, local)         | PostgreSQL 16 + Alembic Migration|
| 3. ML Model Pipeline     | Calibrated XGBoost (v1.0.0)         | Optuna tuning + Regression model |
| 4. Document Intelligence | Metadata tracker                    | OCR for Scanned Gazette/PDFs     |
| 5. Notification Dispatch | In-app notification hub             | SMS / WhatsApp / Email Gateway   |
| 6. GIS Cadastral Layers  | District coordinates mapping        | GeoJSON Cadastral plot polygons  |
+---------------------------------------------------------------------------------------------------+