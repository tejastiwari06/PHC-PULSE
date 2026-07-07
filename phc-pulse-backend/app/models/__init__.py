"""
Ye file saare models ko ek jagah import karti hai
Isse database create_all() call karte waqt sab tables ban jayenge
"""
from app.models.user import User, UserRole
from app.models.phc_center import PHCCenter
from app.models.medicine import Medicine, StockTransaction
from app.models.redistribution import RedistributionSuggestion, RedistributionStatus
from app.models.operations import PatientFootfall, BedStatus, DoctorAttendance
