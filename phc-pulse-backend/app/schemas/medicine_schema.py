"""
MEDICINE SCHEMAS - Stock entry aur OCR response ka format
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class MedicineCreate(BaseModel):
    name: str
    current_quantity: int
    unit: str = "tablets"
    expiry_date: Optional[date] = None


class MedicineResponse(BaseModel):
    id: int
    phc_id: int
    name: str
    current_quantity: int
    unit: str
    expiry_date: Optional[date] = None
    last_ocr_confidence: Optional[float] = None
    source: str
    days_remaining: Optional[float] = None  # ye prediction engine calculate karega, DB me store nahi hota

    class Config:
        from_attributes = True


class OCRExtractedItem(BaseModel):
    """OCR scan se ek medicine ka result - confirm hone se pehle staff ko dikhega"""
    name: str
    quantity: int
    confidence: float  # 0-100, honest reporting - fake 95% claim nahi karte
    expiry_date: Optional[date] = None


class StockConsumption(BaseModel):
    medicine_id: int
    quantity_used: int
