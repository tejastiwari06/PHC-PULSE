"""
USER MODEL - Login karne wale sabhi log (PHC staff + District officer) isi table me hain
'role' column decide karta hai kisko kya dikhega
"""
import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class UserRole(str, enum.Enum):
    PHC_STAFF = "phc_staff"
    DISTRICT_OFFICER = "district_officer"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)

    # Agar PHC staff hai, to wo kis PHC se belong karta hai (District officer ke liye ye NULL rahega)
    phc_id = Column(Integer, ForeignKey("phc_centers.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    phc = relationship("PHCCenter", back_populates="staff_members")
