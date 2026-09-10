"""
Pydantic Schemas for SIH26017 Request/Response Validation.
Includes R&R, Possession, Stakeholders, Recommendations, and Model Retrain schemas.
"""

from datetime import date, datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field


# ---------------- User & Auth ----------------
class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    designation: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# ---------------- Stages & Documents ----------------
class StageOut(BaseModel):
    id: int
    stage_order: int
    stage_name: str
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    completion_date: Optional[date] = None
    status: str
    days_in_stage: int
    remarks: Optional[str] = None

    class Config:
        from_attributes = True

class StageUpdate(BaseModel):
    status: Optional[str] = None
    days_in_stage: Optional[int] = None
    completion_date: Optional[date] = None
    remarks: Optional[str] = None

class DocumentOut(BaseModel):
    id: int
    document_type: str
    title: str
    status: str
    remarks: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

class DocumentCreate(BaseModel):
    document_type: str
    title: str
    status: str = "Pending"
    remarks: Optional[str] = None


# ---------------- Compensation ----------------
class CompensationOut(BaseModel):
    id: int
    beneficiary_count: int
    total_amount_cr: float
    disbursed_amount_cr: float
    pending_amount_cr: float
    disbursement_pct: float
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True

class CompensationUpdate(BaseModel):
    disbursed_amount_cr: float
    beneficiary_count: Optional[int] = None
    status: Optional[str] = None


# 🌟 Rehabilitation & Resettlement Schemas
class RehabilitationOut(BaseModel):
    id: int
    project_id: int
    total_families: int
    families_rehabilitated: int
    pending_cases: int
    progress_pct: float
    status: str
    resettlement_site_status: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class RehabilitationUpdate(BaseModel):
    families_rehabilitated: int
    status: Optional[str] = None
    resettlement_site_status: Optional[str] = None


# 🌟 Possession & Land Parcels Schemas
class PossessionOut(BaseModel):
    id: int
    project_id: int
    total_parcels: int
    acquired_parcels: int
    pending_parcels: int
    disputed_parcels: int
    possession_status: str
    updated_at: datetime

    class Config:
        from_attributes = True

class PossessionUpdate(BaseModel):
    acquired_parcels: int
    disputed_parcels: Optional[int] = None
    possession_status: Optional[str] = None


# 🌟 Stakeholder Responsiveness Schemas
class StakeholderOut(BaseModel):
    id: int
    project_id: int
    department_name: str
    pending_actions: int
    avg_response_days: int
    responsiveness_score: float
    last_interaction: Optional[date] = None

    class Config:
        from_attributes = True

class StakeholderCreate(BaseModel):
    department_name: str
    pending_actions: int = 1
    avg_response_days: int = 30
    responsiveness_score: float = 0.7


# 🌟 AI Predictive Recommendations Schemas
class RecommendationOut(BaseModel):
    id: int
    project_id: int
    title: str
    category: str
    urgency: str
    expected_risk_reduction_pct: float
    action_steps: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class RecommendationAdoptRequest(BaseModel):
    assigned_to: str
    due_date: date


# ---------------- Predictions & Explanations ----------------
class ExplanationOut(BaseModel):
    id: Optional[int] = None
    feature_name: str
    feature_label: str
    value_display: Optional[str] = None
    contribution: float
    direction: str
    impact_text: Optional[str] = None

    class Config:
        from_attributes = True

class PredictionOut(BaseModel):
    id: Optional[int] = None
    project_id: int
    probability: float
    risk_level: str
    estimated_delay_days: int
    model_version: str
    created_at: Optional[datetime] = None
    top_factors: List[ExplanationOut] = []
    recommendations: List[RecommendationOut] = []

    class Config:
        from_attributes = True

class PredictionRequest(BaseModel):
    force_refresh: bool = False

class SimulationRequest(BaseModel):
    compensation_paid_ratio: Optional[float] = Field(None, ge=0.0, le=1.0)
    rr_progress_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    pending_document_count: Optional[int] = Field(None, ge=0)
    objection_count: Optional[int] = Field(None, ge=0)
    ownership_conflict_count: Optional[int] = Field(None, ge=0)
    court_stay_flag: Optional[bool] = None
    stage_age_days: Optional[int] = Field(None, ge=0)
    department_responsiveness_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    utility_shift_pending: Optional[bool] = None
    forest_clearance_pending: Optional[bool] = None

class SimulationOut(BaseModel):
    original_probability: float
    original_risk_level: str
    simulated_probability: float
    simulated_risk_level: str
    probability_delta: float
    risk_direction: str
    simulated_factors: List[ExplanationOut]


# ---------------- Alerts & Actions ----------------
class AlertOut(BaseModel):
    id: int
    project_id: int
    project_title: Optional[str] = None
    project_code: Optional[str] = None
    severity: str
    alert_type: str
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ActionCreate(BaseModel):
    action_type: str
    title: str
    description: Optional[str] = None
    assigned_to: str
    due_date: date

