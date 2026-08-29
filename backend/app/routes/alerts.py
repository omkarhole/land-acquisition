"""
Early Warning Alerts Router for SIH26017.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database import get_db
from backend.app.models.models import Alert, Project, User, AuditLog
from backend.app.schemas.schemas import AlertOut
from backend.app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertOut])
def list_alerts(
    status_filter: Optional[str] = Query(None, alias="status"),
    severity: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Alert).join(Project, Alert.project_id == Project.id)

    if status_filter:
        query = query.filter(Alert.status == status_filter)
    if severity:
        query = query.filter(Alert.severity == severity)

    alerts = query.order_by(desc(Alert.created_at)).all()

    results = []
    for a in alerts:
        results.append({
            "id": a.id,
            "project_id": a.project_id,
            "project_title": a.project.title if a.project else "Unknown Project",
            "project_code": a.project.project_code if a.project else "N/A",
            "severity": a.severity,
            "alert_type": a.alert_type,
            "message": a.message,
            "status": a.status,
            "created_at": a.created_at
        })

    return results


@router.patch("/{alert_id}/acknowledge", response_model=AlertOut)
def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = "ACKNOWLEDGED"
    
    audit = AuditLog(
        user_email=current_user.email,
        action="ACKNOWLEDGE_ALERT",
        entity_type="Alert",
        entity_id=str(alert.id),
        details=f"Alert #{alert.id} acknowledged by {current_user.name}"
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)

    return {
        "id": alert.id,
        "project_id": alert.project_id,
        "project_title": alert.project.title if alert.project else "",
        "project_code": alert.project.project_code if alert.project else "",
        "severity": alert.severity,
        "alert_type": alert.alert_type,
        "message": alert.message,
        "status": alert.status,
        "created_at": alert.created_at
    }


@router.patch("/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = "RESOLVED"
    
    audit = AuditLog(
        user_email=current_user.email,
        action="RESOLVE_ALERT",
        entity_type="Alert",
        entity_id=str(alert.id),
        details=f"Alert #{alert.id} marked as resolved by {current_user.name}"
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)

    return {
        "id": alert.id,
        "project_id": alert.project_id,
        "project_title": alert.project.title if alert.project else "",
        "project_code": alert.project.project_code if alert.project else "",
        "severity": alert.severity,
        "alert_type": alert.alert_type,
        "message": alert.message,
        "status": alert.status,
        "created_at": alert.created_at
    }
