# SIH26017: Comprehensive All-Functionality Verification Guide
## Complete Testing & Verification Playbook for Database, Auth, Backend, ML, and Frontend

This document gives you exact steps and commands to verify **every single feature and component** of the **Land Acquisition Delay Early Warning System** (Ministry of Rural Development, SIH26017).

---

## 📑 Verification Test Matrix

```
+----+----------------------------------------------+---------------------------+------------------------+
| #  | Test Module                                  | Verification Method       | Expected Result        |
+----+----------------------------------------------+---------------------------+------------------------+
| 1  | Instant DB & Auth Verifier                   | Python CLI Script         | [OK] on 4 checks       |
| 2  | Database Connection & Table Records          | pgAdmin / psql / Python   | 10 Projects, 5 Users   |
| 3  | User Authentication & JWT Issuance           | Swagger UI / cURL / Web   | HTTP 200 + Bearer JWT  |
| 4  | Role-Based Access Control (RBAC)             | Protected API Endpoint    | 403 on invalid role    |
| 5  | Real-Time ML Inference & Probability Scoring | POST /api/projects/1/pred | Probability + Risk lvl |
| 6  | Explainable AI (XAI) Factor Attribution      | Prediction Response       | Top 5 +/- factors      |
| 7  | Interactive "What-If" Policy Simulation      | POST /simulate & UI Slider| Live risk delta (Δ)    |
| 8  | 1-Click AI Recommendation Adoption           | POST /recommendations/adpt| Creates Action Plan    |
| 9  | Rehabilitation & Resettlement (R&R) Update   | PATCH /rehabilitation     | Resettlement updated   |
| 10 | Cadastral Land Possession Update             | PATCH /possession         | Parcels updated        |
| 11 | Inter-Department Responsiveness Matrix       | GET /projects/1           | Department scores      |
| 12 | Early-Warning Alert Lifecycle                | PATCH /alerts/1/resolve   | Status: RESOLVED       |
| 13 | Corrective Action Complete & Re-Score Hub    | PATCH /actions/1          | Status: COMPLETED, Δ   |
| 14 | Continuous Model Retraining Pipeline         | POST /reports/retrain     | Retrained + New Metrics|
| 15 | Automated 10-Test Integration Suite          | python run_tests.py       | 100% Pass (10/10)      |
+----+----------------------------------------------+---------------------------+------------------------+
```

---

## ⚡ TEST 1: Instant 5-Second Automated Verifier

Run the automated DB & Auth verification script in your terminal:

```powershell
cd C:\Users\omkar\.gemini\antigravity\scratch\sih26017-land-acquisition
python backend/tests/verify_connection_and_auth.py
```

### ✅ Expected Output:
```
=================================================================
SIH26017: REAL-TIME DB & AUTHENTICATION VERIFIER
=================================================================
[1/4] Checking Database Connection...
      [OK] Database connection successful!

[2/4] Inspecting Database Tables & Record Counts:
      - Users Table:                5 records
      - Projects Table:             10 records
      - Statutory Stages Table:     60 records
      - R&R Resettlement Table:     10 records
      - Cadastral Possession Table: 10 records
      - Line Departments Table:     25 records
      - AI Recommendations Table:   30 records
      [OK] Database schema and seed records are healthy!

[3/4] Testing Authentication & Password Hashing (bcrypt):
      [OK] Password verification passed for 'officer@sih.gov.in' (Role: officer)

[4/4] Testing JWT Token Generation & Cryptographic Signature:
      - Generated JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ... (valid for 24h)
      [OK] JWT Authentication Engine is fully operational!
=================================================================
```

---

## 🗄️ TEST 2: Database Connection & Table Inspection

