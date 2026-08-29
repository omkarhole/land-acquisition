"""
Standalone Test Runner for SIH26017 FastAPI Backend & ML Pipeline.
"""

import os
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi.testclient import TestClient
from backend.app.main import app

def run_all_tests():
    print("============================================================")
    print("SIH26017: RUNNING BACKEND & ML INTEGRATION TEST SUITE")
    print("============================================================")
    
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
        assert res.json()["total_projects"] >= 10

    def t_geo(c):
        res = c.get("/api/dashboard/geo-data")
        assert res.status_code == 200
        assert len(res.json()) >= 10

    def t_predict(c):
        login_res = c.post("/api/auth/login", json={"email": "admin@sih.gov.in", "password": "password123"})
        token = login_res.json()["access_token"]
        res = c.post("/api/projects/1/predict", json={"force_refresh": True}, headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        data = res.json()
        assert "probability" in data
        assert len(data["top_factors"]) > 0

    def t_simulate(c):
        login_res = c.post("/api/auth/login", json={"email": "admin@sih.gov.in", "password": "password123"})
        token = login_res.json()["access_token"]
        res = c.post("/api/projects/1/simulate", json={"compensation_paid_ratio": 0.95, "pending_document_count": 0}, headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        sim = res.json()
        assert "simulated_probability" in sim

    def t_bottlenecks(c):
        res = c.get("/api/dashboard/stage-bottlenecks")
        assert res.status_code == 200
        assert len(res.json()) == 6

    def t_alerts(c):
        res = c.get("/api/alerts")
        assert res.status_code == 200
        assert len(res.json()) > 0

    test("1. Root API Health Check", t_root)
    test("2. JWT User Authentication & RBAC", t_login)
    test("3. Dashboard Executive KPI Aggregation", t_summary)
    test("4. Geospatial Risk Points Query", t_geo)
    test("5. Real-time ML Prediction & XAI Factor Attribution", t_predict)
    test("6. What-If Scenario Simulation Engine", t_simulate)
    test("7. Acquisition Stage Bottlenecks Analysis", t_bottlenecks)
    test("8. Early Warning Alert Lifecycle", t_alerts)

    print("------------------------------------------------------------")
    print(f"RESULTS: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    print("============================================================")
    if passed != total:
        sys.exit(1)

if __name__ == "__main__":
    run_all_tests()
