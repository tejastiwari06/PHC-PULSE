"""
MEDICINE MODEL - Har PHC ka current medicine stock
STOCK_TRANSACTION - Daily consumption ka log (isi se hum "days remaining" calculate karte hain)
"""
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    phc_id = Column(Integer, ForeignKey("phc_centers.id"), nullable=False)

    name = Column(String, nullable=False, index=True)       # e.g. "Paracetamol 500mg"
    current_quantity = Column(Integer, nullable=False, default=0)
    unit = Column(String, default="tablets")                 # tablets / bottles / strips
    expiry_date = Column(Date, nullable=True)

    # OCR se aaya to Gemini Vision ka confidence score store karte hain (0-100)
    # Isse UI pe "85% confident" jaisa dikha sakte hain - fake accuracy claim nahi karni
    last_ocr_confidence = Column(Float, nullable=True)
    source = Column(String, default="manual")  # "manual" ya "ocr_scan"

    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    phc = relationship("PHCCenter", back_populates="medicines")
    transactions = relationship("StockTransaction", back_populates="medicine")


class StockTransaction(Base):
    """
    Har baar jab medicine use hoti hai (ya naya stock aata hai), ek entry yaha banti hai.
    Isi history se hum depletion rate (roz kitni consume ho rahi hai) nikalte hain.
    """
    __tablename__ = "stock_transactions"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)

    change_amount = Column(Integer, nullable=False)   # negative = consumed, positive = restocked
    transaction_type = Column(String, nullable=False)  # "consumption", "restock", "transfer_in", "transfer_out"
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    medicine = relationship("Medicine", back_populates="transactions")
