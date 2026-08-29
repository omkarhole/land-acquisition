# SIH26017: REST API Specification

Base URL: `http://localhost:8000`

---

## Authentication Endpoints

### 1. User Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "officer@sih.gov.in",
  "password": "password123"
}
```
- **Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "token_type": "bearer",
  "user": {
    "id": 2,
    "name": "Project Officer",
    "email": "officer@sih.gov.in",
    "role": "officer",
    "designation": "Land Acquisition Officer (LAO)",
    "district": "Pune",
    "state": "Maharashtra"
  }
}
```

---

## Projects & Prediction Endpoints

### 2. List Projects
- **Endpoint**: `GET /api/projects`
- **Query Parameters**: `search`, `state`, `district`, `project_type`, `risk_level`, `status`
- **Response (200 OK)**: Array of project summaries including `latest_prediction`.

### 3. Get Project Detail
- **Endpoint**: `GET /api/projects/{id}`
- **Response (200 OK)**: Full project 360° dossier containing stages, documents, compensation, active alerts, actions, and prediction with XAI factor breakdown.

### 4. Trigger Real-time Prediction
- **Endpoint**: `POST /api/projects/{id}/predict`
- **Request Body**: `{"force_refresh": true}`
- **Response (200 OK)**:
```json
{
  "id": 12,
  "project_id": 1,
  "probability": 0.82,
  "risk_level": "HIGH",
  "estimated_delay_days": 78,
  "model_version": "xgb-v1.0.0",
  "top_factors": [
    {
      "feature_name": "stage_age_days",
      "feature_label": "Prolonged Stage Duration",
      "value_display": "85 days in current stage",
      "contribution": 0.28,
      "direction": "up",
      "impact_text": "Project has spent 85 days in current stage without clearance, exceeding normal baseline (30 days)."
    },
    {
      "feature_name": "compensation_paid_ratio",
      "feature_label": "Compensation Disbursement Gap",
      "value_display": "39% compensation disbursed",
      "contribution": 0.22,
      "direction": "up",
      "impact_text": "Only 39% of award compensation disbursed; creates land owner resistance and possession delays."
    }
  ]
}
```

### 5. What-If Scenario Simulator
- **Endpoint**: `POST /api/projects/{id}/simulate`
- **Request Body**:
```json
{
  "compensation_paid_ratio": 0.90,
  "pending_document_count": 1,
  "objection_count": 0
}
```
- **Response (200 OK)**:
```json
{
  "original_probability": 0.82,
  "original_risk_level": "HIGH",
  "simulated_probability": 0.48,
  "simulated_risk_level": "MEDIUM",
  "probability_delta": -0.34,
  "risk_direction": "reduced"
}
```

---

## Early-Warning & Governance Endpoints

### 6. List Alerts
- **Endpoint**: `GET /api/alerts?status=ACTIVE`

### 7. Acknowledge Alert
- **Endpoint**: `PATCH /api/alerts/{id}/acknowledge`

### 8. Create Intervention Action
- **Endpoint**: `POST /api/actions/{project_id}`

### 9. Complete Action (Auto-Recalculate Post-Risk)
- **Endpoint**: `PATCH /api/actions/{action_id}`

### 10. Executive Report Dossier
- **Endpoint**: `GET /api/reports/project/{id}`

### 11. Model Card & Governance Audit
- **Endpoint**: `GET /api/reports/model-card`
- **Endpoint**: `GET /api/reports/audit-logs?limit=50`
