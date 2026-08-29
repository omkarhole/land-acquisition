"""
Machine Learning Service for SIH26017 Land Acquisition Analytics.
Loads trained XGBoost pipeline, performs real-time feature engineering,
generates explainable risk scores, and powers What-If simulations.
"""

import os
import joblib
import pandas as pd
import numpy as np
from datetime import date, datetime
from typing import Dict, Any, List, Tuple

# Base paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "artifacts", "delay_model_v1.joblib")

_model = None

def get_model():
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            # Train model on the fly if artifact not found
            from ml.src.train import train_and_evaluate
            data_file = os.path.join(BASE_DIR, "ml", "data", "projects.csv")
            art_dir = os.path.join(BASE_DIR, "ml", "artifacts")
            _model, _ = train_and_evaluate(data_file, art_dir)
    return _model


def determine_risk_level(prob: float) -> str:
    if prob >= 0.85:
        return "CRITICAL"
    elif prob >= 0.70:
        return "HIGH"
    elif prob >= 0.40:
        return "MEDIUM"
    else:
        return "LOW"


def extract_features_from_project(project) -> Dict[str, Any]:
    today = date.today()
    
    # Calculate timeline metrics
    start_date = project.start_date
    target_date = project.target_date
    
    project_age_days = max(1, (today - start_date).days)
    days_to_target = (target_date - today).days
    planned_duration = max(30, (target_date - start_date).days)
    
    expected_progress = min(1.0, max(0.05, project_age_days / planned_duration))
    overall_progress = project.overall_progress_pct or 0.0
    progress_gap = round((expected_progress * 100.0) - overall_progress, 1)

    # Documents metrics
    total_docs = len(project.documents) if project.documents else 10
    pending_docs = sum(1 for d in project.documents if d.status != "Approved") if project.documents else 3
    doc_pending_ratio = round(pending_docs / max(1, total_docs), 3)

    # Compensation metrics
    comp_offered = project.compensation_offered_cr or 1.0
    comp_paid = project.compensation_paid_cr or 0.0
    comp_paid_ratio = round(min(1.0, comp_paid / max(0.01, comp_offered)), 3)

    # Current stage metrics
    current_stage_record = None
    if project.stages:
        for s in project.stages:
            if s.status == "In Progress":
                current_stage_record = s
                break
        if not current_stage_record and project.stages:
            current_stage_record = project.stages[0]

    stage_age_days = current_stage_record.days_in_stage if current_stage_record else 35

    # Legal issues
    objection_cnt = project.objection_count or 0
    court_stay = 1 if project.court_stay_flag else 0
    legal_issues = objection_cnt + (3 if court_stay else 0)

    features = {
        "land_area_hectares": float(project.land_area_hectares or 50.0),
        "affected_owner_count": int(project.affected_owner_count or 100),
        "household_count": int(project.household_count or 80),
        "project_value_cr": float(project.project_value_cr or 100.0),
        "compensation_offered_cr": float(comp_offered),
        "compensation_paid_ratio": float(comp_paid_ratio),
        "pending_document_count": int(pending_docs),
        "document_pending_ratio": float(doc_pending_ratio),
        "pending_approval_count": 2 if doc_pending_ratio > 0.3 else 0,
        "approval_age_days": 45 if doc_pending_ratio > 0.3 else 10,
        "objection_count": int(objection_cnt),
        "court_stay_flag": int(court_stay),
        "legal_issue_count": int(legal_issues),
        "utility_shift_pending": 1 if project.utility_shift_pending else 0,
        "forest_clearance_pending": 1 if project.forest_clearance_pending else 0,
        "railway_crossing_pending": 1 if project.railway_crossing_pending else 0,
        "stage_age_days": int(stage_age_days),
        "project_age_days": int(project_age_days),
        "days_to_target": int(days_to_target),
        "overall_progress_pct": float(overall_progress),
        "progress_gap": float(progress_gap),
        "district_delay_rate": float(project.district_delay_rate or 0.28),
        "past_delay_count": int(project.past_delay_count or 1),
        "state": str(project.state or "Maharashtra"),
        "district": str(project.district or "Pune"),
        "project_type": str(project.project_type or "National Highway Corridor"),
        "priority": str(project.priority or "Normal"),
        "current_stage": str(project.current_stage or "Stage 1: Preliminary Survey & SIA")
    }

    return features


