"""
PHC CENTER ROUTES - PHC add karna aur list dekhna (district officer isse PHCs register karega)
"""
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_district_officer, get_current_user
from app.models.user import User
from app.models.phc_center import PHCCenter

router = APIRouter(prefix="/api/phc-centers", tags=["PHC Centers"])


class PHCCreate(BaseModel):
    name: str
    district: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_beds: int = 0


class PHCResponse(PHCCreate):
    id: int

    class Config:
        from_attributes = True


@router.post("/", response_model=PHCResponse)
def create_phc(payload: PHCCreate, db: Session = Depends(get_db), current_user: User = Depends(require_district_officer)):
    phc = PHCCenter(**payload.model_dump())
    db.add(phc)
    db.commit()
    db.refresh(phc)
    return phc


@router.get("/", response_model=list[PHCResponse])
def list_phcs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(PHCCenter).all()
