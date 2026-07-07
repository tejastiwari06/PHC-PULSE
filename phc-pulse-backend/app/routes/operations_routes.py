"""
OPERATIONS ROUTES - Footfall entry, prediction, bed status update, doctor QR check-in/out
"""
from datetime import date, datetime, timedelta
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_phc_staff
from app.models.user import User
from app.models.operations import PatientFootfall, BedStatus, DoctorAttendance

router = APIRouter(prefix="/api/operations", tags=["Operations"])


# ---------- Schemas ----------
class FootfallCreate(BaseModel):
    date: date
    patient_count: int
    symptom_tag: str | None = None
    symptom_count: int = 0


class BedUpdate(BaseModel):
    total_beds: int
    occupied_beds: int


class AttendanceCheckIn(BaseModel):
    phc_id: int


# ---------- Footfall ----------
@router.post("/footfall")
def add_footfall(payload: FootfallCreate, db: Session = Depends(get_db), current_user: User = Depends(require_phc_staff)):
    record = PatientFootfall(phc_id=current_user.phc_id, **payload.model_dump())
    db.add(record)
    db.commit()
    return {"message": "Footfall record ho gaya"}


@router.get("/footfall/predict")
def predict_next_day_footfall(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Simple moving average - pichle 7 din ka average nikal ke kal ka estimate deta hai"""
    cutoff = date.today() - timedelta(days=7)
    records = (
        db.query(PatientFootfall)
        .filter(PatientFootfall.phc_id == current_user.phc_id, PatientFootfall.date >= cutoff)
        .all()
    )
    if not records:
        return {"predicted_count": None, "message": "Itna data nahi hai prediction ke liye"}

    avg = sum(r.patient_count for r in records) / len(records)
    return {"predicted_count": round(avg), "based_on_days": len(records)}


# ---------- Bed Status ----------
@router.put("/beds")
def update_bed_status(payload: BedUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_phc_staff)):
    bed = db.query(BedStatus).filter(BedStatus.phc_id == current_user.phc_id).first()
    if not bed:
        bed = BedStatus(phc_id=current_user.phc_id, **payload.model_dump())
        db.add(bed)
    else:
        bed.total_beds = payload.total_beds
        bed.occupied_beds = payload.occupied_beds
    db.commit()
    return {"message": "Bed status update ho gaya"}


# ---------- Doctor Attendance ----------
@router.post("/attendance/check-in")
def doctor_check_in(payload: AttendanceCheckIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(DoctorAttendance).filter(
        DoctorAttendance.doctor_user_id == current_user.id,
        DoctorAttendance.date == date.today(),
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Aaj already check-in ho chuka hai")

    record = DoctorAttendance(
        doctor_user_id=current_user.id,
        phc_id=payload.phc_id,
        check_in_time=datetime.utcnow(),
        date=date.today(),
    )
    db.add(record)
    db.commit()
    return {"message": "Check-in successful"}


@router.post("/attendance/check-out")
def doctor_check_out(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = db.query(DoctorAttendance).filter(
        DoctorAttendance.doctor_user_id == current_user.id,
        DoctorAttendance.date == date.today(),
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Aaj check-in nahi mila")

    record.check_out_time = datetime.utcnow()
    db.commit()
    return {"message": "Check-out successful"}
