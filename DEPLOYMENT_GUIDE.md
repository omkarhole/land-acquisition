# 🚀 SIH26017: Production Deployment Guide
## Complete Step-by-Step Instructions to Deploy Your SIH Project Live

This guide provides 3 proven deployment methods tailored for Smart India Hackathon (SIH) presentations and production:

1. **Option A (Recommended for Hackathon Jury)**: **Cloud Deployment** (Backend on Render + Frontend on Vercel + PostgreSQL) — 100% Free, gives HTTPS URLs for judges to open on any phone/laptop.
2. **Option B (All-in-One Container)**: **Docker Compose Stack** — Deploys DB, Backend, Frontend, and pgAdmin with a single command on any VPS / AWS EC2 / Local machine.
3. **Option C (Quick 2-Minute Demo)**: **Localhost + Public Cloud Tunnel** (via LocalTunnel/ngrok) — Zero cloud setup required.

---

## 🌐 Option A: Full Cloud Deployment (Render + Vercel)

### Architecture
* **Frontend**: Vercel (Fast Global CDN, Auto SSL, SPA Routing enabled via `vercel.json`)
* **Backend**: Render (FastAPI Web Service with Python 3.11, ML Pipeline auto-trained on boot)
* **Database**: Render Managed PostgreSQL (Free Tier) or Neon / Supabase

---

### Step 1: Push Code to GitHub
1. In your project root, make sure your git repository is clean:
   ```bash
   git add .
   git commit -m "Prepare project for cloud deployment"
   ```
2. Create a new repository on [GitHub](https://github.com/new) named `sih26017-land-acquisition`.
3. Push your code:
   ```bash
   git remote add origin https://github.com/<your-username>/sih26017-land-acquisition.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Deploy Cloud PostgreSQL Database (Render)
1. Go to [Render.com](https://render.com) and sign in with GitHub.
2. Click **New +** → **PostgreSQL**.
3. Fill in details:
   - **Name**: `sih26017-db`
   - **Database**: `sih26017`
   - **User**: `sih_user`
   - **Region**: Singapore or Frankfurt (closest to India)
   - **Plan**: Free
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL** (if deploying backend on Render) or **External Database URL**.

---

### Step 3: Deploy FastAPI Backend (Render)
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository: `sih26017-land-acquisition`.
3. Configure the service:
   - **Name**: `sih26017-backend`
   - **Language**: `Python 3`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave blank (uses repo root)
   - **Build Command**:
     ```bash
     pip install -r backend/requirements.txt && python ml/data/generate_dataset.py && python ml/src/train.py
     ```
   - **Start Command**:
     ```bash
     uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: Free
4. Add **Environment Variables**:
   | Variable | Value |
   | :--- | :--- |
   | `DATABASE_URL` | *(Paste your Render PostgreSQL URL from Step 2)* |
   | `JWT_SECRET` | `sih26017_super_secret_production_key_2026` |
   | `PYTHON_VERSION` | `3.11.9` |
5. Click **Deploy Web Service**.
6. When deployment finishes, test your backend by opening:
   `https://sih26017-backend.onrender.com/docs`
   *(You should see the interactive Swagger API documentation)*

---

### Step 4: Deploy React Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** → **Project**.
3. Import your `sih26017-land-acquisition` repository.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables**:
   - Add:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://sih26017-backend.onrender.com` *(Your Render backend URL from Step 3 without trailing slash)*
6. Click **Deploy**.
7. In ~60 seconds, Vercel will give you a live production URL:
   `https://sih26017-land-acquisition.vercel.app`

---

## 🐳 Option B: 1-Click Docker Compose Deployment

If you want to deploy to a VPS (e.g. AWS EC2, DigitalOcean, Google Compute Engine) or present locally using Docker:

### Prerequisites
* Docker Desktop or Docker Engine installed (`docker --version`, `docker compose version`).

### Steps
1. Navigate to the project root:
   ```bash
   cd sih26017-land-acquisition
   ```
2. Create your `.env` file if not present:
   ```bash
   cp .env.example .env
   ```
3. Start the entire containerized stack:
   ```bash
   docker compose up --build -d
   ```
4. Verify all 4 containers are running:
   ```bash
   docker compose ps
   ```
   Outputs:
   - `sih26017_postgres` (Port 5432) — Database with schema auto-applied
   - `sih26017_pgadmin` (Port 5050) — Web DB Management
   - `sih26017_backend` (Port 8000) — FastAPI + ML Models
   - `sih26017_frontend` (Port 5173) — Nginx serving React App

5. Access the services in your browser:
   - **Application Frontend**: `http://localhost:5173`
   - **FastAPI Interactive Docs**: `http://localhost:8000/docs`
   - **pgAdmin 4 Dashboard**: `http://localhost:5050`
     - Email: `admin@sih.gov.in`
     - Password: `admin123`

---

## ⚡ Option C: 2-Minute Public Demo Tunnel (ngrok / LocalTunnel)

If you are running the project on your laptop and want the SIH evaluators to view it live on their phones/laptops without setting up cloud servers:

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev -- --host
   ```

3. **Expose with LocalTunnel** (Terminal 3):
   ```bash
   npx localtunnel --port 5173
   ```
   You will get a public URL like:
   `https://mighty-elephant-42.loca.lt`
   *(Anyone on the internet can open this URL and test your app live)*

---

## 🔑 Demo Login Credentials for Evaluators

When presenting to SIH judges, use these pre-seeded role personas:

| Official Persona | Email | Password | Role / Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@sih.gov.in` | `password123` | Full Administrative & Governance Controls |
| **Land Acquisition Officer (LAO)** | `officer@sih.gov.in` | `password123` | Field Operations, Stages & Compensation |
| **District Magistrate (Collector)** | `district@sih.gov.in` | `password123` | Early-Warning Alerts, Action Approvals |
| **Ministry Secretary (MoRD)** | `director@sih.gov.in` | `password123` | High-Level Executive Dashboard & KPIs |
| **ML & Policy Analyst** | `analyst@sih.gov.in` | `password123` | What-If Simulator & Model Governance |

*Tip: The navbar also includes a **Fast Role Switcher** dropdown for quick role switching during the presentation.*

---

## 🛡️ Pre-Flight Verification Checklist Before Jury Demo

- [ ] Backend health check responds: `GET /` returns `"status": "online"`
- [ ] Database contains 10 flagship infrastructure projects seeded
- [ ] ML predictions load on Project Detail page with XAI factor explanations
- [ ] "What-If Policy Simulator" slider updates risk delta in real time
- [ ] "Complete & Re-Score" on Interventions page calculates risk reduction
- [ ] Direct URLs like `/alerts`, `/map`, `/governance` reload without 404
