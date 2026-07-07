"""
OPERATIONS MODELS - Patient footfall, Bed status, Doctor attendance
Ye teeno "secondary" features hain (redistribution jitna unique nahi), simple aur clean rakhe hain
"""
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.core.database import Base


class PatientFootfall(Base):
    """Roz kitne patient aaye - isi se hum agle din ka prediction nikalte hain"""
    __tablename__ = "patient_footfall"

    id = Column(Integer, primary_key=True, index=True)
    phc_id = Column(Integer, ForeignKey("phc_centers.id"), nullable=False)
    date = Column(Date, nullable=False)
    patient_count = Column(Integer, nullable=False)

    # Outbreak detection ke liye - symptom tag (optional feature agar time bache)
    symptom_tag = Column(String, nullable=True)  # e.g. "fever", "vomiting", "rash"
    symptom_count = Column(Integer, default=0)


class BedStatus(Base):
    """Har PHC ke beds ka current status"""
    __tablename__ = "bed_status"

    id = Column(Integer, primary_key=True, index=True)
    phc_id = Column(Integer, ForeignKey("phc_centers.id"), nullable=False)
    total_beds = Column(Integer, nullable=False)
    occupied_beds = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())


class DoctorAttendance(Base):
    """QR scan se doctor check-in/check-out"""
    __tablename__ = "doctor_attendance"

    id = Column(Integer, primary_key=True, index=True)
    doctor_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    phc_id = Column(Integer, ForeignKey("phc_centers.id"), nullable=False)

    check_in_time = Column(DateTime(timezone=True), nullable=True)
    check_out_time = Column(DateTime(timezone=True), nullable=True)
    date = Column(Date, nullable=False)
