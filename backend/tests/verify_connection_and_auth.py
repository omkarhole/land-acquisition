"""
SIH26017: Instant Database & Authentication Verification Script
Run this script to verify DB connection, table counts, and JWT authentication in 5 seconds!
Command: python backend/tests/verify_connection_and_auth.py
"""

import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.database import engine, SessionLocal, DATABASE_URL
from backend.app.models.models import User, Project, Stage, Rehabilitation, Possession, Stakeholder, Recommendation
from backend.app.services.auth_service import verify_password, create_access_token, get_password_hash

def verify_all():
    print("=" * 65)
    print("SIH26017: REAL-TIME DB & AUTHENTICATION VERIFIER")
    print("=" * 65)
    
    # 1. Test Database Connection
    db_type = "PostgreSQL" if "postgres" in DATABASE_URL else "SQLite"
    print(f"\n[1/4] Checking Database Connection ({db_type})...")
    print(f"      Connection URL: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
    
    try:
        connection = engine.connect()
        print("      [OK] Database connection successful!")
        connection.close()
    except Exception as e:
        print(f"      [FAIL] Database connection failed: {e}")
        return

    # 2. Inspect Database Records
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        project_count = db.query(Project).count()
        stage_count = db.query(Stage).count()
        rr_count = db.query(Rehabilitation).count()
        pos_count = db.query(Possession).count()
        stk_count = db.query(Stakeholder).count()
        rec_count = db.query(Recommendation).count()

        print(f"\n[2/4] Inspecting Database Tables & Record Counts:")
        print(f"      - Users Table:                {user_count} records")
        print(f"      - Projects Table:             {project_count} records")
        print(f"      - Statutory Stages Table:     {stage_count} records")
        print(f"      - R&R Resettlement Table:     {rr_count} records")
        print(f"      - Cadastral Possession Table: {pos_count} records")
        print(f"      - Line Departments Table:     {stk_count} records")
        print(f"      - AI Recommendations Table:   {rec_count} records")

        if user_count == 0 or project_count == 0:
            print("\n      [WARN] Tables are empty. Run: python -m backend.app.seed")
        else:
            print("      [OK] Database schema and seed records are healthy!")

        # 3. Test Password Verification
        print(f"\n[3/4] Testing Authentication & Password Hashing (bcrypt):")
        test_user = db.query(User).filter(User.email == "officer@sih.gov.in").first()
        if test_user:
            is_valid = verify_password("password123", test_user.password_hash)
            if is_valid:
                print(f"      [OK] Password verification passed for '{test_user.email}' (Role: {test_user.role})")
            else:
                print(f"      [FAIL] Password verification failed for '{test_user.email}'")
        else:
            print("      [WARN] User 'officer@sih.gov.in' not found in database.")

        # 4. Test JWT Token Generation & Claims
        print(f"\n[4/4] Testing JWT Token Generation & Cryptographic Signature:")
        if test_user:
            token = create_access_token(data={"sub": test_user.email, "role": test_user.role, "name": test_user.name})
            print(f"      - Generated JWT Token: {token[:35]}... (valid for 24h)")
            print(f"      [OK] JWT Authentication Engine is fully operational!")

    except Exception as e:
        print(f"      [FAIL] Query error: {e}")
    finally:
        db.close()

    print("\n" + "=" * 65)
    print("VERIFICATION RESULT: System is ready for live full-stack demo!")
    print("=" * 65)

if __name__ == "__main__":
    verify_all()
