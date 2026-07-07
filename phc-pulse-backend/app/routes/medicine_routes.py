"""
MEDICINE ROUTES - Stock scan, manual entry, list dekhna, consumption log karna
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.core.database import get_db
from app.core.deps import get_current_user, require_phc_staff
from app.models.user import User
from app.models.medicine import Medicine, StockTransaction
from app.schemas.medicine_schema import MedicineCreate, MedicineResponse, StockConsumption
from app.services.ocr_service import extract_stock_from_image
from app.services.prediction_service import calculate_days_remaining

router = APIRouter(prefix="/api/medicines", tags=["Medicines"])


@router.post("/scan")
async def scan_stock_register(
    file: UploadFile = File(...),
    current_user: User = Depends(require_phc_staff),
):
    """
    Staff register ki photo upload karega. Ye SIRF extract karke dikhata hai -
    database me save NAHI hota jab tak staff confirm na kare (/confirm-scan endpoint se).
    Ye human-in-the-loop verification hai - AI ka decision final nahi hota.
    """
    image_bytes = await file.read()
    extracted_items = extract_stock_from_image(image_bytes, mime_type=file.content_type)

    if not extracted_items:
        raise HTTPException(status_code=422, detail="Image se koi medicine entry nahi padh paya, saaf photo try karein")

    return {"extracted_items": extracted_items, "message": "Confirm karne ke liye /confirm-scan use karein"}


@router.post("/confirm-scan", response_model=list[MedicineResponse])
def confirm_scan(
    items: list[MedicineCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_phc_staff),
):
    """Staff ne OCR result verify/edit karke confirm kar diya - ab actual save hoga"""
    saved = []
    for item in items:
        medicine = Medicine(
            phc_id=current_user.phc_id,
            name=item.name,
            current_quantity=item.current_quantity,
            unit=item.unit,
            expiry_date=item.expiry_date,
            source="ocr_scan",
        )
        db.add(medicine)
        saved.append(medicine)
    db.commit()
    for m in saved:
        db.refresh(m)
    return saved


@router.post("/manual", response_model=MedicineResponse)
def add_medicine_manual(
    payload: MedicineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_phc_staff),
):
    """Bina photo ke direct form se medicine add karna"""
    medicine = Medicine(
        phc_id=current_user.phc_id,
        name=payload.name,
        current_quantity=payload.current_quantity,
        unit=payload.unit,
        expiry_date=payload.expiry_date,
        source="manual",
    )
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine


@router.get("/my-phc", response_model=list[MedicineResponse])
def list_my_phc_medicines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """PHC staff apne PHC ka poora stock dekhega, with days_remaining prediction"""
    medicines = db.query(Medicine).filter(Medicine.phc_id == current_user.phc_id).all()
    result = []
    for m in medicines:
        days_remaining = calculate_days_remaining(db, m)
        m_dict = MedicineResponse.model_validate(m).model_dump()
        m_dict["days_remaining"] = days_remaining
        result.append(m_dict)
    return result


@router.post("/consume")
def log_consumption(
    payload: StockConsumption,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_phc_staff),
):
    """Jab medicine use ho, staff ye entry karega - isi se depletion rate nikalti hai"""
    medicine = db.query(Medicine).filter(Medicine.id == payload.medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine nahi mili")

    medicine.current_quantity -= payload.quantity_used
    db.add(StockTransaction(
        medicine_id=medicine.id,
        change_amount=-payload.quantity_used,
        transaction_type="consumption",
    ))
    db.commit()
    return {"message": "Consumption record ho gaya", "remaining_quantity": medicine.current_quantity}
