# SIH26017: New Features & Architectural Changelog
## Comprehensive Summary of Updated Blueprint Additions

This document details all new capabilities, architectural components, database tables, and machine learning models implemented in accordance with the **Updated 0 → 100 Project Blueprint (SIH26017 / PS ID: 25017)** for the **Ministry of Rural Development, Government of India**.

---

## 🌟 1. Rehabilitation & Resettlement (R&R) Tracking Module (LARR Section 31)

### What Was Added:
- **Dedicated Database Entity**: [`Rehabilitation`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/models/models.py#L115-L130) storing `total_families`, `families_rehabilitated`, `pending_cases`, `progress_pct`, `status`, and `resettlement_site_status`.
- **National KPI Aggregation**: Live calculation of the National R&R Completion Index across all ongoing projects on the Executive Dashboard.
- **Project 360° R&R Tab**: Interactive UI tab in the Project Dossier displaying resettlement colony status, pending claims, and an instant settlement updater that recalculates delay risk upon progress entries.
- **Statutory Alert Triggers**: Automated warnings generated when R&R progress lags behind expected acquisition milestones.

---

## 🗺️ 2. Cadastral Land Possession & Disputed Parcels Tracker

### What Was Added:
- **Dedicated Database Entity**: [`Possession`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/models/models.py#L133-L148) tracking `total_parcels`, `acquired_parcels`, `pending_parcels`, `disputed_parcels`, and `possession_status`.
- **Revenue Survey & Joint Measurement Monitoring**: Distinguishes between parcels acquired through mutual consent awards vs. parcels entangled in Section 64 reference disputes or judicial stays.
- **Interactive Handover Form**: Enables field Revenue Officers and Land Acquisition Officers (LAOs) to log newly demarcated survey numbers and trigger real-time ML risk re-scoring.

---

## 🏛️ 3. Inter-Departmental Collaborating Line Departments Matrix (Stakeholders)

### What Was Added:
- **Dedicated Database Entity**: [`Stakeholder`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/models/models.py#L151-L165) tracking collaborating government entities (Forest & Wildlife Dept, State Electricity Boards, PWD, Railways, Gas Authority).
- **Responsiveness Index**: Tracks average turnaround time (`avg_response_days`), pending statutory action requisitions (`pending_actions`), and an automated responsiveness score ($0.0 - 1.0$).
- **Sluggish Agency Detection**: Highlights inter-departmental bottlenecks in the UI with a 1-click administrative escalation mechanism.

---

## 🤖 4. AI Predictive Recommendations Engine (Next-Best-Actions)

### What Was Added:
- **Dedicated Database Entity**: [`Recommendation`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/models/models.py#L168-L182) storing statutory recommendations mapped to the RFCTLARR Act 2013.
- **Rule + ML Root Cause Synthesis**: Evaluates top contributing risk factors and automatically generates targeted next-best-actions across 5 categories:
  1. **Compensation**: Convening Direct Bank Transfer (DBT) / PFMS payment settlement camps.
  2. **R&R**: Accelerating resettlement colony basic civic infrastructure and Gram Sabha consultations.
  3. **Legal**: Filing expedited vacation applications in High Court or organizing Special Lok Adalats with District Legal Services Authorities (DLSA).
  4. **Inter-Dept**: Convening State-Level Empowered Committee meetings for Forest Stage-II and utility relocations.
  5. **Documentation**: Deploying revenue surveyor drone taskforces to clear Section 11/19 declarations.
- **1-Click "Adopt as Action Plan" Workflow**: Instantly transforms an AI recommendation into an assigned intervention with assigned officer and due date.
- **Extended Governance Loop**: Completes the full **Predict → Explain → Recommend → Alert → Act → Measure** decision lifecycle.

---

## 🔬 5. Dual ML Pipeline (Classifier + Delay Days Regressor)

### What Was Added:
- **Primary Delay Classifier (`delay_model_v1.joblib`)**: Multi-model benchmarked ladder (Logistic Regression, Random Forest, Gradient Boosting, XGBoost, LightGBM) calibrated to output precise delay probabilities ($0 - 100\%$) and 4 risk bands (LOW, MEDIUM, HIGH, CRITICAL).
- **Secondary Delay Days Regressor (`delay_days_regressor.joblib`)**: Dedicated Gradient Boosting Regressor trained specifically on delayed cases to predict the continuous duration of project delay in calendar days.
- **Expanded 34-Feature Space**:
  - `land_area_hectares`, `total_parcels`, `parcels_pending_possession`, `disputed_parcels_count`
  - `affected_owner_count`, `household_count`, `families_rehabilitated`, `rr_pending_cases`, `rr_progress_pct`
  - `project_value_cr`, `compensation_offered_cr`, `compensation_paid_ratio`
  - `pending_document_count`, `document_pending_ratio`, `approval_age_days`
  - `objection_count`, `ownership_conflict_count`, `court_stay_flag`, `legal_issue_count`
  - `stakeholder_response_days`, `department_responsiveness_score`
  - `utility_shift_pending`, `forest_clearance_pending`, `railway_crossing_pending`
  - `stage_age_days`, `project_age_days`, `days_to_target`, `overall_progress_pct`, `progress_gap`
  - `district_delay_rate`, `past_delay_count`, `state`, `district`, `project_type`, `priority`, `current_stage`.

---

## 🔄 6. Continuous Learning & Retraining Pipeline

### What Was Added:
- **API Endpoint**: `POST /api/reports/retrain` to trigger automated model retraining when newly completed land acquisition outcomes are recorded.
- **Model Governance UI**: Retrain trigger button in the Model Governance screen displaying updated ROC-AUC, Precision, Recall, and Brier calibration scores.
- **Audit Logging**: Every retraining event is recorded in the immutable audit log table with timestamps and metrics.

---

## 🗄️ 7. Production PostgreSQL + PostGIS Compatibility

### What Was Added:
- **PostgreSQL DDL Script**: [`backend/app/schema_postgres.sql`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/schema_postgres.sql) with table definitions, foreign keys, compound indexes, and UUID/PostGIS extension support.
- **Dynamic Database Adapter**: Seamlessly toggles between local SQLite and production PostgreSQL via the `DATABASE_URL` environment variable.
- **Docker Compose Integration**: Updated `docker-compose.yml` with PostgreSQL 16 container, automated schema mounting, and health checks.

---

## 📊 Summary of Added/Updated Files

| File Path | Description of Changes |
| :--- | :--- |
| [`backend/app/models/models.py`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/models/models.py) | Added `Rehabilitation`, `Possession`, `Stakeholder`, and `Recommendation` ORM entities. |
| [`backend/app/schemas/schemas.py`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/schemas/schemas.py) | Added Pydantic schemas for R&R, Possession, Stakeholders, Recommendations adoption, and Retraining. |
| [`backend/app/services/ml_service.py`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/services/ml_service.py) | Added 34-feature extractor, Dual Model loader, and AI Predictive Recommendations generator. |
| [`backend/app/routes/projects.py`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/routes/projects.py) | Added R&R patch, Possession patch, Stakeholders creation, and Recommendations adoption endpoints. |
| [`backend/app/routes/dashboard.py`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/routes/dashboard.py) | Added National R&R KPI and Recommendations counter to dashboard summary API. |
| [`backend/app/routes/reports.py`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/routes/reports.py) | Added `POST /api/reports/retrain` endpoint for continuous model learning. |
| [`backend/app/seed.py`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/seed.py) | Populated all 10 flagship infrastructure projects with complete R&R, Possession, Stakeholders, and Recommendations data. |
| [`backend/app/schema_postgres.sql`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/schema_postgres.sql) | DDL script for PostgreSQL & PostGIS production initialization. |
| [`frontend/src/services/api.js`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/frontend/src/services/api.js) | Added API client methods for R&R, Possession, Stakeholders, Recommendations adoption, and Retraining. |
| [`frontend/src/components/RecommendationsCard.jsx`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/frontend/src/components/RecommendationsCard.jsx) | UI component for AI Next-Best-Action cards with 1-click adoption button. |
| [`frontend/src/pages/ProjectDetailPage.jsx`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/frontend/src/pages/ProjectDetailPage.jsx) | Integrated R&R tracker, Cadastral Possession tab, Stakeholders matrix, and Recommendations card. |
| [`frontend/src/pages/DashboardPage.jsx`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/frontend/src/pages/DashboardPage.jsx) | Added National R&R KPI card and recommendations status counters. |
| [`SETUP.md`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/SETUP.md) | Complete system setup, PostgreSQL configuration, demo credentials, and testing guide. |
| [`NEW_FEATURES_CHANGELOG.md`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/NEW_FEATURES_CHANGELOG.md) | This comprehensive changelog document. |
