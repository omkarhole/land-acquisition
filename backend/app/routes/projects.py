"""
Projects & Land Acquisition Management Router for SIH26017.
"""

from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from backend.app.database import get_db
from backend.app.models.models import (
    Project, Stage, Document, Compensation, Prediction, Explanation, Alert, Action, AuditLog, User
)
from backend.app.schemas.schemas import (
    ProjectOut, ProjectDetailOut, ProjectCreate, ProjectUpdate,
    PredictionOut, PredictionRequest, SimulationRequest, SimulationOut,
    DocumentCreate, DocumentOut, StageUpdate, StageOut, CompensationUpdate, CompensationOut
)
from backend.app.services.auth_service import get_current_user
from backend.app.services.ml_service import predict_project_risk, simulate_what_if, determine_risk_level

router = APIRouter(prefix="/api/projects", tags=["Projects"])

STANDARD_STAGES = [
    (1, "Stage 1: Preliminary Survey & SIA", 45),
    (2, "Stage 2: Section 11 Notification", 60),
    (3, "Stage 3: Section 15 Hearing & Objections", 60),
    (4, "Stage 4: Section 19 Declaration", 90),
    (5, "Stage 5: Valuation & Compensation Award", 90),
    (6, "Stage 6: Land Possession & Handover", 60)
]

STANDARD_DOCS = [
    ("SIA_REPORT", "Social Impact Assessment (SIA) Final Report"),
    ("SEC11_GAZETTE", "Section 11 Preliminary Gazette Notification"),
    ("TITLE_VERIFICATION", "Revenue Records & Land Title Verification Dossier"),
    ("SEC15_HEARING_REPORT", "Collectorate Section 15 Objections Hearing Summary"),
    ("SEC19_DECLARATION", "Section 19 Declaration of Land Acquisition"),
    ("COMPENSATION_AWARD", "Joint Measurement & Compensation Award Statement"),
    ("FOREST_NOC", "MoEFCC Forest Diversion Stage-II Clearance (if applicable)"),
    ("UTILITY_SHIFT_PLAN", "Utility Shifting Estimation & Approval Agreement")
]


