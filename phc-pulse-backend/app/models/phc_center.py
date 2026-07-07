"""
PHC CENTER MODEL - Har PHC/CHC clinic ki basic details
Ye "hub" table hai - medicine, patients, doctors sab isi PHC se linked honge
"""
from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


class PHCCenter(Base):
    __tablename__ = "phc_centers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)              # e.g. "PHC Dadri"
    district = Column(String, nullable=False, index=True)  # e.g. "Gautam Buddha Nagar"
    state = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)             # Redistribution ke liye distance calculate karne ke kaam aayega
    longitude = Column(Float, nullable=True)
    total_beds = Column(Integer, default=0)

    staff_members = relationship("User", back_populates="phc")
    medicines = relationship("Medicine", back_populates="phc")
