# SIH26017: pgAdmin 4 Integration & Database Management Guide
## Step-by-Step Guide for PostgreSQL + pgAdmin 4 Setup with Demo Data

This guide explains how to connect and manage the **SIH26017 Land Acquisition Delay Early Warning System** database using **pgAdmin 4** (the official GUI administration tool for PostgreSQL).

---

## 🎯 What You Can Do in pgAdmin 4:
- 📊 Inspect and query all 14 database tables (`projects`, `stages`, `documents`, `rehabilitation`, `possession`, `stakeholders`, `recommendations`, `predictions`, `alerts`, `users`).
- ⚡ Run SQL queries in the built-in **Query Tool** to view land acquisition delay statistics.
- 🔄 Run DDL migrations (`schema_postgres.sql`) and load dummy/seed datasets (`seed_postgres_data.sql`).
- 📈 Monitor database connection pools, table locks, and index utilization in real-time.

---

## 🚀 Choose Your Preferred Setup Method

### 🌟 METHOD A: 1-Click pgAdmin 4 via Docker Compose (Zero Installation)

If you use Docker, a web-based pgAdmin 4 container is pre-configured and ready to run with zero local installation:

#### 1. Start the Stack (PostgreSQL + pgAdmin 4 + FastAPI + React)
```bash
cd sih26017-land-acquisition
docker-compose up -d
```

