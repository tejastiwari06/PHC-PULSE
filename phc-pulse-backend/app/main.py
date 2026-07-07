"""
MAIN APP - Ye file server start karti hai
Run karne ke liye: uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app import models  # sab models register karne ke liye

from app.routes import auth_routes, medicine_routes, redistribution_routes, operations_routes, phc_routes, dashboard_routes

app = FastAPI(
    title="PHC Pulse API",
    description="Smart Health backend - Medicine tracking, Redistribution engine, Footfall/Bed/Doctor management",
    version="1.0.0",
)

# CORS - isse koi bhi frontend (Antigravity se banaya hua bhi) is API ko call kar sakta hai
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production me isko specific frontend URL se replace karna
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sab tables create karo agar already nahi bane hain
Base.metadata.create_all(bind=engine)

# Sab routes register karo
app.include_router(auth_routes.router)
app.include_router(phc_routes.router)
app.include_router(medicine_routes.router)
app.include_router(redistribution_routes.router)
app.include_router(operations_routes.router)
app.include_router(dashboard_routes.router)


@app.get("/")
def root():
    return {"message": "PHC Pulse API is running. Docs available at /docs"}
