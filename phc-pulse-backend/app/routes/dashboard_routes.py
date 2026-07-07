"""
DASHBOARD ROUTE - District officer ka combined view - sab PHC ka data ek saath
Ye "scale" wala pitch hai - single PHC tool nahi, poore district ka system
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_district_officer
from app.models.user import User
from app.models.phc_center import PHCCenter
from app.models.medicine import Medicine
from app.models.operations import BedStatus, DoctorAttendance
from app.models.redistribution import RedistributionSuggestion, RedistributionStatus
from app.services.prediction_service import calculate_days_remaining
from app.core.config import settings
from datetime import date

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/district-overview")
def district_overview(db: Session = Depends(get_db), current_user: User = Depends(require_district_officer)):
    """Har PHC ka summary ek saath - critical stock, bed occupancy %, doctor attendance %, pending transfers"""
    phcs = db.query(PHCCenter).all()
    overview = []

    for phc in phcs:
        medicines = db.query(Medicine).filter(Medicine.phc_id == phc.id).all()
        critical_stock_count = sum(
            1 for m in medicines
            if (calculate_days_remaining(db, m) or 999) < settings.LOW_STOCK_DAYS_THRESHOLD
        )

        bed = db.query(BedStatus).filter(BedStatus.phc_id == phc.id).first()
        occupancy_pct = round((bed.occupied_beds / bed.total_beds) * 100, 1) if bed and bed.total_beds else None

        today_attendance = db.query(DoctorAttendance).filter(
            DoctorAttendance.phc_id == phc.id, DoctorAttendance.date == date.today()
        ).count()

        pending_transfers = db.query(RedistributionSuggestion).filter(
            (RedistributionSuggestion.from_phc_id == phc.id) | (RedistributionSuggestion.to_phc_id == phc.id),
            RedistributionSuggestion.status == RedistributionStatus.SUGGESTED,
        ).count()

        overview.append({
            "phc_id": phc.id,
            "phc_name": phc.name,
            "district": phc.district,
            "critical_stock_medicines": critical_stock_count,
            "bed_occupancy_percent": occupancy_pct,
            "doctors_checked_in_today": today_attendance,
            "pending_redistribution_transfers": pending_transfers,
        })

    return overview