### Method A: In pgAdmin 4
1. In pgAdmin, right-click database `sih26017` ➔ click **Query Tool**.
2. Run this query:
```sql
SELECT 
    p.project_code,
    p.title,
    p.state,
    p.district,
    p.current_stage,
    p.overall_progress_pct,
    pr.probability AS delay_prob,
    pr.risk_level
FROM projects p
JOIN predictions pr ON p.id = pr.project_id
ORDER BY pr.probability DESC;
```
*Expected Result: Returns 10 projects with calculated delay probabilities and risk categories.*

---

## 🔐 TEST 3: Authentication & Login Verification

### Method A: Via Interactive Swagger UI (Fastest)
1. Open **[http://localhost:8000/docs](http://localhost:8000/docs)** in your browser.
2. Scroll to **`POST /api/auth/login`**.
3. Click **Try it out** and enter:
```json
{
  "email": "officer@sih.gov.in",
  "password": "password123"
}
```
4. Click **Execute**.
5. *Expected Response: HTTP 200 with `access_token` and user object (`role: "officer"`).*

### Method B: Via PowerShell / Terminal Command
```powershell
curl -X POST "http://localhost:8000/api/auth/login" `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@sih.gov.in","password":"password123"}'
```

### Method C: Via Web Frontend (1-Click Login)
1. Open **[http://localhost:5173/login](http://localhost:5173/login)**.
2. Click the **"Project Officer (LAO)"** 1-click login button.
3. *Expected Result: Instantly navigates into the Executive Dashboard as Land Acquisition Officer.*

---

## 📊 TEST 4: Executive Dashboard & Live Aggregations

1. Log into **`http://localhost:5173`**.
2. Verify Dashboard widgets:
   - **Total Projects**: 10
   - **National R&R Progress**: Aggregated completion %
   - **Stage Bottleneck Chart**: Displays all 6 LARR 2013 statutory stages with duration vs legal benchmark.
   - **Portfolio Risk Donut**: Displays distribution (Critical, High, Medium, Low).

---

## 🗺️ TEST 5: Interactive Geospatial GIS Map

1. Click **Risk Map** in the sidebar (or navigate to `http://localhost:5173/risk-map`).
2. Verify:
   - Colored marker pins appear across Indian states (Maharashtra, UP, Gujarat, Karnataka, Tamil Nadu, Odisha, MP, Rajasthan).
   - Click any pin (e.g. Pune or Varanasi) ➔ A popup card opens showing project title, current stage, and calibrated delay probability.
   - Click the **Sector Filter** (e.g. *High-Speed Rail*) ➔ Map dynamically filters matching markers.

---

## 🤖 TEST 6: Real-Time ML Prediction & XAI Factor Attribution

1. In the sidebar, click **Projects** ➔ Select project `LA-2026-0101` (*Pune-Nashik Semi High-Speed Rail Corridor*).
2. Click the blue button **"Run / Refresh AI Prediction"**.
3. Verify:
   - The ML inference engine runs and returns a delay probability (e.g., `82% - HIGH Risk`).
   - **Explainable AI (XAI) Waterfall** appears showing top 5 contributing factors:
     - ⬆️ *R&R Resettlement Lag* (+25% contribution)
     - ⬆️ *Compensation Disbursement Gap* (+28% contribution)
     - ⬆️ *Prolonged Stage Duration* (+35% contribution)
     - ⬆️ *Sluggish Inter-Dept Clearances* (+20% contribution)

---

## 🎛️ TEST 7: "What-If" Policy Simulator (Live Risk Delta)

1. On the Project 360° page, scroll to the **What-If Policy Simulation Studio**.
2. Drag the **Compensation Disbursed %** slider from 38% to 95%.
3. Drag the **Pending Regulatory Documents** slider to 0 files.
4. Verify:
   - The simulated probability instantly drops from **82% (HIGH)** to **38% (LOW)**.
   - The green delta badge displays: **▼ -44% Projected Risk Reduction**.

---

## 📋 TEST 8: 1-Click AI Recommendation Adoption

1. On the Project 360° page, look at the **AI Predictive Recommendations (Next-Best-Actions)** card.
2. Locate the recommendation: *"Convene Direct Bank Transfer (DBT) Settlement Drive"*.
3. Click **"Adopt as Action Plan"**.
4. Select the officer (e.g. *Sub-Divisional Magistrate SDM*) and click **Confirm**.
5. Verify:
   - The recommendation card switches to a green checkmark: *"✓ Adopted into Active Interventions"*.
   - Click the **Action Plan** tab ➔ The new intervention is now listed as an active task.

---

## 🏠 TEST 9: Rehabilitation & Resettlement (R&R) Tracking

1. On the Project 360° page, click the **"Rehabilitation (R&R)"** tab.
2. In the update box, increase *Families Resettled* from `150` to `350`.
3. Click **"Update R&R & Re-Score"**.
4. Verify:
   - Database updates R&R completion from `36.6%` to `85.4%`.
   - The ML model automatically re-evaluates the project and lowers the delay risk score.

---

## 🗺️ TEST 10: Cadastral Land Possession & Disputed Parcels

1. On the Project 360° page, click the **"Cadastral Possession"** tab.
2. Verify total demarcated parcels vs physically acquired parcels.
3. Update acquired parcels from `319` to `750` and click **Update Possession & Re-Score**.
4. Verify the status updates to *"Joint Measurement & Handover"*.

---

## 🏛️ TEST 11: Inter-Departmental Stakeholder Responsiveness

1. On the Project 360° page, click the **"Inter-Dept Responsiveness"** tab.
2. Inspect the matrix of collaborating line departments:
   - *MSEDCL Power Transmission* (52 days avg response time, 48% rating ➔ ⚠️ Escalation Needed)
   - *Central Railway Liaison* (28 days response time, 82% rating ➔ ✓ Responsive)
   - *Pune Revenue Collectorate* (20 days response time, 90% rating ➔ ✓ Responsive)

---

## 🔔 TEST 12: Early-Warning Alert Triage & Resolution

1. Click **Alerts** in the sidebar (or navigate to `http://localhost:5173/alerts`).
2. Locate a `CRITICAL` early warning alert.
3. Click **Acknowledge**, then click **Resolve**.
4. Verify the active alert counter in the sidebar decreases by 1.

---

## 🔄 TEST 13: Corrective Action & Intervention Lifecycle Hub
1. In the sidebar, click **Interventions** (or navigate to `http://localhost:5173/interventions`).
2. Locate any active action plan with status `OPEN` or `IN_PROGRESS`.
3. Click the green button **"Complete & Re-Score"**.
4. Verify:
   - Action status changes to `COMPLETED`.
   - The ML service re-scores the project's risk in real time, displaying the before vs after risk reduction delta (e.g. `78% → 42%`).

---

## 🔄 TEST 14: Continuous Model Retraining Pipeline

1. In the sidebar, click **Governance** (or navigate to `http://localhost:5173/governance`).
2. Inspect the **ML Model Card & Benchmark Ladder** (XGBoost, Random Forest, Gradient Boosting).
3. Click the button **"Trigger Continuous Learning Retraining"**.
4. Verify:
   - Model retraining pipeline runs across the latest project outcomes.
   - Updated ROC-AUC (0.9532), Precision (95.9%), and Recall (99.4%) scores are logged into the immutable audit trail.

---

## 🧪 TEST 15: Full Automated 10-Test Integration Suite

To run all backend & ML integration tests in a single command:

```powershell
cd C:\Users\omkar\.gemini\antigravity\scratch\sih26017-land-acquisition
python backend/tests/run_tests.py
```

### ✅ Expected Output:
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
 [PASS] 7. Complete & Re-score Corrective Action Lifecycle
 [PASS] 8. What-If Scenario Policy Simulation
 [PASS] 9. R&R Progress Tracking & Settlement
 [PASS] 10. Continuous Model Retraining Pipeline
------------------------------------------------------------
RESULTS: 10/10 tests passed (100.0%)
============================================================
```
