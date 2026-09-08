# SIH26017: pgAdmin 4 Integration & Database Management Guide
## PostgreSQL Setup with Zero External Extensions (No PostGIS Required)

---

## 💡 Important Note on PostGIS vs Standard PostgreSQL

> [!NOTE]
> **You DO NOT need the PostGIS extension!**
> The application stores project geo-coordinates as standard `latitude` and `longitude` (`DOUBLE PRECISION` / float fields) in PostgreSQL. The frontend interactive map (Leaflet GIS) natively reads these coordinates to plot high-risk markers and district boundaries across India without requiring any third-party C-extensions.

---

## 🎯 What You Can Do in pgAdmin 4:
- 📊 Inspect and query all 14 database tables (`projects`, `stages`, `documents`, `rehabilitation`, `possession`, `stakeholders`, `recommendations`, `predictions`, `alerts`, `users`).
- ⚡ Run SQL queries in the built-in **Query Tool** to view land acquisition delay statistics.
- 🔄 Run DDL migrations ([`schema_postgres.sql`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/schema_postgres.sql)) and load dummy datasets ([`seed_postgres_data.sql`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/seed_postgres_data.sql)).
- 📈 Monitor database connection pools, table locks, and index utilization in real-time.

---

## 🚀 Setup Steps in pgAdmin 4

### Step 1: Open pgAdmin 4 & Connect to your Database
1. Open pgAdmin 4.
2. In the left panel, expand `Servers` ➔ `PostgreSQL` (enter your master password if prompted).
3. Right-click **Databases** ➔ **Create** ➔ **Database...**
   - Database Name: `sih26017`
   - Click **Save**.

---

### Step 2: Create Tables (Run Pure Standard SQL Schema)
1. Right-click database `sih26017` ➔ click **Query Tool**.
2. Open the file [`backend/app/schema_postgres.sql`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/schema_postgres.sql).
3. Copy and paste the entire script into the Query Tool.
4. Press **F5** (or click the ▶️ Execute button).
5. *Output: All 14 tables and indexes created successfully with zero errors!*

---

### Step 3: Load Dummy Data (Run Demo Seed Script)
1. Open [`backend/app/seed_postgres_data.sql`](file:///C:/Users/omkar/.gemini/antigravity/scratch/sih26017-land-acquisition/backend/app/seed_postgres_data.sql).
2. Copy and paste into the Query Tool.
3. Press **F5** (or click the ▶️ Execute button).
4. *Output: 10 flagship infrastructure projects, 5 user accounts, R&R registers, and recommendations loaded!*

---

### Step 4: Verify Tables & Query Live Data in pgAdmin
Copy and paste this test query in the Query Tool:

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
    r.progress_pct AS rr_completion_pct
FROM projects p
JOIN predictions pr ON p.id = pr.project_id
LEFT JOIN rehabilitation r ON p.id = r.project_id
ORDER BY pr.probability DESC;
```
