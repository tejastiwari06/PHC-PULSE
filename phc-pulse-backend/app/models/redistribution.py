"""
REDISTRIBUTION SUGGESTION MODEL - Ye tera UNIQUE feature hai
Jab ek PHC me medicine excess ho (expire hone wali) aur doosre PHC me shortage ho,
system automatically ek "suggestion" banata hai transfer ke liye.
"""
import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class RedistributionStatus(str, enum.Enum):
    SUGGESTED = "suggested"     # System ne suggest kiya, koi action nahi hua abhi
    APPROVED = "approved"       # District officer ne approve kar diya
    COMPLETED = "completed"     # Transfer ho gaya
    REJECTED = "rejected"


class RedistributionSuggestion(Base):
    __tablename__ = "redistribution_suggestions"

    id = Column(Integer, primary_key=True, index=True)

    medicine_name = Column(String, nullable=False)
    from_phc_id = Column(Integer, ForeignKey("phc_centers.id"), nullable=False)  # jiske paas excess hai
    to_phc_id = Column(Integer, ForeignKey("phc_centers.id"), nullable=False)    # jisko chahiye

    suggested_quantity = Column(Integer, nullable=False)
    reason = Column(String, nullable=True)  # e.g. "Expiring in 20 days, PHC B will run out in 3 days"

    status = Column(Enum(RedistributionStatus), default=RedistributionStatus.SUGGESTED)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
