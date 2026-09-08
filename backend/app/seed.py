"""
Comprehensive Seed Data Script for SIH26017 Land Acquisition Analytics System.
Pre-populates 10 realistic Indian infrastructure projects across 8 states with:
- 6 LARR Statutory Stages
- Regulatory Documentation & NOCs
- Direct Benefit Compensation Disbursements
- Rehabilitation & Resettlement (R&R) Families & Colony Progress
- Cadastral Land Possession & Disputed Parcels
- Inter-Departmental Collaborating Line Departments (Stakeholders)
- AI Predictive Next-Best-Action Recommendations
- Real-time ML Predictions, Explanations, Early-Warning Alerts, and Actions.
"""

from datetime import date, datetime, timedelta
from backend.app.database import SessionLocal, engine, Base
from backend.app.models.models import (
    User, Project, Stage, Document, Compensation, Rehabilitation, Possession,
    Stakeholder, Recommendation, Prediction, Explanation, Alert, Action, AuditLog
)
from backend.app.services.auth_service import get_password_hash
from backend.app.services.ml_service import predict_project_risk


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(User).count() > 0:
        print("Database already contains data. Skipping seed.")
        db.close()
        return

    print("Seeding SIH26017 Database with 5 official personas & 10 flagship infrastructure projects...")

    # 1. 5 Pre-configured Official Roles
    users_data = [
        ("Administrator", "admin@sih.gov.in", "admin", "System Administrator", "National", "New Delhi"),
        ("Project Officer", "officer@sih.gov.in", "officer", "Land Acquisition Officer (LAO)", "Maharashtra", "Pune"),
        ("District Collector", "district@sih.gov.in", "district", "District Magistrate & Collector", "Uttar Pradesh", "Varanasi"),
        ("Ministry Director", "director@sih.gov.in", "director", "Joint Secretary (Land Resources)", "National", "New Delhi"),
        ("Policy Analyst", "analyst@sih.gov.in", "analyst", "Lead Infrastructure Data Scientist", "NITI Aayog", "New Delhi")
    ]

    for name, email, role, desig, state, dist in users_data:
        u = User(
            name=name,
            email=email,
            password_hash=get_password_hash("password123"),
            role=role,
            designation=desig,
            state=state,
            district=dist
        )
        db.add(u)

    db.flush()

    stages_template = [
        ("Stage 1: Preliminary Survey & SIA", 45),
        ("Stage 2: Section 11 Notification", 60),
        ("Stage 3: Section 15 Hearing & Objections", 60),
        ("Stage 4: Section 19 Declaration", 90),
        ("Stage 5: Valuation & Compensation Award", 90),
        ("Stage 6: Land Possession & Handover", 60)
    ]

    # 2. 10 Flagship Indian Infrastructure Projects
    projects_data = [
        {
            "code": "LA-2026-0101",
            "title": "Pune-Nashik Semi High-Speed Rail Corridor (Package 2)",
            "state": "Maharashtra",
            "district": "Pune",
            "lat": 18.5204,
            "lng": 73.8567,
            "type": "High-Speed Rail / DFC",
            "priority": "High",
            "area": 145.5,
            "parcels": 840,
            "owners": 620,
            "households": 410,
            "val_cr": 280.0,
            "comp_offered": 115.0,
            "comp_paid": 45.0,
            "start": date(2023, 6, 1),
            "target": date(2026, 12, 31),
            "stage_idx": 2,
            "stage_days": 85,
            "progress": 38.0,
            "objections": 7,
            "conflicts": 4,
            "court_stay": False,
            "utility": True,
            "forest": False,
            "railway": True,
            "dist_rate": 0.32,
            "rr_families": 150,
            "rr_site": "Khed Resettlement Colony (Phase 1 Ready)",
            "docs": [
                ("SIA_REPORT", "Social Impact Assessment (SIA) Final Report", "Approved"),
                ("SEC11_GAZETTE", "Section 11 Gazette Notification", "Approved"),
                ("TITLE_VERIFICATION", "Revenue Records & Land Title Dossier", "Under Review"),
                ("SEC15_HEARING_REPORT", "Section 15 Objections Hearing Summary", "Pending"),
                ("COMPENSATION_AWARD", "Joint Measurement & Compensation Statement", "Pending"),
                ("UTILITY_SHIFT_PLAN", "MSEDCL High Tension Line Relocation Agreement", "Pending")
            ],
            "stakeholders": [
                ("MSEDCL Power Transmission", 3, 52, 0.48),
                ("Central Railway Coordination Cell", 1, 28, 0.82),
                ("Pune District Revenue Collectorate", 4, 20, 0.90)
            ]
        },
        {
            "code": "LA-2026-0102",
            "title": "Delhi-Varanasi High Speed Bullet Rail Corridor (Chandauli-Varanasi Section)",
            "state": "Uttar Pradesh",
            "district": "Varanasi",
            "lat": 25.3176,
            "lng": 82.9739,
            "type": "High-Speed Rail / DFC",
            "priority": "Critical",
            "area": 210.0,
            "parcels": 1250,
            "owners": 1150,
            "households": 780,
            "val_cr": 540.0,
            "comp_offered": 240.0,
            "comp_paid": 60.0,
            "start": date(2023, 2, 15),
            "target": date(2026, 8, 30),
            "stage_idx": 3,
            "stage_days": 110,
            "progress": 42.0,
            "objections": 14,
            "conflicts": 8,
            "court_stay": True,
            "utility": True,
            "forest": True,
            "railway": False,
            "dist_rate": 0.42,
            "rr_families": 210,
            "rr_site": "Rohania Resettlement Scheme (Under Construction)",
            "docs": [
                ("SIA_REPORT", "SIA Expert Group Recommendation", "Approved"),
                ("SEC11_GAZETTE", "Section 11 Preliminary Notification", "Approved"),
                ("TITLE_VERIFICATION", "Title Mutation Registry Verification", "Approved"),
                ("SEC15_HEARING_REPORT", "Section 15 Hearing Disposal Order", "Under Review"),
                ("SEC19_DECLARATION", "Section 19 Gazette Declaration", "Pending"),
                ("FOREST_NOC", "MoEFCC Forest Diversion Stage-II Clearance", "Pending")
            ],
            "stakeholders": [
                ("UP Forest Department", 2, 75, 0.35),
                ("UP Power Transmission Corp", 4, 60, 0.40),
                ("Varanasi Land Acquisition Authority", 6, 30, 0.75)
            ]
        },
        {
            "code": "LA-2026-0103",
            "title": "Dholera Special Investment Region Dedicated Industrial Expressway",
            "state": "Gujarat",
            "district": "Ahmedabad",
            "lat": 22.2587,
            "lng": 71.9868,
            "type": "Industrial Smart City Corridor",
            "priority": "Cabinet Fast-Track",
            "area": 320.0,
            "parcels": 1600,
            "owners": 890,
            "households": 520,
            "val_cr": 420.0,
            "comp_offered": 190.0,
            "comp_paid": 175.0,
            "start": date(2024, 1, 10),
            "target": date(2027, 4, 30),
            "stage_idx": 4,
            "stage_days": 25,
            "progress": 82.0,
            "objections": 1,
            "conflicts": 0,
            "court_stay": False,
            "utility": False,
            "forest": False,
            "railway": False,
            "dist_rate": 0.18,
            "rr_families": 490,
            "rr_site": "Dholera Smart City Resettlement Sector 4 (Completed)",
            "docs": [
                ("SIA_REPORT", "SIA Comprehensive Report", "Approved"),
                ("SEC11_GAZETTE", "Section 11 Gazette", "Approved"),
                ("TITLE_VERIFICATION", "Revenue Records Clearance", "Approved"),
                ("SEC15_HEARING_REPORT", "Objections Hearing Clearance", "Approved"),
                ("SEC19_DECLARATION", "Section 19 Declaration", "Approved"),
                ("COMPENSATION_AWARD", "Direct Bank Transfer Compensation Award", "Approved")
            ],
            "stakeholders": [
                ("Gujarat Energy Transmission", 0, 15, 0.95),
                ("Ahmedabad Revenue Division", 1, 12, 0.98)
            ]
        },
        {
            "code": "LA-2026-0104",
            "title": "Bengaluru Outer Ring Rail Transit Phase-II Extension",
            "state": "Karnataka",
            "district": "Bengaluru Rural",
            "lat": 13.0827,
            "lng": 77.5877,
            "type": "Urban Metro Transit Extension",
            "priority": "High",
            "area": 88.0,
            "parcels": 540,
            "owners": 510,
            "households": 390,
            "val_cr": 360.0,
            "comp_offered": 160.0,
            "comp_paid": 30.0,
            "start": date(2023, 10, 1),
            "target": date(2026, 11, 30),
            "stage_idx": 1,
            "stage_days": 75,
            "progress": 26.0,
            "objections": 9,
            "conflicts": 5,
            "court_stay": False,
            "utility": True,
            "forest": False,
            "railway": True,
            "dist_rate": 0.48,
            "rr_families": 60,
            "rr_site": "Devanahalli Rehabilitation Layout (Planning Phase)",
            "docs": [
                ("SIA_REPORT", "SIA Baseline Survey", "Approved"),
                ("SEC11_GAZETTE", "Section 11 Preliminary Notification", "Under Review"),
                ("TITLE_VERIFICATION", "Gramathana Revenue Titles", "Pending"),
                ("UTILITY_SHIFT_PLAN", "BWSSB Water Trunk Line Clearance", "Pending")
            ],
            "stakeholders": [
                ("Bangalore Water Supply & Sewerage Board", 3, 65, 0.45),
                ("KPTCL Power Transmission", 2, 40, 0.65),
                ("South Western Railway", 1, 20, 0.85)
            ]
        },
        {
            "code": "LA-2026-0105",
            "title": "Chennai-Salem 8-Lane Greenfield Highway Corridor (Package 3)",
            "state": "Tamil Nadu",
            "district": "Salem",
            "lat": 11.6643,
            "lng": 78.1460,
            "type": "National Highway Corridor",
            "priority": "Normal",
            "area": 112.0,
            "parcels": 680,
            "owners": 430,
            "households": 290,
            "val_cr": 210.0,
            "comp_offered": 95.0,
            "comp_paid": 52.0,
            "start": date(2024, 2, 1),
            "target": date(2027, 1, 31),
            "stage_idx": 2,
            "stage_days": 55,
            "progress": 48.0,
            "objections": 4,
            "conflicts": 2,
            "court_stay": False,
            "utility": False,
            "forest": True,
            "railway": False,
            "dist_rate": 0.24,
            "rr_families": 140,
            "rr_site": "Salem Sub-urban Resettlement Enclave (Phase 1 Ready)",
            "docs": [
                ("SIA_REPORT", "Environmental & SIA Evaluation", "Approved"),
                ("SEC11_GAZETTE", "Section 11 Notification", "Approved"),
                ("TITLE_VERIFICATION", "Patta Revenue Verification", "Approved"),
                ("FOREST_NOC", "Reserve Forest Boundary Demarcation", "Under Review")
            ],
            "stakeholders": [
                ("Tamil Nadu Forest Dept", 1, 35, 0.70),
                ("TANGEDCO Electricity Board", 2, 25, 0.80)
            ]
        },
        {
            "code": "LA-2026-0106",
            "title": "Angul-Sukinda Heavy Industrial Railway Freight Link",
            "state": "Odisha",
            "district": "Angul",
            "lat": 20.8398,
            "lng": 85.1013,
            "type": "High-Speed Rail / DFC",
            "priority": "Critical",
            "area": 195.0,
            "parcels": 1100,
            "owners": 840,
            "households": 610,
            "val_cr": 310.0,
            "comp_offered": 130.0,
            "comp_paid": 22.0,
            "start": date(2023, 4, 15),
            "target": date(2026, 9, 15),
            "stage_idx": 3,
            "stage_days": 135,
            "progress": 32.0,
            "objections": 16,
            "conflicts": 9,
            "court_stay": True,
            "utility": True,
            "forest": True,
            "railway": True,
            "dist_rate": 0.45,
            "rr_families": 110,
            "rr_site": "Talcher Tribal Rehabilitation Colony (Civil Works Delayed)",
            "docs": [
                ("SIA_REPORT", "Gram Sabha Social Impact Consultation", "Approved"),
                ("SEC11_GAZETTE", "Section 11 Notification", "Approved"),
                ("TITLE_VERIFICATION", "Tribal Land Settlement Verification", "Under Review"),
                ("SEC15_HEARING_REPORT", "Section 15 Hearing Record", "Pending"),
                ("FOREST_NOC", "Stage-II Forest Rights Act (FRA) Certificate", "Pending")
            ],
            "stakeholders": [
                ("Odisha State Forest Dept", 3, 90, 0.25),
                ("East Coast Railway Authority", 2, 45, 0.60),
                ("Angul District Collectorate", 5, 35, 0.70)
            ]
        },
        {
            "code": "LA-2026-0107",
            "title": "Ken-Betwa National River Interlinking Link Canal (Bhopal Section)",
            "state": "Madhya Pradesh",
            "district": "Bhopal",
            "lat": 23.2599,
            "lng": 77.4126,
            "type": "Major Irrigation & Canal",
            "priority": "Cabinet Fast-Track",
            "area": 275.0,
            "parcels": 1450,
            "owners": 1050,
            "households": 820,
            "val_cr": 480.0,
            "comp_offered": 210.0,
            "comp_paid": 130.0,
            "start": date(2023, 8, 20),
            "target": date(2027, 3, 31),
            "stage_idx": 2,
            "stage_days": 60,
            "progress": 55.0,
            "objections": 5,
            "conflicts": 3,
            "court_stay": False,
            "utility": True,
            "forest": True,
            "railway": False,
            "dist_rate": 0.29,
            "rr_families": 420,
            "rr_site": "Betwa River Resettlement Complex (Water Supply Connected)",
            "docs": [
                ("SIA_REPORT", "Submergence & Resettlement Framework", "Approved"),
                ("SEC11_GAZETTE", "Section 11 Notification", "Approved"),
                ("TITLE_VERIFICATION", "Khasra Number Title Dossier", "Approved"),
                ("SEC15_HEARING_REPORT", "Grievance Redressal Hearing Report", "Under Review")
            ],
            "stakeholders": [
                ("MP Water Resources Dept", 1, 20, 0.85),
                ("MP Forest Department", 2, 40, 0.65)
            ]
        },
        {
            "code": "LA-2026-0108",
            "title": "Delhi-Mumbai Mega Expressway Section 18 (Kota Interchange)",
            "state": "Rajasthan",
            "district": "Kota",
            "lat": 25.2138,
            "lng": 75.8648,
            "type": "National Highway Corridor",
            "priority": "High",
            "area": 160.0,
            "parcels": 920,
            "owners": 490,
            "households": 310,
            "val_cr": 220.0,
            "comp_offered": 100.0,
            "comp_paid": 95.0,
            "start": date(2023, 11, 1),
            "target": date(2026, 10, 31),
            "stage_idx": 5,
            "stage_days": 18,
            "progress": 92.0,
            "objections": 0,
            "conflicts": 0,
            "court_stay": False,
            "utility": False,
            "forest": False,
            "railway": False,
            "dist_rate": 0.25,
            "rr_families": 305,
            "rr_site": "Kota Bypass Resettlement Sector (Fully Completed)",
            "docs": [
                ("SIA_REPORT", "SIA Approval", "Approved"),
                ("SEC11_GAZETTE", "Section 11 Gazette", "Approved"),
                ("SEC19_DECLARATION", "Section 19 Declaration", "Approved"),
                ("COMPENSATION_AWARD", "100% Compensation Award Disbursed", "Approved")
            ],
            "stakeholders": [
                ("NHAI Project Implementation Unit Kota", 0, 10, 0.98),
                ("Rajasthan Vidyut Prasaran Nigam", 0, 14, 0.95)
            ]
        },
        {
            "code": "LA-2026-0109",
            "title": "Nagpur-Gondia 4-Lane Greenfield Agricultural Logistics Corridor",
            "state": "Maharashtra",
            "district": "Nagpur",
            "lat": 21.1458,
            "lng": 79.0882,
            "type": "Rural Road Connectivity (PMGSY)",
            "priority": "Normal",
            "area": 72.0,
            "parcels": 410,
            "owners": 290,
            "households": 210,
            "val_cr": 95.0,
            "comp_offered": 42.0,
            "comp_paid": 5.0,
            "start": date(2024, 4, 1),
            "target": date(2027, 6, 30),
            "stage_idx": 0,
            "stage_days": 20,
            "progress": 14.0,
            "objections": 1,
            "conflicts": 1,
            "court_stay": False,
            "utility": False,
            "forest": False,
            "railway": False,
            "dist_rate": 0.28,
            "rr_families": 25,
            "rr_site": "Gondia Agricultural Resettlement Zone (Site Survey)",
            "docs": [
                ("SIA_REPORT", "Preliminary Social Impact Study", "Under Review"),
                ("SEC11_GAZETTE", "Draft Section 11 Schedule", "Pending")
            ],
            "stakeholders": [
                ("Maharashtra PWD", 1, 20, 0.85),
                ("Nagpur Revenue Division", 1, 15, 0.90)
            ]
        },
        {
            "code": "LA-2026-0110",
            "title": "Prayagraj Inland Multi-Modal Logistics Waterway Terminal",
            "state": "Uttar Pradesh",
            "district": "Prayagraj",
            "lat": 25.4358,
            "lng": 81.8463,
            "type": "Industrial Smart City Corridor",
            "priority": "High",
            "area": 135.0,
            "parcels": 780,
            "owners": 580,
            "households": 420,
            "val_cr": 190.0,
            "comp_offered": 85.0,
            "comp_paid": 35.0,
            "start": date(2023, 9, 10),
            "target": date(2026, 12, 15),
            "stage_idx": 2,
            "stage_days": 70,
            "progress": 40.0,
            "objections": 6,
            "conflicts": 3,
            "court_stay": False,
            "utility": True,
            "forest": False,
            "railway": True,
            "dist_rate": 0.40,
            "rr_families": 160,
            "rr_site": "Naini Inland Waterways Housing Scheme",
            "docs": [
                ("SIA_REPORT", "SIA Baseline Clearance", "Approved"),
                ("SEC11_GAZETTE", "Section 11 Gazette", "Approved"),
                ("TITLE_VERIFICATION", "Revenue Record Survey", "Approved"),
                ("SEC15_HEARING_REPORT", "Collector Hearing Proceedings", "Under Review"),
                ("UTILITY_SHIFT_PLAN", "GAIL Gas Pipeline Relocation", "Pending")
            ],
            "stakeholders": [
                ("Inland Waterways Authority of India", 2, 35, 0.75),
                ("GAIL Gas Pipeline Division", 3, 50, 0.50),
                ("Prayagraj District Administration", 2, 20, 0.85)
            ]
        }
    ]

    for pdata in projects_data:
        curr_stage_name = stages_template[pdata["stage_idx"]][0]
        project = Project(
            project_code=pdata["code"],
            title=pdata["title"],
            state=pdata["state"],
            district=pdata["district"],
            latitude=pdata["lat"],
            longitude=pdata["lng"],
            project_type=pdata["type"],
            priority=pdata["priority"],
            land_area_hectares=pdata["area"],
            affected_owner_count=pdata["owners"],
            household_count=pdata["households"],
            project_value_cr=pdata["val_cr"],
            compensation_offered_cr=pdata["comp_offered"],
            compensation_paid_cr=pdata["comp_paid"],
            start_date=pdata["start"],
            target_date=pdata["target"],
            status="In Progress",
            current_stage=curr_stage_name,
            overall_progress_pct=pdata["progress"],
            objection_count=pdata["objections"],
            ownership_conflict_count=pdata["conflicts"],
            court_stay_flag=pdata["court_stay"],
            utility_shift_pending=pdata["utility"],
            forest_clearance_pending=pdata["forest"],
            railway_crossing_pending=pdata["railway"],
            district_delay_rate=pdata["dist_rate"],
            past_delay_count=1
        )
        db.add(project)
        db.flush()

        # Stages
        for s_idx, (st_name, target_duration) in enumerate(stages_template):
            if s_idx < pdata["stage_idx"]:
                st_status = "Completed"
                st_days = target_duration - 5
                st_comp_date = pdata["start"] + timedelta(days=(s_idx + 1) * 45)
            elif s_idx == pdata["stage_idx"]:
                st_status = "In Progress"
                st_days = pdata["stage_days"]
                st_comp_date = None
            else:
                st_status = "Pending"
                st_days = 0
                st_comp_date = None

            stage = Stage(
                project_id=project.id,
                stage_order=s_idx + 1,
                stage_name=st_name,
                start_date=pdata["start"] + timedelta(days=s_idx * 45),
                status=st_status,
                days_in_stage=st_days,
                completion_date=st_comp_date,
                remarks=f"Target duration: {target_duration} days under RFCTLARR 2013 rules."
            )
            db.add(stage)

        # Documents
        for doc_type, doc_title, doc_status in pdata["docs"]:
            doc = Document(
                project_id=project.id,
                document_type=doc_type,
                title=doc_title,
                status=doc_status,
                remarks="Quarterly LAO statutory compliance file"
            )
            db.add(doc)

        # Compensation
        comp = Compensation(
            project_id=project.id,
            beneficiary_count=pdata["owners"],
            total_amount_cr=pdata["comp_offered"],
            disbursed_amount_cr=pdata["comp_paid"],
            pending_amount_cr=round(pdata["comp_offered"] - pdata["comp_paid"], 2),
            disbursement_pct=round((pdata["comp_paid"] / max(0.1, pdata["comp_offered"])) * 100, 1),
            status="In Progress"
        )
        db.add(comp)

        # 🌟 R&R
        rr_pct = round((pdata["rr_families"] / max(1, pdata["households"])) * 100, 1)
        rr = Rehabilitation(
            project_id=project.id,
            total_families=pdata["households"],
            families_rehabilitated=pdata["rr_families"],
            pending_cases=max(0, pdata["households"] - pdata["rr_families"]),
            progress_pct=rr_pct,
            status="Completed" if rr_pct >= 90 else "In Progress",
            resettlement_site_status=pdata["rr_site"]
        )
        db.add(rr)

        # 🌟 Possession
        acquired_p = int(pdata["parcels"] * (pdata["progress"] / 100.0))
        pos = Possession(
            project_id=project.id,
            total_parcels=pdata["parcels"],
            acquired_parcels=acquired_p,
            pending_parcels=max(0, pdata["parcels"] - acquired_p),
            disputed_parcels=pdata["conflicts"] * 2 + (6 if pdata["court_stay"] else 0),
            possession_status="Joint Measurement Survey" if pdata["progress"] < 80 else "Handover Completed"
        )
        db.add(pos)

        # 🌟 Stakeholders
        for dept, pending_cnt, avg_days, score in pdata["stakeholders"]:
            stk = Stakeholder(
                project_id=project.id,
                department_name=dept,
                pending_actions=pending_cnt,
                avg_response_days=avg_days,
                responsiveness_score=score,
                last_interaction=date.today() - timedelta(days=5)
            )
            db.add(stk)

        db.flush()

        # Run Prediction & AI Recommendations
        prob, risk_level, delay_days, explanations, recommendations = predict_project_risk(project)
        pred = Prediction(
            project_id=project.id,
            probability=round(prob, 3),
            risk_level=risk_level,
            estimated_delay_days=delay_days,
            model_version="xgb-v1.2.0"
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

        for rec in recommendations:
            recom = Recommendation(
                project_id=project.id,
                title=rec["title"],
                category=rec["category"],
                urgency=rec["urgency"],
                expected_risk_reduction_pct=rec["expected_risk_reduction_pct"],
                action_steps=rec["action_steps"],
                status="SUGGESTED"
            )
            db.add(recom)

        if prob >= 0.70:
            alert = Alert(
                project_id=project.id,
                severity="CRITICAL" if prob >= 0.85 else "HIGH",
                alert_type="EARLY_WARNING_CRITICAL_DELAY",
                message=f"Project {project.project_code} ({project.title[:35]}...) flagged with {risk_level} risk ({int(prob*100)}% delay probability). Key bottleneck: {explanations[0]['feature_label'] if explanations else 'Multiple factors'}.",
                status="ACTIVE"
            )
            db.add(alert)

        if prob >= 0.75:
            act = Action(
                project_id=project.id,
                action_type="Special Redressal Camp",
                title=f"Conduct Special Section 15 Hearing for {project.district} Landowners",
                description="Fast-track public hearings with revenue officers to resolve outstanding boundary and compensation rate objections.",
                assigned_to="Land Acquisition Officer (LAO)",
                due_date=date.today() + timedelta(days=14),
                status="OPEN",
                initial_risk=round(prob, 3)
            )
            db.add(act)

    db.commit()
    db.close()
    print("Database seeding with 10 projects, R&R, and Stakeholders completed successfully!")


if __name__ == "__main__":
    seed_database()
