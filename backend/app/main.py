"""
Main FastAPI Application Entry Point for SIH26017.
Predictive Analytics System for Early Detection of Land Acquisition Delays.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import engine, Base
from backend.app.seed import seed_database
from backend.app.routes import auth, projects, dashboard, alerts, actions, reports

# Create all database tables
Base.metadata.create_all(bind=engine)

# Auto seed if empty
seed_database()

app = FastAPI(
    title="SIH26017: Land Acquisition Delay Early Warning System",
    description="Decision-support platform for Ministry of Rural Development to predict delay probabilities, identify process bottlenecks, provide explainable risk factors, and track corrective interventions.",
    version="1.0.0"
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(dashboard.router)
app.include_router(alerts.router)
app.include_router(actions.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {
        "status": "online",
        "ministry": "Ministry of Rural Development",
        "problem_statement": "SIH26017",
        "system": "Predictive Analytics System for Early Detection of Land Acquisition Delays",
        "docs_url": "/docs",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
