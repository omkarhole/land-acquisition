# SIH26017: Smart India Hackathon 12-Slide Pitch Deck

### Problem Statement: SIH26017 — Predictive Analytics System for Early Detection of Land Acquisition Delays
**Ministry**: Ministry of Rural Development  
**Theme**: Smart Automation / Software Track

---

## Slide 1: Title & Team
- **Title**: Prerna-LA: Intelligent Early-Warning & Decision Support System for Land Acquisition
- **Problem Statement ID**: SIH26017
- **Ministry**: Ministry of Rural Development, Government of India
- **Core Value Proposition**: Shifting from reactive post-delay reporting to proactive, explainable predictive intervention.

---

## Slide 2: The Problem & Real-World Pain Points
- **Timeline Overruns**: Over 60% of critical linear infrastructure projects (Railways, Expressways, Corridors) face land acquisition delays under the RFCTLARR Act 2013.
- **Siloed Monitoring**: Delays are typically recognized only *after* target deadlines have lapsed.
- **Friction Points**: Unresolved Section 15 objections, compensation disbursement backlogs, inter-departmental NOCs (Forest/Utility) create compound bottlenecks.

---

## Slide 3: Proposed Solution: Prerna-LA
- **Predictive Decision Support Engine**: Identifies delay vulnerabilities months ahead of target completion.
- **Explainable AI (XAI)**: Demystifies predictions into actionable root causes (e.g. "35% compensation pending", "85 days in Section 15 Hearing").
- **Interactive Policy Simulator**: "What-If" scenario planning to model the risk reduction of administrative interventions.
- **Closed-Loop Governance**: Predict $\rightarrow$ Explain $\rightarrow$ Alert $\rightarrow$ Act $\rightarrow$ Measure.

---

## Slide 4: User Personas & Real-World Workflow
- **District Magistrate / Collector**: Monitors district risk heatmaps, approves compensation awards, disposes Section 15 hearings.
- **Land Acquisition Officer (LAO)**: Manages field surveys, title verification, gazette notifications, and executes intervention action plans.
- **Ministry Decision Maker**: National executive KPIs, sector bottleneck analysis, budget optimization.
- **Policy Analyst**: Evaluates model calibration, feature drift, and regional performance trends.

---

## Slide 5: System Architecture & Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts + Leaflet GIS.
- **Backend API**: FastAPI (Python) + Pydantic v2 + SQLAlchemy (SQLite / PostgreSQL).
- **ML & Analytics**: XGBoost + LightGBM + Scikit-Learn + Probability Calibration + Feature Attribution.
- **Security & Governance**: JWT Authentication, Role-Based Access Control (RBAC), and 100% Immutable Audit Trail.

---

## Slide 6: Data Strategy & Feature Engineering
- **28 Multi-Stage Process Features**:
  - Velocity: `stage_age_days`, `progress_gap`, `days_to_target`.
  - Financial: `compensation_paid_ratio`, `disbursement_velocity`.
  - Regulatory: `document_pending_ratio`, `forest_clearance_pending`, `utility_shift_pending`.
  - Legal: `objection_count`, `court_stay_flag`.
- **Target Variable**: Binary Delay Indicator ($\text{Delay Flag} = 1$) & Estimated Delay Days ($\text{Delay Days}$).
- **Leakage Prevention**: Strictly excludes retrospective features (e.g. final delay reason) known only after project conclusion.

---

## Slide 7: ML Modeling & Benchmarking Results
- **Model Ladder Comparison**:
  - Logistic Regression (Baseline): ROC-AUC 0.8916
  - Random Forest: ROC-AUC 0.9493
  - **Calibrated XGBoost (Final)**: **ROC-AUC 0.9532**, **PR-AUC 0.9970**, **Recall 99.36%**, **F1 0.9760**, **Brier Score 0.0384**.
- **Optimization Priority**: High Recall (catching delayed cases) with calibrated probabilities to eliminate false alarms.

---

## Slide 8: Explainable AI & "What-If" Policy Simulation
- **Transparent Attribution**: Shows directional impact ($\uparrow$ increases risk, $\downarrow$ mitigates risk) and plain-English reasons.
- **Interactive Policy Simulator**:
  - Example: Increasing compensation disbursement from 39% to 85% drops delay probability from **82% (High Risk)** to **48% (Medium Risk)** with a 34% measured reduction.

---

## Slide 9: Product Experience: Dashboard & GIS Risk Heatmap
- **National Executive Dashboard**: 6 KPI cards, LARR 2013 stage bottleneck charts, and active alert counters.
- **Geospatial Risk Map**: Color-coded GIS map of India with click-to-inspect project popups and sector filtering.
- **Project 360° View**: Unified view of 6 statutory stages, regulatory dossiers, DBT compensation, and alerts.

---

## Slide 10: Measurable Impact & Value for Government
- **Early Warning**: Identifies high-risk cases 60 to 90 days earlier than traditional spreadsheet monitoring.
- **Focused Resource Allocation**: Prioritizes collectorate attention and special revenue camps on the top 10% high-friction projects.
- **Accountability**: Real-time tracking of intervention action plans with before-and-after risk recalculation.

---

## Slide 11: Security, Compliance & Deployment
- **Role-Based Access Control**: Strict multi-tenant backend authorization.
- **Statutory LARR 2013 Compliance**: Pre-configured with legal timelines and mandatory documentation checkpoints.
- **Deployment Ready**: Dockerized microservices architecture with zero-configuration local launch or cloud deployment.

---

## Slide 12: Future Roadmap & Summary
- **Future Enhancements**: Integration with Bhulekh / PM GatiShakti NMP GIS layers, multi-lingual field mobile app for revenue inspectors, and automated OCR for Section 11/19 gazette parsing.
- **One-Line Pitch**: *“We use process data to predict land acquisition delay risk early, explain the reasons behind the risk, and empower officials to prioritize corrective action through a single unified decision-support platform.”*