def generate_explanations(features: Dict[str, Any], prob: float) -> List[Dict[str, Any]]:
    factors = []

    # 1. Stage duration bottleneck
    stage_age = features.get("stage_age_days", 0)
    if stage_age >= 45:
        factors.append({
            "feature_name": "stage_age_days",
            "feature_label": "Prolonged Stage Duration",
            "value_display": f"{stage_age} days in current stage",
            "contribution": round(min(0.35, stage_age / 150.0), 3),
            "direction": "up",
            "impact_text": f"Project has spent {stage_age} days in current stage without clearance, exceeding normal baseline (30 days)."
        })

    # 2. Compensation disbursement deficit
    comp_ratio = features.get("compensation_paid_ratio", 0.0)
    if comp_ratio < 0.60:
        factors.append({
            "feature_name": "compensation_paid_ratio",
            "feature_label": "Compensation Disbursement Gap",
            "value_display": f"{int(comp_ratio * 100)}% compensation disbursed",
            "contribution": round(0.28 * (1.0 - comp_ratio), 3),
            "direction": "up",
            "impact_text": f"Only {int(comp_ratio * 100)}% of award compensation disbursed; creates land owner resistance and possession delays."
        })
    elif comp_ratio >= 0.80:
        factors.append({
            "feature_name": "compensation_paid_ratio",
            "feature_label": "High Compensation Settlement",
            "value_display": f"{int(comp_ratio * 100)}% compensation paid",
            "contribution": round(-0.18 * comp_ratio, 3),
            "direction": "down",
            "impact_text": f"{int(comp_ratio * 100)}% compensation disbursed significantly reduces grievance and handover friction."
        })

    # 3. Document verification backlog
    doc_ratio = features.get("document_pending_ratio", 0.0)
    pending_docs = features.get("pending_document_count", 0)
    if doc_ratio > 0.25:
        factors.append({
            "feature_name": "document_pending_ratio",
            "feature_label": "Pending Regulatory Documentation",
            "value_display": f"{int(doc_ratio * 100)}% docs pending ({pending_docs} files)",
            "contribution": round(0.22 * doc_ratio, 3),
            "direction": "up",
            "impact_text": f"{pending_docs} mandatory title / gazette verification documents remain unapproved."
        })

    # 4. Objections & Legal
    court_stay = features.get("court_stay_flag", 0)
    objection_cnt = features.get("objection_count", 0)
    if court_stay:
        factors.append({
            "feature_name": "court_stay_flag",
            "feature_label": "High Court Stay / Legal Injunction",
            "value_display": "Active Legal Injunction",
            "contribution": 0.32,
            "direction": "up",
            "impact_text": "Judicial stay order active; halts physical possession under Section 19/20."
        })
    elif objection_cnt >= 3:
        factors.append({
            "feature_name": "objection_count",
            "feature_label": "Unresolved Landowner Objections",
            "value_display": f"{objection_cnt} public objections",
            "contribution": round(min(0.25, objection_cnt * 0.06), 3),
            "direction": "up",
            "impact_text": f"{objection_cnt} Section 15 objections pending hearing before the Collector."
        })

    # 5. Progress timeline gap
    progress_gap = features.get("progress_gap", 0.0)
    if progress_gap > 15.0:
        factors.append({
            "feature_name": "progress_gap",
            "feature_label": "Schedule Slippage Gap",
            "value_display": f"{progress_gap:.1f}% behind schedule",
            "contribution": round(min(0.24, progress_gap / 100.0), 3),
            "direction": "up",
            "impact_text": f"Physical and financial progress lagging expected timeline by {progress_gap:.1f}%."
        })

    # 6. Inter-departmental dependencies
    if features.get("forest_clearance_pending", 0):
        factors.append({
            "feature_name": "forest_clearance_pending",
            "feature_label": "Stage-II Forest Clearance NOC",
            "value_display": "Pending MoEFCC Approval",
            "contribution": 0.15,
            "direction": "up",
            "impact_text": "Pending forest land diversion approval delays possession."
        })

    if features.get("utility_shift_pending", 0):
        factors.append({
            "feature_name": "utility_shift_pending",
            "feature_label": "Utility Shifting Clearance",
            "value_display": "Pending Power/Water Line Shift",
            "contribution": 0.12,
            "direction": "up",
            "impact_text": "High-tension transmission lines and water mains pending physical relocation."
        })

    # 7. District historical track record
    dist_rate = features.get("district_delay_rate", 0.28)
    if dist_rate < 0.22:
        factors.append({
            "feature_name": "district_delay_rate",
            "feature_label": "Fast District Administration",
            "value_display": f"{int(dist_rate * 100)}% historical district delay rate",
            "contribution": -0.12,
            "direction": "down",
            "impact_text": f"District has exceptional track record of rapid land acquisition settlements ({int(dist_rate * 100)}% delay baseline)."
        })
    elif dist_rate > 0.40:
        factors.append({
            "feature_name": "district_delay_rate",
            "feature_label": "High Regional Delay Tendency",
            "value_display": f"{int(dist_rate * 100)}% historical district delay rate",
            "contribution": 0.14,
            "direction": "up",
            "impact_text": f"Regional land records fragmentation in this district creates historical delay risks."
        })

    # Sort by absolute contribution and take top 5
    factors.sort(key=lambda x: abs(x["contribution"]), reverse=True)
    return factors[:5]


