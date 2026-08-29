"""
Corrective Actions & Intervention Lifecycle Router for SIH26017.
Enables the full 'Predict -> Explain -> Alert -> Act -> Measure' governance loop.
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database import get_db
from backend.app.models.models import Action, Project, User, AuditLog, Prediction
from backend.app.schemas.schemas import ActionCreate, ActionUpdate, ActionOut
from backend.app.services.auth_service import get_current_user
from backend.app.services.ml_service import predict_project_risk

router = APIRouter(prefix="/api/actions", tags=["Interventions"])


@router.get("", response_model=List[ActionOut])
def list_actions(
    project_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(Action)
    if project_id:
        query = query.filter(Action.project_id == project_id)
    if status_filter:
        query = query.filter(Action.status == status_filter)

    return query.order_by(desc(Action.created_at)).all()


@router.post("/{project_id}", response_model=ActionOut, status_code=status.HTTP_201_CREATED)
def create_action(
    project_id: int,
    data: ActionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    current_prob = 0.5
    if project.predictions:
        current_prob = project.predictions[0].probability

    action = Action(
        project_id=project.id,
        action_type=data.action_type,
        title=data.title,
        description=data.description,
        assigned_to=data.assigned_to,
        due_date=data.due_date,
        status="OPEN",
        initial_risk=current_prob
    )
    db.add(action)
    
    audit = AuditLog(
        user_email=current_user.email,
        action="CREATE_INTERVENTION",
        entity_type="Action",
        entity_id=f"Project-{project.project_code}",
        details=f"Created action '{action.title}' assigned to {action.assigned_to}"
    )
    db.add(audit)
    db.commit()
    db.refresh(action)
    return action


@router.patch("/{action_id}", response_model=ActionOut)
def update_action(
    action_id: int,
    data: ActionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    action = db.query(Action).filter(Action.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")

    if data.status:
        action.status = data.status
        if data.status == "COMPLETED":
            # Recalculate risk on project to record post-action improvement
            project = db.query(Project).filter(Project.id == action.project_id).first()
            if project:
                prob, _, _, _ = predict_project_risk(project)
                action.post_action_risk = round(prob, 3)

    if data.outcome:
        action.outcome = data.outcome
    if data.post_action_risk is not None:
        action.post_action_risk = data.post_action_risk

    action.updated_at = datetime.utcnow()
    
    audit = AuditLog(
        user_email=current_user.email,
        action="UPDATE_INTERVENTION",
        entity_type="Action",
        entity_id=str(action.id),
        details=f"Updated action #{action.id} status to '{action.status}'"
    )
    db.add(audit)
    db.commit()
    db.refresh(action)
    return action