@router.get("", response_model=List[ProjectOut])
def list_projects(
    search: Optional[str] = Query(None, description="Search by title or project code"),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    project_type: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(Project)

    if search:
        term = f"%{search}%"
        query = query.filter(or_(Project.title.ilike(term), Project.project_code.ilike(term)))
    if state:
        query = query.filter(Project.state == state)
    if district:
        query = query.filter(Project.district == district)
    if project_type:
        query = query.filter(Project.project_type == project_type)
    if status_filter:
        query = query.filter(Project.status == status_filter)

    projects = query.order_by(desc(Project.created_at)).all()

    # Attach latest prediction to output
    results = []
    for p in projects:
        p_dict = ProjectOut.model_validate(p)
        if p.predictions:
            latest_pred = p.predictions[0]
            p_dict.latest_prediction = PredictionOut.model_validate(latest_pred)
            p_dict.latest_prediction.top_factors = [
                Explanation.model_validate(e) if hasattr(Explanation, "model_validate") else e
                for e in latest_pred.explanations
            ]
        
        # Risk level filter if requested
        if risk_level:
            if not p.predictions or p.predictions[0].risk_level.upper() != risk_level.upper():
                continue
        results.append(p_dict)

    return results


@router.post("", response_model=ProjectDetailOut, status_code=status.HTTP_201_CREATED)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check duplicate code
    existing = db.query(Project).filter(Project.project_code == data.project_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Project code already exists.")

    project = Project(
        project_code=data.project_code,
        title=data.title,
        state=data.state,
        district=data.district,
        latitude=data.latitude or 18.5204,
        longitude=data.longitude or 73.8567,
        project_type=data.project_type,
        priority=data.priority,
        land_area_hectares=data.land_area_hectares,
        affected_owner_count=data.affected_owner_count,
        household_count=data.household_count,
        project_value_cr=data.project_value_cr,
        compensation_offered_cr=data.compensation_offered_cr,
        compensation_paid_cr=0.0,
        start_date=data.start_date,
        target_date=data.target_date,
        status="In Progress",
        current_stage=data.current_stage,
        overall_progress_pct=10.0,
        objection_count=data.objection_count,
        court_stay_flag=data.court_stay_flag,
        utility_shift_pending=data.utility_shift_pending,
        forest_clearance_pending=data.forest_clearance_pending,
        railway_crossing_pending=data.railway_crossing_pending,
        district_delay_rate=0.28,
        past_delay_count=1
    )
    db.add(project)
    db.flush()

    # Create standard 6 stages
    for order, stage_name, duration in STANDARD_STAGES:
        stage_status = "In Progress" if order == 1 else "Pending"
        st = Stage(
            project_id=project.id,
            stage_order=order,
            stage_name=stage_name,
            start_date=data.start_date if order == 1 else None,
            status=stage_status,
            days_in_stage=15 if order == 1 else 0
        )
        db.add(st)

    # Create standard documents
    for doc_type, doc_title in STANDARD_DOCS:
        doc = Document(
            project_id=project.id,
            document_type=doc_type,
            title=doc_title,
            status="Pending"
        )
        db.add(doc)

    # Create initial compensation record
    comp = Compensation(
        project_id=project.id,
        beneficiary_count=data.affected_owner_count,
        total_amount_cr=data.compensation_offered_cr,
        disbursed_amount_cr=0.0,
        pending_amount_cr=data.compensation_offered_cr,
        disbursement_pct=0.0,
        status="Initiated"
    )
    db.add(comp)
    db.flush()

    # Run initial prediction
    prob, risk_level, delay_days, explanations = predict_project_risk(project)
    pred = Prediction(
        project_id=project.id,
        probability=prob,
        risk_level=risk_level,
        estimated_delay_days=delay_days,
        model_version="xgb-v1.0.0"
    )
    db.add(pred)
    db.flush()

    for exp in explanations:
        expl = Explanation(
            prediction_id=pred.id,
            feature_name=exp["feature_name"],
            feature_label=exp["feature_label"],
            value_display=exp.get("value_display", ""),
            contribution=exp["contribution"],
            direction=exp["direction"],
            impact_text=exp.get("impact_text", "")
        )
        db.add(expl)

    # Generate alert if high risk
    if prob >= 0.70:
        alert = Alert(
            project_id=project.id,
            severity="CRITICAL" if prob >= 0.85 else "HIGH",
            alert_type="EARLY_WARNING_DELAY_RISK",
            message=f"New project {project.project_code} initialized with elevated delay risk ({int(prob*100)}%). Action plan recommended.",
            status="ACTIVE"
        )
        db.add(alert)

    # Audit log
    audit = AuditLog(
        user_email=current_user.email,
        action="CREATE_PROJECT",
        entity_type="Project",
        entity_id=str(project.id),
        details=f"Created project {project.project_code} - {project.title}"
    )
    db.add(audit)
    db.commit()
    db.refresh(project)

    return get_project_detail(project.id, db)


@router.get("/{project_id}", response_model=ProjectDetailOut)
def get_project_detail(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    detail = ProjectDetailOut.model_validate(project)
    detail.stages = [StageOut.model_validate(s) for s in project.stages]
    detail.documents = [DocumentOut.model_validate(d) for d in project.documents]
    detail.compensations = [CompensationOut.model_validate(c) for c in project.compensations]
    detail.alerts = [
        {
            "id": a.id,
            "project_id": a.project_id,
            "project_title": project.title,
            "project_code": project.project_code,
            "severity": a.severity,
            "alert_type": a.alert_type,
            "message": a.message,
            "status": a.status,
            "created_at": a.created_at
        }
        for a in project.alerts
    ]
    detail.actions = [a for a in project.actions]

    if project.predictions:
        latest = project.predictions[0]
        pred_out = PredictionOut(
            id=latest.id,
            project_id=latest.project_id,
            probability=latest.probability,
            risk_level=latest.risk_level,
            estimated_delay_days=latest.estimated_delay_days,
            model_version=latest.model_version,
            created_at=latest.created_at,
            top_factors=[
                {
                    "id": exp.id,
                    "feature_name": exp.feature_name,
                    "feature_label": exp.feature_label,
                    "value_display": exp.value_display,
                    "contribution": exp.contribution,
                    "direction": exp.direction,
                    "impact_text": exp.impact_text
                }
                for exp in latest.explanations
            ]
        )
        detail.latest_prediction = pred_out

    return detail


@router.patch("/{project_id}", response_model=ProjectDetailOut)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_dict = data.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(project, k, v)

    # Log audit
    audit = AuditLog(
        user_email=current_user.email,
        action="UPDATE_PROJECT",
        entity_type="Project",
        entity_id=str(project.id),
        details=f"Updated fields: {', '.join(update_dict.keys())}"
    )
    db.add(audit)
    db.commit()
    db.refresh(project)

    return get_project_detail(project.id, db)


@router.post("/{project_id}/predict", response_model=PredictionOut)
def run_prediction(
    project_id: int,
    req: PredictionRequest = PredictionRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    prob, risk_level, delay_days, explanations = predict_project_risk(project)

    # Save prediction
    pred = Prediction(
        project_id=project.id,
        probability=round(prob, 3),
        risk_level=risk_level,
        estimated_delay_days=delay_days,
        model_version="xgb-v1.0.0"
    )
    db.add(pred)
    db.flush()

    for exp in explanations:
        expl = Explanation(
            prediction_id=pred.id,
            feature_name=exp["feature_name"],
            feature_label=exp["feature_label"],
            value_display=exp.get("value_display", ""),
            contribution=exp["contribution"],
            direction=exp["direction"],
            impact_text=exp.get("impact_text", "")
        )
        db.add(expl)

    # Generate alert if elevated
    if prob >= 0.70:
        alert = Alert(
            project_id=project.id,
            severity="CRITICAL" if prob >= 0.85 else "HIGH",
            alert_type="HIGH_DELAY_PROBABILITY",
            message=f"Predictive model flagged project {project.project_code} with {risk_level} risk ({int(prob*100)}% delay probability).",
            status="ACTIVE"
        )
        db.add(alert)

    # Audit log
    audit = AuditLog(
        user_email=current_user.email,
        action="RUN_PREDICTION",
        entity_type="Prediction",
        entity_id=str(pred.id),
        details=f"Evaluated ML prediction for project {project.project_code}: {risk_level} ({prob:.2f})"
    )
    db.add(audit)
    db.commit()

    return {
        "id": pred.id,
        "project_id": pred.project_id,
        "probability": pred.probability,
        "risk_level": pred.risk_level,
        "estimated_delay_days": pred.estimated_delay_days,
        "model_version": pred.model_version,
        "created_at": pred.created_at,
        "top_factors": explanations
    }


@router.post("/{project_id}/simulate", response_model=SimulationOut)
def simulate_scenario(
    project_id: int,
    req: SimulationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    overrides = req.model_dump(exclude_unset=True)
    sim_result = simulate_what_if(project, overrides)
    return sim_result


@router.post("/{project_id}/documents", response_model=DocumentOut)
def add_document(
    project_id: int,
    data: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    doc = Document(
        project_id=project.id,
        document_type=data.document_type,
        title=data.title,
        status=data.status,
        remarks=data.remarks
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.patch("/{project_id}/documents/{doc_id}/approve", response_model=DocumentOut)
def approve_document(
    project_id: int,
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == doc_id, Document.project_id == project_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.status = "Approved"
    doc.remarks = f"Approved by {current_user.name} ({current_user.role})"
    db.commit()
    db.refresh(doc)
    return doc


@router.patch("/{project_id}/stages/{stage_id}", response_model=StageOut)
def update_stage(
    project_id: int,
    stage_id: int,
    data: StageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stage = db.query(Stage).filter(Stage.id == stage_id, Stage.project_id == project_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")

    if data.status is not None:
        stage.status = data.status
        if data.status == "Completed":
            stage.completion_date = data.completion_date or date.today()
    if data.days_in_stage is not None:
        stage.days_in_stage = data.days_in_stage
    if data.remarks is not None:
        stage.remarks = data.remarks

    db.commit()
    db.refresh(stage)
    return stage


@router.patch("/{project_id}/compensation", response_model=CompensationOut)
def update_compensation(
    project_id: int,
    data: CompensationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    comp = db.query(Compensation).filter(Compensation.project_id == project_id).first()
    if not comp:
        comp = Compensation(
            project_id=project.id,
            total_amount_cr=project.compensation_offered_cr,
            disbursed_amount_cr=0.0,
            pending_amount_cr=project.compensation_offered_cr,
            disbursement_pct=0.0
        )
        db.add(comp)
        db.flush()

    comp.disbursed_amount_cr = data.disbursed_amount_cr
    comp.pending_amount_cr = max(0.0, comp.total_amount_cr - data.disbursed_amount_cr)
    comp.disbursement_pct = round(min(100.0, (comp.disbursed_amount_cr / max(0.01, comp.total_amount_cr)) * 100.0), 1)
    if data.beneficiary_count:
        comp.beneficiary_count = data.beneficiary_count
    if data.status:
        comp.status = data.status

    project.compensation_paid_cr = data.disbursed_amount_cr
    db.commit()
    db.refresh(comp)
    return comp
