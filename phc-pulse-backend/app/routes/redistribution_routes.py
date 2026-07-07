"""
REDISTRIBUTION SCHEMAS + ROUTES
District officer ye dekhega aur approve/reject karega
"""
from pydantic import BaseModel
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_district_officer
from app.models.user import User
from app.models.redistribution import RedistributionSuggestion, RedistributionStatus
from app.services.redistribution_engine import generate_redistribution_suggestions


class RedistributionResponse(BaseModel):
    id: int
    medicine_name: str
    from_phc_id: int
    to_phc_id: int
    suggested_quantity: int
    reason: str | None
    status: RedistributionStatus
    created_at: datetime

    class Config:
        from_attributes = True


router = APIRouter(prefix="/api/redistribution", tags=["Redistribution"])


@router.post("/generate", response_model=list[RedistributionResponse])
def run_redistribution_engine(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_district_officer),
):
    """
    Ye endpoint call karne se engine chalega aur naye suggestions banega.
    Real deployment me ye roz automatically (cron job) chal sakta hai,
    but demo/hackathon ke liye manual trigger rakha hai.
    """
    return generate_redistribution_suggestions(db)


@router.get("/all", response_model=list[RedistributionResponse])
def list_all_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_district_officer),
):
    return db.query(RedistributionSuggestion).order_by(RedistributionSuggestion.created_at.desc()).all()


@router.patch("/{suggestion_id}/status", response_model=RedistributionResponse)
def update_suggestion_status(
    suggestion_id: int,
    new_status: RedistributionStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_district_officer),
):
    suggestion = db.query(RedistributionSuggestion).filter(RedistributionSuggestion.id == suggestion_id).first()
    suggestion.status = new_status
    db.commit()
    db.refresh(suggestion)
    return suggestion
