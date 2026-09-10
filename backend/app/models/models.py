"""
SQLAlchemy ORM Data Models for SIH26017 Land Acquisition Analytics.
Includes Projects, LARR Stages, Documents, Compensation,
Rehabilitation & Resettlement (R&R), Land Possession, Stakeholders,
AI Recommendations, Predictions, Alerts, Actions, and Security Audit Logs.
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, Date, DateTime, Boolean, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from backend.app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # admin, officer, district, director, analyst
    designation = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    project_type = Column(String(100), nullable=False)
    priority = Column(String(50), default="Normal")
    land_area_hectares = Column(Float, nullable=False, default=0.0)
    affected_owner_count = Column(Integer, nullable=False, default=0)
    household_count = Column(Integer, nullable=False, default=0)
    project_value_cr = Column(Float, nullable=False, default=0.0)
    compensation_offered_cr = Column(Float, nullable=False, default=0.0)
    compensation_paid_cr = Column(Float, nullable=False, default=0.0)
    
    start_date = Column(Date, nullable=False)
    target_date = Column(Date, nullable=False)
    status = Column(String(50), default="In Progress")
    current_stage = Column(String(100), default="Stage 1: Preliminary Survey & SIA")
    overall_progress_pct = Column(Float, default=0.0)
    
    # Process friction attributes
    objection_count = Column(Integer, default=0)
    ownership_conflict_count = Column(Integer, default=0)
    court_stay_flag = Column(Boolean, default=False)
    utility_shift_pending = Column(Boolean, default=False)
    forest_clearance_pending = Column(Boolean, default=False)
    railway_crossing_pending = Column(Boolean, default=False)
    district_delay_rate = Column(Float, default=0.25)
    past_delay_count = Column(Integer, default=0)

    # Land classification & jurisdiction
    land_category = Column(String(100), nullable=True)              # e.g. Private Agricultural, Government Wasteland
    notification_stage = Column(String(100), nullable=True)         # e.g. Pre-Notification, Section 11, Section 19
    multi_village_jurisdiction = Column(Boolean, default=False)     # Spans multiple villages/talukas

    # Legal & dispute flags
    ownership_title_dispute = Column(Boolean, default=False)        # Title / heirship dispute pending
    court_litigation_pending = Column(Boolean, default=False)       # LARR Section 64 court litigation
    public_objections_filed = Column(Boolean, default=False)        # Formal objections filed under Sec 15

    # Acquisition progress metrics
    days_elapsed_since_notification = Column(Integer, default=0)    # Calendar days since first notification
    land_notified_pct = Column(Float, default=0.0)                  # % of total area under notification
    award_declared_pct = Column(Float, default=0.0)                 # % area for which award is declared
    compensation_disbursed_pct = Column(Float, default=0.0)         # % compensation amount disbursed
    physical_possession_pct = Column(Float, default=0.0)            # % land physically handed over

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    stages = relationship("Stage", back_populates="project", cascade="all, delete-orphan", order_by="Stage.stage_order")
    documents = relationship("Document", back_populates="project", cascade="all, delete-orphan")
    compensations = relationship("Compensation", back_populates="project", cascade="all, delete-orphan")
    rehabilitations = relationship("Rehabilitation", back_populates="project", cascade="all, delete-orphan")
    possessions = relationship("Possession", back_populates="project", cascade="all, delete-orphan")
    stakeholders = relationship("Stakeholder", back_populates="project", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="project", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="project", cascade="all, delete-orphan", order_by="desc(Prediction.created_at)")
    alerts = relationship("Alert", back_populates="project", cascade="all, delete-orphan", order_by="desc(Alert.created_at)")
    actions = relationship("Action", back_populates="project", cascade="all, delete-orphan", order_by="desc(Action.created_at)")


class Stage(Base):
    __tablename__ = "stages"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    stage_order = Column(Integer, nullable=False)
    stage_name = Column(String(150), nullable=False)
    start_date = Column(Date, nullable=True)
    target_date = Column(Date, nullable=True)
    completion_date = Column(Date, nullable=True)
    status = Column(String(50), default="Pending")
    days_in_stage = Column(Integer, default=0)
    remarks = Column(Text, nullable=True)

    project = relationship("Project", back_populates="stages")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    document_type = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    status = Column(String(50), default="Pending")
    remarks = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="documents")


class Compensation(Base):
    __tablename__ = "compensation"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    beneficiary_count = Column(Integer, default=0)
    total_amount_cr = Column(Float, default=0.0)
    disbursed_amount_cr = Column(Float, default=0.0)
    pending_amount_cr = Column(Float, default=0.0)
    disbursement_pct = Column(Float, default=0.0)
    status = Column(String(50), default="In Progress")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="compensations")


# 🌟 Rehabilitation & Resettlement (R&R)
class Rehabilitation(Base):
    __tablename__ = "rehabilitation"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    total_families = Column(Integer, default=0)
    families_rehabilitated = Column(Integer, default=0)
    pending_cases = Column(Integer, default=0)
    progress_pct = Column(Float, default=0.0)
    status = Column(String(50), default="Initiated")
    resettlement_site_status = Column(String(100), default="Site Identification Underway")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="rehabilitations")


# 🌟 Land Possession & Cadastral Parcels
class Possession(Base):
    __tablename__ = "possession"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    total_parcels = Column(Integer, default=0)
    acquired_parcels = Column(Integer, default=0)
    pending_parcels = Column(Integer, default=0)
    disputed_parcels = Column(Integer, default=0)
    possession_status = Column(String(50), default="Pending")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="possessions")


# 🌟 Inter-Departmental Collaborating Line Departments (Stakeholders)
class Stakeholder(Base):
    __tablename__ = "stakeholders"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    department_name = Column(String(100), nullable=False)
    pending_actions = Column(Integer, default=0)
    avg_response_days = Column(Integer, default=30)
    responsiveness_score = Column(Float, default=0.8)
    last_interaction = Column(Date, nullable=True)

    project = relationship("Project", back_populates="stakeholders")


# 🌟 AI Predictive Recommendations Engine
class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(200), nullable=False)
    category = Column(String(50), default="Administrative")
    urgency = Column(String(20), default="HIGH")
    expected_risk_reduction_pct = Column(Float, default=0.0)
    action_steps = Column(Text, nullable=False)
    status = Column(String(30), default="SUGGESTED")
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="recommendations")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    probability = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)
    estimated_delay_days = Column(Integer, default=0)
    model_version = Column(String(50), default="xgb-v1.2.0")
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="predictions")
    explanations = relationship("Explanation", back_populates="prediction", cascade="all, delete-orphan")


class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False)
    feature_name = Column(String(100), nullable=False)
    feature_label = Column(String(150), nullable=False)
    value_display = Column(String(100), nullable=True)
    contribution = Column(Float, default=0.0)
    direction = Column(String(10), default="up")
    impact_text = Column(Text, nullable=True)

    prediction = relationship("Prediction", back_populates="explanations")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    severity = Column(String(30), default="HIGH")
    alert_type = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(30), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="alerts")


class Action(Base):
    __tablename__ = "actions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    action_type = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    assigned_to = Column(String(100), nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String(50), default="OPEN")
    outcome = Column(Text, nullable=True)
    initial_risk = Column(Float, nullable=True)
    post_action_risk = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="actions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(120), nullable=False)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