#### 2. Open pgAdmin 4 in Browser
- URL: **[http://localhost:5050](http://localhost:5050)**
- **Email**: `admin@sih.gov.in`
- **Password**: `admin123`

#### 3. Connect to the PostgreSQL Database in pgAdmin:
1. In the left sidebar, right-click **Servers** ➔ **Register** ➔ **Server...**
2. **General Tab**:
   - Name: `SIH26017 Land Acquisition DB`
3. **Connection Tab**:
   - **Host name/address**: `db` *(when inside docker)* or `localhost`
   - **Port**: `5432`
   - **Maintenance database**: `sih26017`
   - **Username**: `app`
   - **Password**: `postgres_password_2026`
   - Check **Save password?**
4. Click **Save**.

---

### 💻 METHOD B: Connecting Standalone pgAdmin 4 Desktop to Local PostgreSQL

If you have PostgreSQL and pgAdmin 4 desktop application installed on Windows/Linux/Mac:

#### 1. Launch pgAdmin 4 Desktop
Open the pgAdmin 4 desktop application from your start menu.

#### 2. Register New PostgreSQL Server
1. In the Browser panel (left tree view), right-click on **Servers** ➔ **Register** ➔ **Server...**
2. In the modal, fill in the connection details:

| Tab | Field | Value |
| :--- | :--- | :--- |
| **General** | **Name** | `SIH26017 Local DB` |
| **Connection** | **Host name/address** | `localhost` or `127.0.0.1` |
| **Connection** | **Port** | `5432` |
| **Connection** | **Maintenance database** | `sih26017` (or `postgres` if creating fresh) |
| **Connection** | **Username** | `app` (or your postgres superuser `postgres`) |
| **Connection** | **Password** | `postgres_password_2026` (or your PostgreSQL password) |

3. Click **Save**.

---

## 🗄️ Loading Schema & Dummy Data in pgAdmin 4

If you need to initialize the tables and seed data manually through pgAdmin's GUI:

### Step 1: Create the Database
1. In pgAdmin, right-click **Databases** ➔ **Create** ➔ **Database...**
2. Database Name: `sih26017`
3. Owner: `app` (or `postgres`)
4. Click **Save**.

### Step 2: Open the Query Tool
1. In the left tree, expand `Servers` ➔ `SIH26017 DB` ➔ `Databases` ➔ `sih26017`.
2. Click on **Tools** in the top menu ➔ **Query Tool** (or click the database and press `Alt + Shift + Q`).

### Step 3: Execute the Schema DDL Script
1. Open the file [`backend/app/schema_postgres.sql`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/schema_postgres.sql) in any text editor.
2. Copy and paste the entire SQL content into the pgAdmin Query Tool editor.
3. Click the **Execute / Play** button (▶️) or press `F5`.
4. *Message panel will confirm: "CREATE TABLE commands executed successfully."*

### Step 4: Execute the Dummy Seed Data Script
1. Open the file [`backend/app/seed_postgres_data.sql`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/seed_postgres_data.sql).
2. Copy and paste the script into the pgAdmin Query Tool.
3. Click the **Execute / Play** button (▶️) or press `F5`.
4. *All 10 flagship infrastructure projects, R&R registers, possession parcels, stakeholder responsiveness data, and demo user accounts are now loaded into PostgreSQL!*

---

## 🔍 Useful SQL Queries to Run in pgAdmin 4

Copy and paste these queries into the **Query Tool** to inspect the live dataset:

### 1. View High-Risk & Critical Land Acquisition Projects:
```sql
SELECT 
    p.project_code,
    p.title,
    p.state,
    p.district,
    p.current_stage,
    p.overall_progress_pct,
    pr.probability AS delay_probability,
    pr.risk_level,
    pr.estimated_delay_days
FROM projects p
JOIN predictions pr ON p.id = pr.project_id
ORDER BY pr.probability DESC;
```

### 2. View Rehabilitation & Resettlement (R&R) Progress:
```sql
SELECT 
    p.project_code,
    p.title,
    r.total_families,
    r.families_rehabilitated,
    r.pending_cases,
    r.progress_pct AS rr_completion_pct,
    r.status AS rr_status,
    r.resettlement_site_status
FROM projects p
JOIN rehabilitation r ON p.id = r.project_id
ORDER BY r.progress_pct ASC;
```

### 3. View Cadastral Land Possession & Disputed Parcels:
```sql
SELECT 
    p.project_code,
    p.district,
    pos.total_parcels,
    pos.acquired_parcels,
    pos.pending_parcels,
    pos.disputed_parcels,
    pos.possession_status
FROM projects p
JOIN possession pos ON p.id = pos.project_id
ORDER BY pos.disputed_parcels DESC;
```

### 4. View Inter-Departmental Collaborating Line Departments (Stakeholders):
```sql
SELECT 
    p.project_code,
    s.department_name,
    s.pending_actions,
    s.avg_response_days,
    ROUND((s.responsiveness_score * 100)::numeric, 1) AS responsiveness_pct
FROM projects p
JOIN stakeholders s ON p.id = s.project_id
ORDER BY s.responsiveness_score ASC;
```

### 5. View AI Predictive Next-Best-Action Recommendations:
```sql
SELECT 
    p.project_code,
    r.title,
    r.category,
    r.urgency,
    r.expected_risk_reduction_pct,
    r.status
FROM projects p
JOIN recommendations r ON p.id = r.project_id;
```

---

## 🔗 Connecting the FastAPI Backend to PostgreSQL

Once PostgreSQL is running and verified in pgAdmin:

1. In your project root, create/update `.env`:
```ini
DATABASE_URL=postgresql://app:postgres_password_2026@localhost:5432/sih26017
JWT_SECRET=sih26017_ministry_rural_dev_secret_key_2026_x7a9q2
```

2. Start the backend:
```powershell
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

3. Any changes made in the React frontend (approving documents, adding actions, updating R&R) will instantly reflect in pgAdmin when you query the tables!

---

## 🛠️ Troubleshooting pgAdmin 4 Connections

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Connection refused on port 5432** | PostgreSQL service is not running | Start PostgreSQL from Windows Services or run `docker-compose up -d db` |
| **FATAL: password authentication failed** | Incorrect password in Connection tab | Verify password matches `postgres_password_2026` or your postgres root password |
| **FATAL: database "sih26017" does not exist** | Database not created yet | Connect to maintenance DB `postgres`, then right-click Databases ➔ Create Database `sih26017` |
| **Docker pgAdmin cannot reach `localhost`** | Inside Docker, `localhost` refers to pgadmin container | In pgAdmin connection settings, use Host `db` instead of `localhost` |
