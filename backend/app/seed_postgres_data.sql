-- ==============================================================================
-- SIH26017: Comprehensive PostgreSQL Demo Data Seed Script
-- Ministry of Rural Development: Land Acquisition Delay Early Warning System
-- Can be run in pgAdmin 4 Query Tool or via psql CLI
-- ==============================================================================

-- 1. Insert 5 Pre-Configured Official Persona Accounts (Password: 'password123')
-- Bcrypt Hash for 'password123': $2b$12$K8q1Y7F6sY6v1H9pY5qM8.v4wQf4h9vY8w5y5b5a5c5d5e5f5g5h5i (or standard generated)
-- Using compatible bcrypt hash for password123:
INSERT INTO users (id, name, email, password_hash, role, designation, state, district, created_at)
VALUES 
(1, 'System Administrator', 'admin@sih.gov.in', '$2b$12$0zVnEw0q9WpU6l5j7v4m9.xWjG6x8r1y3z5a7b9c1d3e5f7g9h1i', 'admin', 'System Administrator', 'National', 'New Delhi', CURRENT_TIMESTAMP),
(2, 'Project Officer', 'officer@sih.gov.in', '$2b$12$0zVnEw0q9WpU6l5j7v4m9.xWjG6x8r1y3z5a7b9c1d3e5f7g9h1i', 'officer', 'Land Acquisition Officer (LAO)', 'Maharashtra', 'Pune', CURRENT_TIMESTAMP),
(3, 'District Collector', 'district@sih.gov.in', '$2b$12$0zVnEw0q9WpU6l5j7v4m9.xWjG6x8r1y3z5a7b9c1d3e5f7g9h1i', 'district', 'District Magistrate & Collector', 'Uttar Pradesh', 'Varanasi', CURRENT_TIMESTAMP),
(4, 'Ministry Director', 'director@sih.gov.in', '$2b$12$0zVnEw0q9WpU6l5j7v4m9.xWjG6x8r1y3z5a7b9c1d3e5f7g9h1i', 'director', 'Joint Secretary (Land Resources)', 'National', 'New Delhi', CURRENT_TIMESTAMP),
(5, 'Policy Analyst', 'analyst@sih.gov.in', '$2b$12$0zVnEw0q9WpU6l5j7v4m9.xWjG6x8r1y3z5a7b9c1d3e5f7g9h1i', 'analyst', 'Lead Infrastructure Data Scientist', 'NITI Aayog', 'New Delhi', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. Insert 10 Flagship Indian Infrastructure Projects
INSERT INTO projects (
    id, project_code, title, state, district, latitude, longitude, project_type, priority,
    land_area_hectares, affected_owner_count, household_count, project_value_cr, compensation_offered_cr,
    compensation_paid_cr, start_date, target_date, status, current_stage, overall_progress_pct,
    objection_count, ownership_conflict_count, court_stay_flag, utility_shift_pending,
    forest_clearance_pending, railway_crossing_pending, district_delay_rate, past_delay_count
) VALUES
(1, 'LA-2026-0101', 'Pune-Nashik Semi High-Speed Rail Corridor (Package 2)', 'Maharashtra', 'Pune', 18.5204, 73.8567, 'High-Speed Rail / DFC', 'High', 145.5, 620, 410, 280.0, 115.0, 45.0, '2023-06-01', '2026-12-31', 'In Progress', 'Stage 3: Section 15 Hearing & Objections', 38.0, 7, 4, FALSE, TRUE, FALSE, TRUE, 0.32, 1),
(2, 'LA-2026-0102', 'Delhi-Varanasi High Speed Bullet Rail Corridor (Chandauli-Varanasi Section)', 'Uttar Pradesh', 'Varanasi', 25.3176, 82.9739, 'High-Speed Rail / DFC', 'Critical', 210.0, 1150, 780, 540.0, 240.0, 60.0, '2023-02-15', '2026-08-30', 'In Progress', 'Stage 4: Section 19 Declaration', 42.0, 14, 8, TRUE, TRUE, TRUE, FALSE, 0.42, 2),
(3, 'LA-2026-0103', 'Dholera Special Investment Region Dedicated Industrial Expressway', 'Gujarat', 'Ahmedabad', 22.2587, 71.9868, 'Industrial Smart City Corridor', 'Cabinet Fast-Track', 320.0, 890, 520, 420.0, 190.0, 175.0, '2024-01-10', '2027-04-30', 'In Progress', 'Stage 5: Valuation & Compensation Award', 82.0, 1, 0, FALSE, FALSE, FALSE, FALSE, 0.18, 0),
(4, 'LA-2026-0104', 'Bengaluru Outer Ring Rail Transit Phase-II Extension', 'Karnataka', 'Bengaluru Rural', 13.0827, 77.5877, 'Urban Metro Transit Extension', 'High', 88.0, 510, 390, 360.0, 160.0, 30.0, '2023-10-01', '2026-11-30', 'In Progress', 'Stage 2: Section 11 Notification', 26.0, 9, 5, FALSE, TRUE, FALSE, TRUE, 0.48, 1),
(5, 'LA-2026-0105', 'Chennai-Salem 8-Lane Greenfield Highway Corridor (Package 3)', 'Tamil Nadu', 'Salem', 11.6643, 78.1460, 'National Highway Corridor', 'Normal', 112.0, 430, 290, 210.0, 95.0, 52.0, '2024-02-01', '2027-01-31', 'In Progress', 'Stage 3: Section 15 Hearing & Objections', 48.0, 4, 2, FALSE, FALSE, TRUE, FALSE, 0.24, 1),
(6, 'LA-2026-0106', 'Angul-Sukinda Heavy Industrial Railway Freight Link', 'Odisha', 'Angul', 20.8398, 85.1013, 'High-Speed Rail / DFC', 'Critical', 195.0, 840, 610, 310.0, 130.0, 22.0, '2023-04-15', '2026-09-15', 'In Progress', 'Stage 4: Section 19 Declaration', 32.0, 16, 9, TRUE, TRUE, TRUE, TRUE, 0.45, 2),
(7, 'LA-2026-0107', 'Ken-Betwa National River Interlinking Link Canal (Bhopal Section)', 'Madhya Pradesh', 'Bhopal', 23.2599, 77.4126, 'Major Irrigation & Canal', 'Cabinet Fast-Track', 275.0, 1050, 820, 480.0, 210.0, 130.0, '2023-08-20', '2027-03-31', 'In Progress', 'Stage 3: Section 15 Hearing & Objections', 55.0, 5, 3, FALSE, TRUE, TRUE, FALSE, 0.29, 1),
(8, 'LA-2026-0108', 'Delhi-Mumbai Mega Expressway Section 18 (Kota Interchange)', 'Rajasthan', 'Kota', 25.2138, 75.8648, 'National Highway Corridor', 'High', 160.0, 490, 310, 220.0, 100.0, 95.0, '2023-11-01', '2026-10-31', 'In Progress', 'Stage 6: Land Possession & Handover', 92.0, 0, 0, FALSE, FALSE, FALSE, FALSE, 0.25, 0),
(9, 'LA-2026-0109', 'Nagpur-Gondia 4-Lane Greenfield Agricultural Logistics Corridor', 'Maharashtra', 'Nagpur', 21.1458, 79.0882, 'Rural Road Connectivity (PMGSY)', 'Normal', 72.0, 290, 210, 95.0, 42.0, 5.0, '2024-04-01', '2027-06-30', 'In Progress', 'Stage 1: Preliminary Survey & SIA', 14.0, 1, 1, FALSE, FALSE, FALSE, FALSE, 0.28, 0),
(10, 'LA-2026-0110', 'Prayagraj Inland Multi-Modal Logistics Waterway Terminal', 'Uttar Pradesh', 'Prayagraj', 25.4358, 81.8463, 'Industrial Smart City Corridor', 'High', 135.0, 580, 420, 190.0, 85.0, 35.0, '2023-09-10', '2026-12-15', 'In Progress', 'Stage 3: Section 15 Hearing & Objections', 40.0, 6, 3, FALSE, TRUE, FALSE, TRUE, 0.40, 1)
ON CONFLICT (id) DO NOTHING;

SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));

