"""
Dashboard Analytics & Geospatial Risk Map Router for SIH26017.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database import get_db
from backend.app.models.models import Project, Prediction, Alert, Action, Stage
from backend.app.schemas.schemas import DashboardSummaryOut, GeoRiskPointOut

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    total_projects = len(projects)
    
    if total_projects == 0:
        return {
            "total_projects": 0,
            "low_risk_count": 0,
            "medium_risk_count": 0,
            "high_risk_count": 0,
            "critical_risk_count": 0,
            "delayed_count": 0,
            "avg_delay_probability": 0.0,
            "avg_estimated_delay_days": 0.0,
            "active_alerts_count": 0,
            "pending_actions_count": 0,
            "total_land_area_ha": 0.0,
            "total_compensation_cr": 0.0
        }

    low_count = 0
    medium_count = 0
    high_count = 0
    critical_count = 0
    delayed_count = 0
    total_prob = 0.0
    total_delay_days = 0
    pred_count = 0

    for p in projects:
        if p.status == "Delayed":
            delayed_count += 1
        if p.predictions:
            latest = p.predictions[0]
            pred_count += 1
            total_prob += latest.probability
            total_delay_days += latest.estimated_delay_days
            risk = latest.risk_level.upper()
            if risk == "CRITICAL":
                critical_count += 1
            elif risk == "HIGH":
                high_count += 1
            elif risk == "MEDIUM":
                medium_count += 1
            else:
                low_count += 1
        else:
            low_count += 1

    active_alerts = db.query(Alert).filter(Alert.status == "ACTIVE").count()
    pending_actions = db.query(Action).filter(Action.status != "COMPLETED").count()
    total_land = sum(p.land_area_hectares or 0.0 for p in projects)
    total_comp = sum(p.compensation_offered_cr or 0.0 for p in projects)

    return {
        "total_projects": total_projects,
        "low_risk_count": low_count,
        "medium_risk_count": medium_count,
        "high_risk_count": high_count,
        "critical_risk_count": critical_count,
        "delayed_count": delayed_count,
        "avg_delay_probability": round(total_prob / max(1, pred_count), 3),
        "avg_estimated_delay_days": round(total_delay_days / max(1, pred_count), 1),
        "active_alerts_count": active_alerts,
        "pending_actions_count": pending_actions,
        "total_land_area_ha": round(total_land, 1),
        "total_compensation_cr": round(total_comp, 1)
    }


@router.get("/geo-data", response_model=List[GeoRiskPointOut])
def get_geo_risk_points(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    points = []

    for p in projects:
        if not p.latitude or not p.longitude:
            continue

        prob = 0.25
        risk = "LOW"
        if p.predictions:
            prob = p.predictions[0].probability
            risk = p.predictions[0].risk_level

        points.append({
            "id": p.id,
            "project_code": p.project_code,
            "title": p.title,
            "state": p.state,
            "district": p.district,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "project_type": p.project_type,
            "probability": prob,
            "risk_level": risk,
            "current_stage": p.current_stage,
            "progress_pct": p.overall_progress_pct or 0.0
        })

    return points


@router.get("/stage-bottlenecks")
def get_stage_bottlenecks(db: Session = Depends(get_db)):
    """Computes average days spent across all acquisition stages."""
    stages = db.query(Stage).all()
    stage_data = {}
    stage_benchmarks = {
        "Stage 1: Preliminary Survey & SIA": 45,
        "Stage 2: Section 11 Notification": 60,
        "Stage 3: Section 15 Hearing & Objections": 60,
        "Stage 4: Section 19 Declaration": 90,
        "Stage 5: Valuation & Compensation Award": 90,
        "Stage 6: Land Possession & Handover": 60
    }

    for s in stages:
        name = s.stage_name
        if name not in stage_data:
            stage_data[name] = {"total_days": 0, "count": 0}
        stage_data[name]["total_days"] += s.days_in_stage or 0
        stage_data[name]["count"] += 1

    results = []
    for name, benchmark in stage_benchmarks.items():
        stats = stage_data.get(name, {"total_days": 0, "count": 1})
        avg_days = round(stats["total_days"] / max(1, stats["count"]), 1)
        results.append({
            "stage_name": name,
            "avg_days": avg_days,
            "benchmark_days": benchmark,
            "delay_exceeded_days": max(0.0, avg_days - benchmark),
            "is_bottleneck": avg_days > benchmark
        })

    return results


@router.get("/district-analytics")
def get_district_analytics(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    district_map = {}

    for p in projects:
        d = p.district
        if d not in district_map:
            district_map[d] = {
                "district": d,
                "state": p.state,
                "total_projects": 0,
                "high_critical_count": 0,
                "total_probability": 0.0,
                "total_land_ha": 0.0,
                "total_compensation_cr": 0.0
            }
        district_map[d]["total_projects"] += 1
        district_map[d]["total_land_ha"] += p.land_area_hectares or 0.0
        district_map[d]["total_compensation_cr"] += p.compensation_offered_cr or 0.0

        if p.predictions:
            prob = p.predictions[0].probability
            district_map[d]["total_probability"] += prob
            if p.predictions[0].risk_level in ["HIGH", "CRITICAL"]:
                district_map[d]["high_critical_count"] += 1

    results = []
    for d, data in district_map.items():
        cnt = max(1, data["total_projects"])
        results.append({
            "district": data["district"],
            "state": data["state"],
            "total_projects": data["total_projects"],
            "high_critical_count": data["high_critical_count"],
            "avg_delay_risk_pct": round((data["total_probability"] / cnt) * 100, 1),
            "total_land_ha": round(data["total_land_ha"], 1),
            "total_compensation_cr": round(data["total_compensation_cr"], 1)
        })

    results.sort(key=lambda x: x["avg_delay_risk_pct"], reverse=True)
    return results