def predict_project_risk(project) -> Tuple[float, str, int, List[Dict[str, Any]]]:
    model = get_model()
    features = extract_features_from_project(project)
    
    df = pd.DataFrame([features])
    proba = float(model.predict_proba(df)[0, 1])
    risk_level = determine_risk_level(proba)
    
    stage_age = features.get("stage_age_days", 20)
    objections = features.get("objection_count", 0)
    
    if proba >= 0.40:
        estimated_delay_days = int(max(10, (proba * 85) + (stage_age * 0.3) + (objections * 8)))
    else:
        estimated_delay_days = 0

    explanations = generate_explanations(features, proba)
    return proba, risk_level, estimated_delay_days, explanations


def simulate_what_if(project, simulation_overrides: Dict[str, Any]) -> Dict[str, Any]:
    model = get_model()
    features = extract_features_from_project(project)

    # Base prediction
    base_df = pd.DataFrame([features])
    base_proba = float(model.predict_proba(base_df)[0, 1])
    base_risk = determine_risk_level(base_proba)

    # Apply simulation overrides
    sim_features = features.copy()
    for key, value in simulation_overrides.items():
        if value is not None:
            if key == "compensation_paid_ratio":
                sim_features["compensation_paid_ratio"] = float(value)
                # Recalculate progress
                sim_features["overall_progress_pct"] = min(98.0, sim_features["overall_progress_pct"] + (value * 20))
                sim_features["progress_gap"] = max(0.0, sim_features["progress_gap"] - (value * 15))
            elif key == "pending_document_count":
                sim_features["pending_document_count"] = int(value)
                total_docs = len(project.documents) if project.documents else 10
                sim_features["document_pending_ratio"] = round(value / max(1, total_docs), 3)
            elif key == "objection_count":
                sim_features["objection_count"] = int(value)
                sim_features["legal_issue_count"] = int(value) + (3 if sim_features["court_stay_flag"] else 0)
            elif key == "court_stay_flag":
                sim_features["court_stay_flag"] = 1 if value else 0
                sim_features["legal_issue_count"] = sim_features["objection_count"] + (3 if value else 0)
            elif key == "stage_age_days":
                sim_features["stage_age_days"] = int(value)
            elif key in sim_features:
                sim_features[key] = int(value) if isinstance(value, bool) else value

    # Simulated inference
    sim_df = pd.DataFrame([sim_features])
    sim_proba = float(model.predict_proba(sim_df)[0, 1])
    sim_risk = determine_risk_level(sim_proba)

    delta = round(sim_proba - base_proba, 4)
    direction = "reduced" if delta < -0.01 else ("increased" if delta > 0.01 else "unchanged")

    sim_factors = generate_explanations(sim_features, sim_proba)

    return {
        "original_probability": round(base_proba, 3),
        "original_risk_level": base_risk,
        "simulated_probability": round(sim_proba, 3),
        "simulated_risk_level": sim_risk,
        "probability_delta": delta,
        "risk_direction": direction,
        "simulated_factors": sim_factors
    }