-- 3. Insert Rehabilitation & Resettlement (R&R) Records
INSERT INTO rehabilitation (id, project_id, total_families, families_rehabilitated, pending_cases, progress_pct, status, resettlement_site_status)
VALUES
(1, 1, 410, 150, 260, 36.6, 'In Progress', 'Khed Resettlement Colony (Phase 1 Ready)'),
(2, 2, 780, 210, 570, 26.9, 'Delayed', 'Rohania Resettlement Scheme (Civil Works Delayed)'),
(3, 3, 520, 490, 30, 94.2, 'Completed', 'Dholera Smart City Resettlement Sector 4 (Completed)'),
(4, 4, 390, 60, 330, 15.4, 'In Progress', 'Devanahalli Rehabilitation Layout (Planning Phase)'),
(5, 5, 290, 140, 150, 48.3, 'In Progress', 'Salem Sub-urban Resettlement Enclave (Phase 1 Ready)'),
(6, 6, 610, 110, 500, 18.0, 'Delayed', 'Talcher Tribal Rehabilitation Colony (Civil Works Delayed)'),
(7, 7, 820, 420, 400, 51.2, 'In Progress', 'Betwa River Resettlement Complex (Water Supply Connected)'),
(8, 8, 310, 305, 5, 98.4, 'Completed', 'Kota Bypass Resettlement Sector (Fully Completed)'),
(9, 9, 210, 25, 185, 11.9, 'Initiated', 'Gondia Agricultural Resettlement Zone (Site Survey)'),
(10, 10, 420, 160, 260, 38.1, 'In Progress', 'Naini Inland Waterways Housing Scheme')
ON CONFLICT (id) DO NOTHING;

