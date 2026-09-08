"""
Expanded Machine Learning & Recommendation Service for SIH26017.
Features:
- Dual Model (XGBoost Delay Classifier + Gradient Boosting Delay Days Regressor)
- 34-dimensional Process Feature Extraction (R&R, Possession, Stakeholders, Legal)
- Explainable AI Factor Attribution (XAI)
- AI Predictive Recommendations Engine (Next-Best-Action Generator)
- What-If Policy Simulation
"""

import os
import joblib
import pandas as pd
import numpy as np
from datetime import date, datetime
from typing import Dict, Any, List, Tuple

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "artifacts", "delay_model_v1.joblib")
REGRESSOR_PATH = os.path.join(BASE_DIR, "ml", "artifacts", "delay_days_regressor.joblib")

_model = None
_regressor = None

def get_models():
    global _model, _regressor
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            from ml.src.train import train_and_evaluate
            data_file = os.path.join(BASE_DIR, "ml", "data", "projects.csv")
            art_dir = os.path.join(BASE_DIR, "ml", "artifacts")
            _model, _regressor, _ = train_and_evaluate(data_file, art_dir)
            return _model, _regressor

    if _regressor is None and os.path.exists(REGRESSOR_PATH):
        try:
            _regressor = joblib.load(REGRESSOR_PATH)
        except Exception:
            _regressor = None

    return _model, _regressor


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
    
    start_date = project.start_date
    target_date = project.target_date
    
    project_age_days = max(1, (today - start_date).days)
    days_to_target = (target_date - today).days
    planned_duration = max(30, (target_date - start_date).days)
    
    expected_progress = min(1.0, max(0.05, project_age_days / planned_duration))
    overall_progress = project.overall_progress_pct or 0.0
    progress_gap = round((expected_progress * 100.0) - overall_progress, 1)

    # Documents
    total_docs = len(project.documents) if project.documents else 10
    pending_docs = sum(1 for d in project.documents if d.status != "Approved") if project.documents else 3
    doc_pending_ratio = round(pending_docs / max(1, total_docs), 3)

    # Compensation
    comp_offered = project.compensation_offered_cr or 1.0
    comp_paid = project.compensation_paid_cr or 0.0
    comp_paid_ratio = round(min(1.0, comp_paid / max(0.01, comp_offered)), 3)

    # Current stage
    current_stage_record = None
    if project.stages:
        for s in project.stages:
            if s.status == "In Progress":
                current_stage_record = s
                break
        if not current_stage_record and project.stages:
            current_stage_record = project.stages[0]

    stage_age_days = current_stage_record.days_in_stage if current_stage_record else 35

    # Legal & Ownership
    objection_cnt = project.objection_count or 0
    ownership_conflicts = project.ownership_conflict_count or 0
    court_stay = 1 if project.court_stay_flag else 0
    legal_issues = objection_cnt + (3 if court_stay else 0) + ownership_conflicts

    # R&R Features
    rr_progress_pct = 50.0
    families_rehab = 0
    rr_pending = 0
    if project.rehabilitations:
        rr = project.rehabilitations[0]
        rr_progress_pct = rr.progress_pct or 0.0
        families_rehab = rr.families_rehabilitated or 0
        rr_pending = rr.pending_cases or 0
    else:
        hh_count = project.household_count or 100
        rr_progress_pct = min(100.0, max(10.0, comp_paid_ratio * 90.0))
        families_rehab = int((rr_progress_pct / 100.0) * hh_count)
        rr_pending = hh_count - families_rehab

    # Possession & Parcels
    total_parcels = max(10, int((project.land_area_hectares or 50.0) * 8))
    parcels_pending = int(total_parcels * (1.0 - comp_paid_ratio))
    disputed_parcels = ownership_conflicts * 2 + (5 if court_stay else 0)
    if project.possessions:
        pos = project.possessions[0]
        total_parcels = pos.total_parcels or total_parcels
        parcels_pending = pos.pending_parcels or parcels_pending
        disputed_parcels = pos.disputed_parcels or disputed_parcels

    # Stakeholder Responsiveness
    stakeholder_response_days = 35
    responsiveness_score = 0.75
    if project.stakeholders:
        avg_resp = sum(s.avg_response_days for s in project.stakeholders) / len(project.stakeholders)
        stakeholder_response_days = int(avg_resp)
        responsiveness_score = max(0.1, min(1.0, 1.0 - (stakeholder_response_days / 100.0)))

    features = {
        "land_area_hectares": float(project.land_area_hectares or 50.0),
        "total_parcels": int(total_parcels),
        "parcels_pending_possession": int(parcels_pending),
        "disputed_parcels_count": int(disputed_parcels),
        "affected_owner_count": int(project.affected_owner_count or 100),
        "household_count": int(project.household_count or 80),
        "families_rehabilitated": int(families_rehab),
        "rr_pending_cases": int(rr_pending),
        "rr_progress_pct": float(rr_progress_pct),
        "project_value_cr": float(project.project_value_cr or 100.0),
        "compensation_offered_cr": float(comp_offered),
        "compensation_paid_ratio": float(comp_paid_ratio),
        "pending_document_count": int(pending_docs),
        "document_pending_ratio": float(doc_pending_ratio),
        "pending_approval_count": 2 if doc_pending_ratio > 0.3 else 0,
        "approval_age_days": 45 if doc_pending_ratio > 0.3 else 10,
        "objection_count": int(objection_cnt),
        "ownership_conflict_count": int(ownership_conflicts),
        "court_stay_flag": int(court_stay),
        "legal_issue_count": int(legal_issues),
        "stakeholder_response_days": int(stakeholder_response_days),
        "department_responsiveness_score": float(responsiveness_score),
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

    # 1. R&R Progress
    rr_pct = features.get("rr_progress_pct", 100.0)
    rr_pending = features.get("rr_pending_cases", 0)
    if rr_pct < 50.0:
        factors.append({
            "feature_name": "rr_progress_pct",
            "feature_label": "R&R Resettlement Lag",
            "value_display": f"{rr_pct:.0f}% R&R complete ({rr_pending} families pending)",
            "contribution": round(0.25 * (1.0 - (rr_pct / 100.0)), 3),
            "direction": "up",
            "impact_text": f"Rehabilitation & Resettlement (R&R) lagging behind schedule; {rr_pending} project-affected families await physical resettlement."
        })

    # 2. Stage Duration Bottleneck
    stage_age = features.get("stage_age_days", 0)
    if stage_age >= 45:
        factors.append({
            "feature_name": "stage_age_days",
            "feature_label": "Prolonged Stage Duration",
            "value_display": f"{stage_age} days in current stage",
            "contribution": round(min(0.35, stage_age / 150.0), 3),
            "direction": "up",
            "impact_text": f"Project has spent {stage_age} days in current stage without statutory clearance, exceeding benchmark."
        })

    # 3. Compensation Disbursement
    comp_ratio = features.get("compensation_paid_ratio", 0.0)
    if comp_ratio < 0.60:
        factors.append({
            "feature_name": "compensation_paid_ratio",
            "feature_label": "Compensation Disbursement Gap",
            "value_display": f"{int(comp_ratio * 100)}% compensation disbursed",
            "contribution": round(0.28 * (1.0 - comp_ratio), 3),
            "direction": "up",
            "impact_text": f"Only {int(comp_ratio * 100)}% of award compensation disbursed; creates landowner resistance during physical handover."
        })

    # 4. Stakeholder / Inter-Departmental Responsiveness
    resp_score = features.get("department_responsiveness_score", 0.8)
    resp_days = features.get("stakeholder_response_days", 30)
    if resp_score < 0.60:
        factors.append({
            "feature_name": "stakeholder_response_days",
            "feature_label": "Sluggish Inter-Dept Clearances",
            "value_display": f"{resp_days} days avg response time",
            "contribution": round(0.20 * (1.0 - resp_score), 3),
            "direction": "up",
            "impact_text": f"Collaborating line departments (Forest/Utilities/PWD) taking average {resp_days} days to respond to statutory requisitions."
        })

    # 5. Objections & Legal Injunction
    court_stay = features.get("court_stay_flag", 0)
    objection_cnt = features.get("objection_count", 0)
    conflicts = features.get("ownership_conflict_count", 0)
    if court_stay:
        factors.append({
            "feature_name": "court_stay_flag",
            "feature_label": "High Court Injunction / Stay",
            "value_display": "Active Legal Injunction",
            "contribution": 0.32,
            "direction": "up",
            "impact_text": "Judicial stay order active; physically halts land possession under Section 19/20."
        })
    elif conflicts >= 3:
        factors.append({
            "feature_name": "ownership_conflict_count",
            "feature_label": "Land Parcel Title Disputes",
            "value_display": f"{conflicts} disputed title parcels",
            "contribution": 0.22,
            "direction": "up",
            "impact_text": f"{conflicts} revenue land parcels have competing ownership claims pending civil court mutation adjudication."
        })
    elif objection_cnt >= 3:
        factors.append({
            "feature_name": "objection_count",
            "feature_label": "Unresolved Landowner Objections",
            "value_display": f"{objection_cnt} Section 15 objections",
            "contribution": round(min(0.25, objection_cnt * 0.06), 3),
            "direction": "up",
            "impact_text": f"{objection_cnt} public objections pending hearing before the Collector."
        })

    # 6. Pending Documents
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

    factors.sort(key=lambda x: abs(x["contribution"]), reverse=True)
    return factors[:5]


def generate_predictive_recommendations(features: Dict[str, Any], prob: float) -> List[Dict[str, Any]]:
    recommendations = []

    # Recommendation 1: Compensation
    comp_ratio = features.get("compensation_paid_ratio", 0.0)
    if comp_ratio < 0.70:
        recommendations.append({
            "title": "Convene Direct Bank Transfer (DBT) Compensation Settlement Drive",
            "category": "Compensation",
            "urgency": "CRITICAL" if comp_ratio < 0.40 else "HIGH",
            "expected_risk_reduction_pct": 24.0,
            "action_steps": "1. Deploy special camp at Sub-Divisional Magistrate office. 2. Verify Aadhaar/Bank account seeds with Revenue records. 3. Authorize batch PFMS disbursement to clear remaining award balance."
        })

    # Recommendation 2: R&R Resettlement
    rr_pct = features.get("rr_progress_pct", 100.0)
    if rr_pct < 60.0:
        recommendations.append({
            "title": "Prioritize Resettlement Colony Allotment & Gram Sabha Consultation",
            "category": "R&R",
            "urgency": "CRITICAL" if rr_pct < 35.0 else "HIGH",
            "expected_risk_reduction_pct": 28.0,
            "action_steps": "1. Finalize basic civic amenities (water, electricity, access roads) at designated R&R site. 2. Hold structured consultation with affected family heads under Section 31 LARR 2013."
        })

    # Recommendation 3: Legal & Objections
    if features.get("court_stay_flag", 0):
        recommendations.append({
            "title": "File Urgent Vacation of Stay Application in High Court",
            "category": "Legal",
            "urgency": "CRITICAL",
            "expected_risk_reduction_pct": 32.0,
            "action_steps": "1. Engage Government Pleader to file counter-affidavit demonstrating public purpose under Section 19. 2. Deposit disputed compensation in court registry to vacate interim status quo."
        })
    elif features.get("objection_count", 0) >= 3 or features.get("ownership_conflict_count", 0) >= 2:
        recommendations.append({
            "title": "Organize Special Land Acquisition Lok Adalat for Dispute Disposal",
            "category": "Legal",
            "urgency": "HIGH",
            "expected_risk_reduction_pct": 18.0,
            "action_steps": "1. Partner with District Legal Services Authority (DLSA). 2. Resolve intra-family title partition disputes on spot to enable mutation clearance."
        })

    # Recommendation 4: Inter-Departmental Clearance
    if features.get("department_responsiveness_score", 0.8) < 0.60 or features.get("utility_shift_pending", 0) or features.get("forest_clearance_pending", 0):
        recommendations.append({
            "title": "Issue Joint Secretary Level Inter-Departmental Escalation",
            "category": "Inter-Dept",
            "urgency": "HIGH",
            "expected_risk_reduction_pct": 15.0,
            "action_steps": "1. Convene State-Level Empowered Committee meeting (Forest, MSEDCL/Power Grid, PWD). 2. Fast-track Stage-II forest compliance and utility relocation agreement."
        })

    # Recommendation 5: Stage Bottleneck
    if features.get("stage_age_days", 0) >= 60:
        recommendations.append({
            "title": "Deploy Additional Joint Measurement Survey Taskforce",
            "category": "Documentation",
            "urgency": "MEDIUM",
            "expected_risk_reduction_pct": 12.0,
            "action_steps": "1. Augment field revenue inspectors with DGPS/Drone mapping team. 2. Establish 14-day deadline to publish pending Section 19 declaration."
        })

    return recommendations[:4]


def predict_project_risk(project) -> Tuple[float, str, int, List[Dict[str, Any]], List[Dict[str, Any]]]:
    cls_model, reg_model = get_models()
    features = extract_features_from_project(project)
    
    df = pd.DataFrame([features])
    proba = float(cls_model.predict_proba(df)[0, 1])
    risk_level = determine_risk_level(proba)
    
    if reg_model and proba >= 0.40:
        try:
            delay_days = max(10, int(reg_model.predict(df)[0]))
        except Exception:
            stage_age = features.get("stage_age_days", 20)
            objections = features.get("objection_count", 0)
            delay_days = int(max(10, (proba * 85) + (stage_age * 0.3) + (objections * 8)))
    elif proba >= 0.40:
        stage_age = features.get("stage_age_days", 20)
        objections = features.get("objection_count", 0)
        delay_days = int(max(10, (proba * 85) + (stage_age * 0.3) + (objections * 8)))
    else:
        delay_days = 0

    explanations = generate_explanations(features, proba)
    recommendations = generate_predictive_recommendations(features, proba)
    
    return proba, risk_level, delay_days, explanations, recommendations


def simulate_what_if(project, simulation_overrides: Dict[str, Any]) -> Dict[str, Any]:
    cls_model, _ = get_models()
    features = extract_features_from_project(project)

    base_df = pd.DataFrame([features])
    base_proba = float(cls_model.predict_proba(base_df)[0, 1])
    base_risk = determine_risk_level(base_proba)

    sim_features = features.copy()
    for key, value in simulation_overrides.items():
        if value is not None:
            if key == "compensation_paid_ratio":
                sim_features["compensation_paid_ratio"] = float(value)
                sim_features["overall_progress_pct"] = min(98.0, sim_features["overall_progress_pct"] + (value * 20))
                sim_features["progress_gap"] = max(0.0, sim_features["progress_gap"] - (value * 15))
            elif key == "rr_progress_pct":
                sim_features["rr_progress_pct"] = float(value)
                sim_features["rr_pending_cases"] = int((1.0 - (value / 100.0)) * sim_features["household_count"])
            elif key == "pending_document_count":
                sim_features["pending_document_count"] = int(value)
                total_docs = len(project.documents) if project.documents else 10
                sim_features["document_pending_ratio"] = round(value / max(1, total_docs), 3)
            elif key == "objection_count":
                sim_features["objection_count"] = int(value)
                sim_features["legal_issue_count"] = int(value) + (3 if sim_features["court_stay_flag"] else 0)
            elif key == "court_stay_flag":
                sim_features["court_stay_flag"] = 1 if value else 0
            elif key in sim_features:
                sim_features[key] = int(value) if isinstance(value, bool) else value

    sim_df = pd.DataFrame([sim_features])
    sim_proba = float(cls_model.predict_proba(sim_df)[0, 1])
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
