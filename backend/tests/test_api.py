"""
Automated Test Suite for SIH26017 FastAPI Backend & ML Service.
"""

import os
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["problem_statement"] == "SIH26017"
    assert data["status"] == "online"

def test_auth_login():
    response = client.post(
        "/api/auth/login",
        json={"email": "officer@sih.gov.in", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "officer"

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_projects"] > 0
    assert "critical_risk_count" in data
    assert "avg_delay_probability" in data

def test_geo_risk_data():
    response = client.get("/api/dashboard/geo-data")
    assert response.status_code == 200
    points = response.json()
    assert len(points) > 0
    assert "latitude" in points[0]
    assert "probability" in points[0]

def test_projects_list():
    response = client.get("/api/projects")
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) > 0
    first_project = projects[0]
    assert "project_code" in first_project
    assert "district" in first_project

def test_project_predict():
    # Login to get token
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "admin@sih.gov.in", "password": "password123"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Run prediction on project 1
    response = client.post(
        "/api/projects/1/predict",
        json={"force_refresh": True},
        headers=headers
    )
    assert response.status_code == 200
    pred = response.json()
    assert "probability" in pred
    assert pred["risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert len(pred["top_factors"]) > 0

def test_what_if_simulation():
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "admin@sih.gov.in", "password": "password123"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Simulate 95% compensation and 0 pending docs
    response = client.post(
        "/api/projects/1/simulate",
        json={
            "compensation_paid_ratio": 0.95,
            "pending_document_count": 0,
            "objection_count": 0
        },
        headers=headers
    )
    assert response.status_code == 200
    sim = response.json()
    assert "original_probability" in sim
    assert "simulated_probability" in sim
    assert sim["simulated_probability"] <= sim["original_probability"]

def test_stage_bottlenecks():
    response = client.get("/api/dashboard/stage-bottlenecks")
    assert response.status_code == 200
    bottlenecks = response.json()
    assert len(bottlenecks) == 6
    assert "avg_days" in bottlenecks[0]

def test_alerts_and_actions():
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "admin@sih.gov.in", "password": "password123"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Check alerts list
    alerts_resp = client.get("/api/alerts", headers=headers)
    assert alerts_resp.status_code == 200

    # Create an action
    action_resp = client.post(
        "/api/actions/1",
        json={
            "action_type": "Expedited Valuation",
            "title": "Deploy Additional Survey Team",
            "description": "Engage private land surveyor to clear backlog",
            "assigned_to": "SDM Pune",
            "due_date": "2026-10-15"
        },
        headers=headers
    )
    assert action_resp.status_code == 201
    action_data = action_resp.json()
    assert action_data["status"] == "OPEN"
