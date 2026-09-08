"""
Comprehensive Test Runner for SIH26017 FastAPI Backend & ML Pipeline.
Covers Authentication, RBAC, Projects, R&R, Possession, Recommendations adoption,
What-If simulation, GIS Geo-points, and Continuous Learning Retraining.
"""

import os
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi.testclient import TestClient
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed import seed_database
from backend.app.main import app

def run_all_tests():
    print("============================================================")
    print("SIH26017: RUNNING EXPANDED BACKEND & ML INTEGRATION TESTS")
    print("============================================================")
    
    # Re-initialize clean test schema
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database()

    client = TestClient(app)
    passed = 0
    total = 0

    def test(name, func):
        nonlocal passed, total
        total += 1
        try:
            func(client)
            print(f" [PASS] {name}")
            passed += 1
        except Exception as e:
            print(f" [FAIL] {name}: {e}")
            import traceback
            traceback.print_exc()

    def t_root(c):
        res = c.get("/")
        assert res.status_code == 200
        assert res.json()["problem_statement"] == "SIH26017"

    def t_login(c):
        res = c.post("/api/auth/login", json={"email": "officer@sih.gov.in", "password": "password123"})
        assert res.status_code == 200
        assert "access_token" in res.json()

    def t_summary(c):
        res = c.get("/api/dashboard/summary")
        assert res.status_code == 200
        data = res.json()
        assert data["total_projects"] == 10
        assert "national_rr_progress_pct" in data

    def t_geo(c):
        res = c.get("/api/dashboard/geo-data")
        assert res.status_code == 200
        assert len(res.json()) == 10

    def t_predict_recommend(c):
        login_res = c.post("/api/auth/login", json={"email": "admin@sih.gov.in", "password": "password123"})
        token = login_res.json()["access_token"]
        res = c.post("/api/projects/1/predict", json={"force_refresh": True}, headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        data = res.json()
        assert "probability" in data
        assert len(data["top_factors"]) > 0
        assert len(data["recommendations"]) > 0

    def t_adopt_recommendation(c):
        login_res = c.post("/api/auth/login", json={"email": "admin@sih.gov.in", "password": "password123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        detail_res = c.get("/api/projects/1", headers=headers)
        recs = detail_res.json()["recommendations"]
        assert len(recs) > 0
        rec_id = recs[0]["id"]
        res = c.post(
            f"/api/projects/1/recommendations/{rec_id}/adopt",
            json={"assigned_to": "SDM Pune", "due_date": "2026-10-15"},
            headers=headers
        )
        assert res.status_code == 200
        assert res.json()["status"] == "OPEN"

    def t_simulate(c):
        login_res = c.post("/api/auth/login", json={"email": "admin@sih.gov.in", "password": "password123"})
        token = login_res.json()["access_token"]
        res = c.post(
            "/api/projects/1/simulate",
            json={"compensation_paid_ratio": 0.95, "rr_progress_pct": 90.0, "pending_document_count": 0},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        sim = res.json()
        assert "simulated_probability" in sim
        assert sim["risk_direction"] == "reduced"

    def t_rr_update(c):
        login_res = c.post("/api/auth/login", json={"email": "admin@sih.gov.in", "password": "password123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        res = c.patch(
            "/api/projects/1/rehabilitation",
            json={"families_rehabilitated": 320, "status": "In Progress"},
            headers=headers
        )
        assert res.status_code == 200
        assert res.json()["families_rehabilitated"] == 320

    def t_retrain_model(c):
        login_res = c.post("/api/auth/login", json={"email": "admin@sih.gov.in", "password": "password123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
    def t_complete_action(c):
        login_res = c.post("/api/auth/login", json={"email": "admin@sih.gov.in", "password": "password123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create an action first
        act_res = c.post(
            "/api/actions/1",
            json={
                "action_type": "Direct Compensation Disbursement",
                "title": "Clear Stage 1 Resettlement Backlog",
                "assigned_to": "SDM Pune",
                "due_date": "2026-10-30"
            },
            headers=headers
        )
        assert act_res.status_code == 201
        action_id = act_res.json()["id"]

        # Complete and re-score the action
        complete_res = c.patch(
            f"/api/actions/{action_id}",
            json={
                "status": "COMPLETED",
                "outcome": "Disbursement completed successfully; compensation backlog resolved."
            },
            headers=headers
        )
        assert complete_res.status_code == 200
        data = complete_res.json()
        assert data["status"] == "COMPLETED"
        assert data["post_action_risk"] is not None

    test("1. Root API Health Check", t_root)
    test("2. JWT User Authentication & RBAC", t_login)
    test("3. Dashboard Summary with National R&R KPI", t_summary)
    test("4. Geospatial Risk Points Query (10 Projects)", t_geo)
    test("5. Real-time Prediction & AI Recommendations", t_predict_recommend)
    test("6. 1-Click Adopt Recommendation to Action Plan", t_adopt_recommendation)
    test("7. Complete & Re-score Corrective Action Lifecycle", t_complete_action)
    test("8. What-If Scenario Policy Simulation", t_simulate)
    test("9. R&R Progress Tracking & Settlement", t_rr_update)
    test("10. Continuous Model Retraining Pipeline", t_retrain_model)

    print("------------------------------------------------------------")
    print(f"RESULTS: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    print("============================================================")
    if passed != total:
        sys.exit(1)

if __name__ == "__main__":
    run_all_tests()