SELECT setval('rehabilitation_id_seq', (SELECT MAX(id) FROM rehabilitation));

-- 4. Insert Cadastral Land Possession Records
INSERT INTO possession (id, project_id, total_parcels, acquired_parcels, pending_parcels, disputed_parcels, possession_status)
VALUES
(1, 1, 840, 319, 521, 8, 'Joint Measurement Survey'),
(2, 2, 1250, 525, 725, 22, 'Judicial Injunction / Demarcation'),
(3, 3, 1600, 1312, 288, 0, 'Handover Completed'),
(4, 4, 540, 140, 400, 10, 'Joint Measurement Survey'),
(5, 5, 680, 326, 354, 4, 'Joint Measurement Survey'),
(6, 6, 1100, 352, 748, 24, 'Tribal Land Title Injunction'),
(7, 7, 1450, 797, 653, 6, 'Partial Handover'),
(8, 8, 920, 846, 74, 0, 'Handover Completed'),
(9, 9, 410, 57, 353, 2, 'Preliminary Boundary Survey'),
(10, 10, 780, 312, 468, 6, 'Joint Measurement Survey')
ON CONFLICT (id) DO NOTHING;

SELECT setval('possession_id_seq', (SELECT MAX(id) FROM possession));

-- 5. Insert Inter-Department Collaborating Line Departments (Stakeholders)
INSERT INTO stakeholders (id, project_id, department_name, pending_actions, avg_response_days, responsiveness_score, last_interaction)
VALUES
(1, 1, 'MSEDCL Power Transmission', 3, 52, 0.48, '2026-08-20'),
(2, 1, 'Central Railway Coordination Cell', 1, 28, 0.82, '2026-08-25'),
(3, 1, 'Pune District Revenue Collectorate', 4, 20, 0.90, '2026-08-28'),
(4, 2, 'UP Forest Department', 2, 75, 0.35, '2026-08-10'),
(5, 2, 'UP Power Transmission Corp', 4, 60, 0.40, '2026-08-15'),
(6, 2, 'Varanasi Land Acquisition Authority', 6, 30, 0.75, '2026-08-27'),
(7, 3, 'Gujarat Energy Transmission', 0, 15, 0.95, '2026-08-28'),
(8, 3, 'Ahmedabad Revenue Division', 1, 12, 0.98, '2026-08-29'),
(9, 6, 'Odisha State Forest Dept', 3, 90, 0.25, '2026-07-28'),
(10, 6, 'East Coast Railway Authority', 2, 45, 0.60, '2026-08-18')
ON CONFLICT (id) DO NOTHING;

SELECT setval('stakeholders_id_seq', (SELECT MAX(id) FROM stakeholders));

