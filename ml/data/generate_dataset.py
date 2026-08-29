"""
SIH26017 - Synthetic Dataset Generator for Land Acquisition Delay Prediction
Designed for Ministry of Rural Development Land Acquisition Projects & LARR Act 2013 workflow.
"""

import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_land_acquisition_dataset(num_samples: int = 2500, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)
    random.seed(seed)

    states_and_districts = {
        "Maharashtra": [("Pune", 0.32), ("Nagpur", 0.28), ("Thane", 0.45), ("Nashik", 0.25), ("Aurangabad", 0.30)],
        "Uttar Pradesh": [("Lucknow", 0.38), ("Varanasi", 0.42), ("Noida", 0.50), ("Agra", 0.35), ("Prayagraj", 0.40)],
        "Gujarat": [("Ahmedabad", 0.20), ("Surat", 0.22), ("Vadodara", 0.18), ("Rajkot", 0.15), ("Bharuch", 0.26)],
        "Karnataka": [("Bengaluru Rural", 0.48), ("Mysuru", 0.25), ("Belagavi", 0.22), ("Dharwad", 0.20), ("Mangaluru", 0.30)],
        "Tamil Nadu": [("Kanchipuram", 0.35), ("Coimbatore", 0.24), ("Madurai", 0.28), ("Salem", 0.20), ("Tiruchirappalli", 0.25)],
        "Odisha": [("Khurda", 0.34), ("Sundargarh", 0.42), ("Jajpur", 0.39), ("Angul", 0.45), ("Sambalpur", 0.31)],
        "Madhya Pradesh": [("Bhopal", 0.29), ("Indore", 0.22), ("Jabalpur", 0.33), ("Gwalior", 0.37), ("Ujjain", 0.26)],
        "Rajasthan": [("Jaipur", 0.30), ("Jodhpur", 0.28), ("Kota", 0.25), ("Alwar", 0.38), ("Udaipur", 0.27)]
    }

    project_types = [
        ("National Highway Corridor", 1.2),
        ("High-Speed Rail / DFC", 1.4),
        ("Industrial Smart City Corridor", 1.1),
        ("Major Irrigation & Canal", 1.3),
        ("Renewable Energy Solar Park", 0.8),
        ("Urban Metro Transit Extension", 1.35),
        ("Rural Road Connectivity (PMGSY)", 0.7)
    ]

    acquisition_stages = [
        "Stage 1: Preliminary Survey & SIA",
        "Stage 2: Section 11 Notification",
        "Stage 3: Section 15 Hearing & Objections",
        "Stage 4: Section 19 Declaration",
        "Stage 5: Valuation & Compensation Award",
        "Stage 6: Land Possession & Handover"
    ]

    records = []
    base_date = datetime(2023, 1, 1)

    for i in range(1, num_samples + 1):
        project_id = f"LA-2026-{1000 + i:04d}"
        
        # State & District
        state = random.choice(list(states_and_districts.keys()))
        dist_info = random.choice(states_and_districts[state])
        district = dist_info[0]
        district_delay_rate = dist_info[1] + np.random.normal(0, 0.02)
        district_delay_rate = max(0.05, min(0.75, district_delay_rate))

        # Project Type
        ptype_info = random.choice(project_types)
        project_type = ptype_info[0]
        type_risk_multiplier = ptype_info[1]

        # Project parameters
        priority = random.choice(["Normal", "High", "Critical", "Cabinet Fast-Track"])
        land_area_hectares = round(float(np.random.exponential(scale=85) + 5), 2)
        affected_owner_count = int(land_area_hectares * np.random.uniform(2.5, 8.5) + np.random.randint(10, 50))
        household_count = int(affected_owner_count * np.random.uniform(0.6, 1.1))
        
        # Project value & compensation offered (in Crores INR)
        project_value_cr = round(float(land_area_hectares * np.random.uniform(0.8, 3.5) + np.random.uniform(10, 150)), 2)
        compensation_offered_cr = round(float(project_value_cr * np.random.uniform(0.25, 0.55)), 2)

        # Dates & timeline
        start_offset_days = random.randint(30, 900)
        start_date = base_date + timedelta(days=start_offset_days)
        planned_duration_days = random.randint(180, 730)
        target_date = start_date + timedelta(days=planned_duration_days)
        
        # Current observation point
        project_age_days = random.randint(30, planned_duration_days + 100)
        current_date = start_date + timedelta(days=project_age_days)
        days_to_target = (target_date - current_date).days

        # Stage and progress
        stage_idx = min(len(acquisition_stages) - 1, int(np.random.choice([0, 1, 2, 3, 4, 5], p=[0.10, 0.18, 0.22, 0.20, 0.18, 0.12])))
        current_stage = acquisition_stages[stage_idx]
        stage_completion_ratio = round((stage_idx + 1) / len(acquisition_stages), 2)
        
        expected_progress = min(1.0, max(0.05, project_age_days / planned_duration_days))
        stage_age_days = random.randint(10, 180)
        
        # Process friction factors
        total_docs_required = random.randint(12, 35)
        pending_document_count = random.randint(0, total_docs_required)
        document_pending_ratio = round(pending_document_count / total_docs_required, 3)

        pending_approval_count = random.randint(0, 8)
        approval_age_days = random.randint(0, 120) if pending_approval_count > 0 else 0

        # Objections & Legal
        objection_count = int(np.random.poisson(lam=affected_owner_count * 0.015))
        court_stay_flag = 1 if (objection_count > 4 and random.random() < 0.35) else 0
        legal_issue_count = objection_count + (random.randint(1, 4) if court_stay_flag else 0)

        # Compensation disbursement
        if stage_idx < 3:
            compensation_paid_ratio = round(random.uniform(0.0, 0.2), 3)
        elif stage_idx == 3:
            compensation_paid_ratio = round(random.uniform(0.1, 0.6), 3)
        elif stage_idx == 4:
            compensation_paid_ratio = round(random.uniform(0.3, 0.85), 3)
        else:
            compensation_paid_ratio = round(random.uniform(0.6, 1.0), 3)
        
        compensation_paid_cr = round(compensation_offered_cr * compensation_paid_ratio, 2)
        compensation_pending_cr = round(compensation_offered_cr - compensation_paid_cr, 2)

        # Dependencies
        utility_shift_pending = 1 if random.random() < 0.28 else 0
        forest_clearance_pending = 1 if random.random() < 0.22 else 0
        railway_crossing_pending = 1 if (project_type in ["National Highway Corridor", "High-Speed Rail / DFC"] and random.random() < 0.30) else 0

        overall_progress_pct = max(0.02, min(0.98, round((stage_completion_ratio * 0.6 + compensation_paid_ratio * 0.4) * 100, 1)))
        progress_gap = round((expected_progress * 100) - overall_progress_pct, 1)

        # Past district / state experience
        past_delay_count = random.randint(0, 6)

        # Ground-truth delay probability formula (simulating real-world complex process risk)
        risk_score = (
            0.15 * (document_pending_ratio) +
            0.20 * (1.0 - compensation_paid_ratio) +
            0.18 * min(1.0, stage_age_days / 90.0) +
            0.22 * min(1.0, legal_issue_count / 5.0) +
            0.10 * (1.0 if court_stay_flag else 0.0) +
            0.15 * min(1.0, max(0.0, progress_gap / 40.0)) +
            0.12 * (district_delay_rate) +
            0.08 * (0.3 if utility_shift_pending else 0.0) +
            0.08 * (0.3 if forest_clearance_pending else 0.0) +
            0.05 * (type_risk_multiplier - 1.0)
        )
        
        # Add slight stochastic noise
        noise = np.random.normal(0, 0.06)
        delay_prob = float(np.clip(risk_score + noise, 0.02, 0.98))

        # Ground truth label (Delay flag = 1 if delayed, 0 if on-time)
        delay_flag = 1 if delay_prob > 0.48 else 0
        
        if delay_flag == 1:
            delay_days = int(max(15, np.random.exponential(scale=65) + (delay_prob * 100) + (stage_age_days * 0.4)))
        else:
            delay_days = 0

        records.append({
            "project_id": project_id,
            "state": state,
            "district": district,
            "project_type": project_type,
            "priority": priority,
            "current_stage": current_stage,
            "land_area_hectares": land_area_hectares,
            "affected_owner_count": affected_owner_count,
            "household_count": household_count,
            "project_value_cr": project_value_cr,
            "compensation_offered_cr": compensation_offered_cr,
            "compensation_paid_cr": compensation_paid_cr,
            "compensation_pending_cr": compensation_pending_cr,
            "compensation_paid_ratio": compensation_paid_ratio,
            "pending_document_count": pending_document_count,
            "document_pending_ratio": document_pending_ratio,
            "pending_approval_count": pending_approval_count,
            "approval_age_days": approval_age_days,
            "objection_count": objection_count,
            "court_stay_flag": court_stay_flag,
            "legal_issue_count": legal_issue_count,
            "utility_shift_pending": utility_shift_pending,
            "forest_clearance_pending": forest_clearance_pending,
            "railway_crossing_pending": railway_crossing_pending,
            "stage_age_days": stage_age_days,
            "project_age_days": project_age_days,
            "days_to_target": days_to_target,
            "overall_progress_pct": overall_progress_pct,
            "progress_gap": progress_gap,
            "district_delay_rate": round(district_delay_rate, 3),
            "past_delay_count": past_delay_count,
            "ground_truth_prob": round(delay_prob, 3),
            "delay_flag": delay_flag,
            "delay_days": delay_days
        })

    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, "projects.csv")
    print(f"Generating synthetic Land Acquisition dataset...")
    df = generate_land_acquisition_dataset(num_samples=2500)
    df.to_csv(output_path, index=False)
    print(f"Dataset generated successfully with {len(df)} rows and {len(df.columns)} columns.")
    print(f"Saved to: {output_path}")
    print(f"Delay rate: {df['delay_flag'].mean():.2%}")
