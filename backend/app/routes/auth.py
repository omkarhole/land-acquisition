"""
Authentication endpoints for SIH26017.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import User, AuditLog
from backend.app.schemas.schemas import UserLogin, UserOut, Token
from backend.app.services.auth_service import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "name": user.name}
    )

    # Log audit
    log = AuditLog(
        user_email=user.email,
        action="USER_LOGIN",
        entity_type="User",
        entity_id=str(user.id),
        details=f"User logged in with role: {user.role}"
    )
    db.add(log)
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/demo-users")
def get_demo_users():
    """Returns list of pre-configured demo user accounts for easy evaluation."""
    return [
        {"role": "Administrator", "email": "admin@sih.gov.in", "password": "password123", "desc": "Full system control & master settings"},
        {"role": "Project Officer", "email": "officer@sih.gov.in", "password": "password123", "desc": "Creates projects, updates stages, logs actions"},
        {"role": "District Collector", "email": "district@sih.gov.in", "password": "password123", "desc": "Monitors regional land acquisition KPIs"},
        {"role": "Ministry Secretary", "email": "director@sih.gov.in", "password": "password123", "desc": "High-level national decision maker"},
        {"role": "Data Analyst", "email": "analyst@sih.gov.in", "password": "password123", "desc": "Model metrics and ML governance"}
    ]
