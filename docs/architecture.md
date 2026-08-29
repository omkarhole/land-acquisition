# SIH26017: System Architecture & Design Specification

## Executive Summary
This document specifies the technical architecture for **SIH26017: Predictive Analytics System for Early Detection of Land Acquisition Delays**, developed for the **Ministry of Rural Development, Government of India**.

---

## 1. High-Level System Architecture

```
                                  +---------------------------------------+
                                  |              Web Browser              |
                                  |  (Officers, Collectors, Analysts)    |
                                  +-------------------+-------------------+
                                                      |
                                                      | HTTPS / REST APIs
                                                      v
                                  +---------------------------------------+
                                  |          React 18 + Vite UI           |
                                  |  - Executive Analytics Dashboard      |
                                  |  - Leaflet GIS Geospatial Heatmap     |
                                  |  - 360° Project Stage Timeline Tracker|
                                  |  - Explainable AI Factor Cards        |
                                  |  - Interactive What-If Simulator      |
                                  |  - Triage & Interventions Hub         |
                                  +-------------------+-------------------+
                                                      |
                                                      | JSON REST Calls
                                                      v
+--------------------------------------------------------------------------------------------------------+
|                                        FastAPI Backend Engine                                          |
|                                                                                                        |
|   +---------------------+   +-----------------------+   +--------------------+   +-----------------+   |
|   |  JWT Auth & RBAC    |   | Project & Stage CRUD  |   | Feature Extractor  |   | Alert Generator |   |
|   |  (5 Official Roles) |   | & LARR 2013 Workflow  |   | (12+ Realtime Var) |   | (Thresholds)    |   |
|   +---------------------+   +-----------------------+   +--------------------+   +-----------------+   |
|                                                                 |                                      |
+-----------------------------------------------------------------|--------------------------------------+
                                                                  |
                                 +--------------------------------+-------------------------------+
                                 |                                                                |
                                 v                                                                v
+---------------------------------------------------+    +---------------------------------------------------+
|               Database Layer                      |    |         Machine Learning Inference Engine         |
|         (SQLite / PostgreSQL 16)                  |    |                                                   |
|  - users, projects, stages, documents             |    |  - Trained XGBoost & LightGBM Pipeline            |
|  - compensations, predictions, explanations       |    |  - Isotonic / Sigmoid Probability Calibration     |
|  - alerts, actions, audit_logs                    |    |  - Local Directional Contribution Rules (XAI)     |
|                                                   |    |  - What-If Policy Simulation Engine               |
+---------------------------------------------------+    +---------------------------------------------------+
```

---

## 2. Component Breakdown

### 2.1 Frontend Client (React 18 + Tailwind CSS + Recharts + Leaflet)
- **Executive Dashboard**: Aggregates national KPIs (Total Projects, High Risk, Critical Count, Average Delay Probability, Active Alerts).
- **Geospatial Risk Map**: Visualizes project clusters on an interactive India GIS map with color-coded risk markers (Red = Critical $\ge 85\%$, Orange = High $70-84\%$, Amber = Medium $40-69\%$, Green = Low $<40\%$).
- **Explainable AI (XAI) Waterfall**: Breaks down delay probability into top contributing factors with directional arrows ($\uparrow$ increases delay risk / $\downarrow$ mitigates delay risk).
- **What-If Scenario Simulator**: Allows administrators to adjust compensation percentages, clear pending NOCs, and resolve objections interactively to calculate risk reduction deltas before executing field orders.
- **Intervention Lifecycle Tracker**: Manages corrective action plans across the full loop: `Predict -> Explain -> Alert -> Act -> Measure`.

### 2.2 Backend Application (FastAPI + Pydantic v2 + SQLAlchemy)
- **Role-Based Access Control (RBAC)**: Supports 5 distinct roles: Administrator, Project Officer (LAO), District Collector (DM), Ministry Joint Secretary, and Data Analyst.
- **Dynamic Feature Extraction**: Automatically extracts real-time process indicators from project database records, including days spent in current stage, pending document ratio, compensation disbursement ratio, legal objection counts, and regional district delay rates.
- **Audit Logging**: Logs 100% of user logins, project modifications, prediction runs, and intervention updates.

### 2.3 Machine Learning Pipeline (Scikit-Learn + XGBoost)
- **Model Architecture**: Calibrated gradient boosted decision trees (XGBoost / LightGBM) trained on multi-stage process metrics.
- **Performance**:
  - ROC-AUC: **0.9532**
  - PR-AUC: **0.9970**
  - Recall: **99.36%** (delayed cases caught)
  - F1-Score: **0.9760**
  - Brier Score: **0.0384** (well-calibrated probabilities)

---

## 3. Database Entity-Relationship Model (ERD)

```
 [User] (id, name, email, password_hash, role, designation, district, state)
    |
    v (Audit logging)
 [AuditLog] (id, user_email, action, entity_type, entity_id, details, created_at)

 [Project] (id, project_code, title, state, district, lat, lng, type, priority, land_area, comp_offered, comp_paid, status)
    |
    +---> [Stage] (id, project_id, stage_order, stage_name, start_date, target_date, status, days_in_stage)
    +---> [Document] (id, project_id, document_type, title, status, uploaded_at)
    +---> [Compensation] (id, project_id, beneficiary_count, total_amount_cr, disbursed_amount_cr, status)
    +---> [Prediction] (id, project_id, probability, risk_level, estimated_delay_days, model_version)
    |        |
    |        +---> [Explanation] (id, prediction_id, feature_name, label, contribution, direction, impact_text)
    |
    +---> [Alert] (id, project_id, severity, alert_type, message, status)
    +---> [Action] (id, project_id, action_type, title, assigned_to, due_date, status, initial_risk, post_action_risk)
```
