"""
PREDICTION SERVICE - "Ye medicine X din me khatam ho jayegi" wala calculation
Simple aur explainable rakha hai (moving average based) - complex black-box model nahi,
taaki judges ko poochne par tu logic clearly explain kar sake.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.medicine import Medicine, StockTransaction


def calculate_days_remaining(db: Session, medicine: Medicine, lookback_days: int = 7) -> float | None:
    """
    Pichle 'lookback_days' din ka consumption dekh ke average daily usage nikalta hai,
    fir current_quantity / average_daily_usage = kitne din me khatam hoga.
    """
    cutoff = datetime.utcnow() - timedelta(days=lookback_days)

    consumption_records = (
        db.query(StockTransaction)
        .filter(
            StockTransaction.medicine_id == medicine.id,
            StockTransaction.transaction_type == "consumption",
            StockTransaction.recorded_at >= cutoff,
        )
        .all()
    )

    if not consumption_records:
        return None  # Itna data nahi hai prediction ke liye - honestly None return karo

    total_consumed = sum(abs(r.change_amount) for r in consumption_records)
    avg_daily_usage = total_consumed / lookback_days

    if avg_daily_usage <= 0:
        return None

    return round(medicine.current_quantity / avg_daily_usage, 1)