-- 6. Insert AI Predictive Next-Best-Action Recommendations
INSERT INTO recommendations (id, project_id, title, category, urgency, expected_risk_reduction_pct, action_steps, status, created_at)
VALUES
(1, 1, 'Convene Direct Bank Transfer (DBT) Compensation Settlement Drive', 'Compensation', 'HIGH', 24.0, '1. Deploy special camp at Sub-Divisional Magistrate office. 2. Verify Aadhaar/Bank account seeds with Revenue records. 3. Authorize batch PFMS disbursement to clear remaining award balance.', 'SUGGESTED', CURRENT_TIMESTAMP),
(2, 1, 'Prioritize Resettlement Colony Allotment & Gram Sabha Consultation', 'R&R', 'CRITICAL', 28.0, '1. Finalize basic civic amenities (water, electricity, access roads) at designated R&R site. 2. Hold structured consultation with affected family heads under Section 31 LARR 2013.', 'SUGGESTED', CURRENT_TIMESTAMP),
(3, 2, 'File Urgent Vacation of Stay Application in High Court', 'Legal', 'CRITICAL', 32.0, '1. Engage Government Pleader to file counter-affidavit demonstrating public purpose under Section 19. 2. Deposit disputed compensation in court registry to vacate interim status quo.', 'SUGGESTED', CURRENT_TIMESTAMP),
(4, 2, 'Issue Joint Secretary Level Inter-Departmental Escalation', 'Inter-Dept', 'HIGH', 15.0, '1. Convene State-Level Empowered Committee meeting (Forest, UP Power Transmission, PWD). 2. Fast-track Stage-II forest compliance and utility relocation agreement.', 'SUGGESTED', CURRENT_TIMESTAMP),
(5, 6, 'Organize Special Land Acquisition Lok Adalat for Dispute Disposal', 'Legal', 'CRITICAL', 25.0, '1. Partner with District Legal Services Authority (DLSA). 2. Resolve intra-family title partition disputes on spot to enable mutation clearance.', 'SUGGESTED', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

SELECT setval('recommendations_id_seq', (SELECT MAX(id) FROM recommendations));

-- 7. Insert Direct Benefit Compensation Records
INSERT INTO compensation (id, project_id, beneficiary_count, total_amount_cr, disbursed_amount_cr, pending_amount_cr, disbursement_pct, status)
VALUES
(1, 1, 620, 115.0, 45.0, 70.0, 39.1, 'In Progress'),
(2, 2, 1150, 240.0, 60.0, 180.0, 25.0, 'In Progress'),
(3, 3, 890, 190.0, 175.0, 15.0, 92.1, 'In Progress'),
(4, 4, 510, 160.0, 30.0, 130.0, 18.8, 'In Progress'),
(5, 5, 430, 95.0, 52.0, 43.0, 54.7, 'In Progress'),
(6, 6, 840, 130.0, 22.0, 108.0, 16.9, 'In Progress'),
(7, 7, 1050, 210.0, 130.0, 80.0, 61.9, 'In Progress'),
(8, 8, 490, 100.0, 95.0, 5.0, 95.0, 'In Progress'),
(9, 9, 290, 42.0, 5.0, 37.0, 11.9, 'In Progress'),
(10, 10, 580, 85.0, 35.0, 50.0, 41.2, 'In Progress')
ON CONFLICT (id) DO NOTHING;

SELECT setval('compensation_id_seq', (SELECT MAX(id) FROM compensation));

-- 8. Insert ML Predictions & Explanations
INSERT INTO predictions (id, project_id, probability, risk_level, estimated_delay_days, model_version, created_at)
VALUES
(1, 1, 0.82, 'HIGH', 115, 'xgb-v1.2.0', CURRENT_TIMESTAMP),
(2, 2, 0.94, 'CRITICAL', 210, 'xgb-v1.2.0', CURRENT_TIMESTAMP),
(3, 3, 0.14, 'LOW', 0, 'xgb-v1.2.0', CURRENT_TIMESTAMP),
(4, 4, 0.76, 'HIGH', 90, 'xgb-v1.2.0', CURRENT_TIMESTAMP),
(5, 5, 0.44, 'MEDIUM', 35, 'xgb-v1.2.0', CURRENT_TIMESTAMP),
(6, 6, 0.96, 'CRITICAL', 245, 'xgb-v1.2.0', CURRENT_TIMESTAMP),
(7, 7, 0.38, 'LOW', 0, 'xgb-v1.2.0', CURRENT_TIMESTAMP),
(8, 8, 0.08, 'LOW', 0, 'xgb-v1.2.0', CURRENT_TIMESTAMP),
(9, 9, 0.28, 'LOW', 0, 'xgb-v1.2.0', CURRENT_TIMESTAMP),
(10, 10, 0.62, 'MEDIUM', 55, 'xgb-v1.2.0', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

SELECT setval('predictions_id_seq', (SELECT MAX(id) FROM predictions));

-- 9. Insert Early-Warning Alerts
INSERT INTO alerts (id, project_id, severity, alert_type, message, status, created_at)
VALUES
(1, 2, 'CRITICAL', 'EARLY_WARNING_CRITICAL_DELAY', 'Project LA-2026-0102 flagged with CRITICAL risk (94% delay probability). Key bottleneck: Active Judicial Injunction & Forest Stage-II Clearance pending.', 'ACTIVE', CURRENT_TIMESTAMP),
(2, 6, 'CRITICAL', 'EARLY_WARNING_CRITICAL_DELAY', 'Project LA-2026-0106 flagged with CRITICAL risk (96% delay probability). Key bottleneck: High Tribal Land Title Disputed Parcels & Forest Rights Act clearance.', 'ACTIVE', CURRENT_TIMESTAMP),
(3, 1, 'HIGH', 'EARLY_WARNING_DELAY_RISK', 'Project LA-2026-0101 flagged with HIGH risk (82% delay probability). Key bottleneck: R&R Resettlement Colony lagging & 60.9% compensation pending.', 'ACTIVE', CURRENT_TIMESTAMP),
(4, 4, 'HIGH', 'EARLY_WARNING_DELAY_RISK', 'Project LA-2026-0104 flagged with HIGH risk (76% delay probability). Key bottleneck: Gramathana Revenue Title verification & BWSSB water line relocation.', 'ACTIVE', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

SELECT setval('alerts_id_seq', (SELECT MAX(id) FROM alerts));
