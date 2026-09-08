-- SIH26017: PostgreSQL + PostGIS Production Schema
-- Decision-Support System for Land Acquisition Delays (Ministry of Rural Development)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- PostGIS extension for cadastral geospatial analytics (if PostGIS image is used)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users & RBAC
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- admin, officer, district, director, analyst
    designation VARCHAR(100),
    state VARCHAR(100),
    district VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects Core Entity
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    project_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    project_type VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'Normal',
    land_area_hectares DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    affected_owner_count INTEGER NOT NULL DEFAULT 0,
    household_count INTEGER NOT NULL DEFAULT 0,
    project_value_cr DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    compensation_offered_cr DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    compensation_paid_cr DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'In Progress',
    current_stage VARCHAR(100) DEFAULT 'Stage 1: Preliminary Survey & SIA',
    overall_progress_pct DOUBLE PRECISION DEFAULT 0.0,
    objection_count INTEGER DEFAULT 0,
    ownership_conflict_count INTEGER DEFAULT 0,
    court_stay_flag BOOLEAN DEFAULT FALSE,
    utility_shift_pending BOOLEAN DEFAULT FALSE,
    forest_clearance_pending BOOLEAN DEFAULT FALSE,
    railway_crossing_pending BOOLEAN DEFAULT FALSE,
    district_delay_rate DOUBLE PRECISION DEFAULT 0.25,
    past_delay_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_state_district ON projects(state, district);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(project_code);

-- 3. LARR 2013 Statutory Stages
CREATE TABLE IF NOT EXISTS stages (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage_order INTEGER NOT NULL,
    stage_name VARCHAR(150) NOT NULL,
    start_date DATE,
    target_date DATE,
    completion_date DATE,
    status VARCHAR(50) DEFAULT 'Pending',
    days_in_stage INTEGER DEFAULT 0,
    remarks TEXT
);

-- 4. Regulatory Documents Dossier
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    remarks TEXT,
    uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Compensation Direct Benefit Records
CREATE TABLE IF NOT EXISTS compensation (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    beneficiary_count INTEGER DEFAULT 0,
    total_amount_cr DOUBLE PRECISION DEFAULT 0.0,
    disbursed_amount_cr DOUBLE PRECISION DEFAULT 0.0,
    pending_amount_cr DOUBLE PRECISION DEFAULT 0.0,
    disbursement_pct DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'In Progress',
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Rehabilitation & Resettlement (R&R)
CREATE TABLE IF NOT EXISTS rehabilitation (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    total_families INTEGER DEFAULT 0,
    families_rehabilitated INTEGER DEFAULT 0,
    pending_cases INTEGER DEFAULT 0,
    progress_pct DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'Initiated',
    resettlement_site_status VARCHAR(100) DEFAULT 'Site Identification Underway',
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Cadastral Land Possession & Disputed Parcels
CREATE TABLE IF NOT EXISTS possession (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    total_parcels INTEGER DEFAULT 0,
    acquired_parcels INTEGER DEFAULT 0,
    pending_parcels INTEGER DEFAULT 0,
    disputed_parcels INTEGER DEFAULT 0,
    possession_status VARCHAR(50) DEFAULT 'Pending',
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Inter-Departmental Collaborating Line Departments (Stakeholders)
CREATE TABLE IF NOT EXISTS stakeholders (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    department_name VARCHAR(100) NOT NULL,
    pending_actions INTEGER DEFAULT 0,
    avg_response_days INTEGER DEFAULT 30,
    responsiveness_score DOUBLE PRECISION DEFAULT 0.8,
    last_interaction DATE
);

-- 9. AI Predictive Recommendations Engine
CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) DEFAULT 'Administrative',
    urgency VARCHAR(20) DEFAULT 'HIGH',
    expected_risk_reduction_pct DOUBLE PRECISION DEFAULT 0.0,
    action_steps TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'SUGGESTED',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. ML Predictions & Explanations
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    probability DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    estimated_delay_days INTEGER DEFAULT 0,
    model_version VARCHAR(50) DEFAULT 'xgb-v1.2.0',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS explanations (
    id SERIAL PRIMARY KEY,
    prediction_id INTEGER NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    feature_label VARCHAR(150) NOT NULL,
    value_display VARCHAR(100),
    contribution DOUBLE PRECISION DEFAULT 0.0,
    direction VARCHAR(10) DEFAULT 'up',
    impact_text TEXT
);

-- 11. Early Warning Alerts & Corrective Actions
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    severity VARCHAR(30) DEFAULT 'HIGH',
    alert_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS actions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    outcome TEXT,
    initial_risk DOUBLE PRECISION,
    post_action_risk DOUBLE PRECISION,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Security Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(120) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    details TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