class ActionUpdate(BaseModel):
    status: Optional[str] = None
    outcome: Optional[str] = None
    post_action_risk: Optional[float] = None

class ActionOut(BaseModel):
    id: int
    project_id: int
    action_type: str
    title: str
    description: Optional[str] = None
    assigned_to: str
    due_date: date
    status: str
    outcome: Optional[str] = None
    initial_risk: Optional[float] = None
    post_action_risk: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------------- Projects ----------------
class ProjectCreate(BaseModel):
    project_code: str
    title: str
    state: str
    district: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    project_type: str
    priority: str = "Normal"
    land_area_hectares: float
    affected_owner_count: int
    household_count: int
    project_value_cr: float
    compensation_offered_cr: float
    start_date: date
    target_date: date
    current_stage: str = "Stage 1: Preliminary Survey & SIA"
    objection_count: int = 0
    ownership_conflict_count: int = 0
    court_stay_flag: bool = False
    utility_shift_pending: bool = False
    forest_clearance_pending: bool = False
    railway_crossing_pending: bool = False
    # Land classification & jurisdiction
    land_category: Optional[str] = None
    notification_stage: Optional[str] = None
    multi_village_jurisdiction: bool = False
    # Legal & dispute flags
    ownership_title_dispute: bool = False
    court_litigation_pending: bool = False
    public_objections_filed: bool = False
    # Acquisition progress metrics
    days_elapsed_since_notification: int = 0
    land_notified_pct: float = Field(0.0, ge=0.0, le=100.0)
    award_declared_pct: float = Field(0.0, ge=0.0, le=100.0)
    compensation_disbursed_pct: float = Field(0.0, ge=0.0, le=100.0)
    physical_possession_pct: float = Field(0.0, ge=0.0, le=100.0)

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[str] = None
    current_stage: Optional[str] = None
    status: Optional[str] = None
    overall_progress_pct: Optional[float] = None
    compensation_paid_cr: Optional[float] = None
    objection_count: Optional[int] = None
    ownership_conflict_count: Optional[int] = None
    court_stay_flag: Optional[bool] = None
    utility_shift_pending: Optional[bool] = None
    forest_clearance_pending: Optional[bool] = None
    railway_crossing_pending: Optional[bool] = None
    # Land classification & jurisdiction
    land_category: Optional[str] = None
    notification_stage: Optional[str] = None
    multi_village_jurisdiction: Optional[bool] = None
    # Legal & dispute flags
    ownership_title_dispute: Optional[bool] = None
    court_litigation_pending: Optional[bool] = None
    public_objections_filed: Optional[bool] = None
    # Acquisition progress metrics
    days_elapsed_since_notification: Optional[int] = None
    land_notified_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    award_declared_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    compensation_disbursed_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    physical_possession_pct: Optional[float] = Field(None, ge=0.0, le=100.0)

class ProjectOut(BaseModel):
    id: int
    project_code: str
    title: str
    state: str
    district: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    project_type: str
    priority: str
    land_area_hectares: float
    affected_owner_count: int
    project_value_cr: float
    compensation_offered_cr: float
    compensation_paid_cr: float
    start_date: date
    target_date: date
    status: str
    current_stage: str
    overall_progress_pct: float
    objection_count: int
    court_stay_flag: bool
    # Land classification & jurisdiction
    land_category: Optional[str] = None
    notification_stage: Optional[str] = None
    multi_village_jurisdiction: bool = False
    # Legal & dispute flags
    ownership_title_dispute: bool = False
    court_litigation_pending: bool = False
    public_objections_filed: bool = False
    # Acquisition progress metrics
    days_elapsed_since_notification: int = 0
    land_notified_pct: float = 0.0
    award_declared_pct: float = 0.0
    compensation_disbursed_pct: float = 0.0
    physical_possession_pct: float = 0.0
    latest_prediction: Optional[PredictionOut] = None

    class Config:
        from_attributes = True

class ProjectDetailOut(ProjectOut):
    stages: List[StageOut] = []
    documents: List[DocumentOut] = []
    compensations: List[CompensationOut] = []
    rehabilitations: List[RehabilitationOut] = []
    possessions: List[PossessionOut] = []
    stakeholders: List[StakeholderOut] = []
    recommendations: List[RecommendationOut] = []
    alerts: List[AlertOut] = []
    actions: List[ActionOut] = []


# ---------------- Dashboard & Analytics ----------------
class DashboardSummaryOut(BaseModel):
    total_projects: int
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    critical_risk_count: int
    delayed_count: int
    avg_delay_probability: float
    avg_estimated_delay_days: float
    active_alerts_count: int
    pending_actions_count: int
    total_land_area_ha: float
    total_compensation_cr: float
    national_rr_progress_pct: float
    active_recommendations_count: int

class GeoRiskPointOut(BaseModel):
    id: int
    project_code: str
    title: str
    state: str
    district: str
    latitude: float
    longitude: float
    project_type: str
    probability: float
    risk_level: str
    current_stage: str
    progress_pct: float

class AuditLogOut(BaseModel):
    id: int
    user_email: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
