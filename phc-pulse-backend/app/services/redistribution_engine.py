"""
REDISTRIBUTION ENGINE - Tera UNIQUE feature
Logic simple hai:
1. Jis PHC me kisi medicine ka "days_remaining" bahut kam hai (shortage) -
2. Aur kisi doosre PHC me wahi medicine bahut zyada hai jo consume nahi ho rahi (surplus/expiring) -
3. Dono ko match karke ek "suggestion" bana do transfer ke liye.
"""
from datetime import date, timedelta
from sqlalchemy.orm import Session

from app.models.medicine import Medicine
from app.models.redistribution import RedistributionSuggestion, RedistributionStatus
from app.services.prediction_service import calculate_days_remaining
from app.core.config import settings


def generate_redistribution_suggestions(db: Session) -> list[RedistributionSuggestion]:
    """
    Sabhi PHC ke medicines ko naam se group karta hai, fir har group me
    shortage wale PHC ko surplus wale PHC se match karta hai.
    """
    all_medicines = db.query(Medicine).all()

    # Naam ke hisaab se group karo (e.g. sab "Paracetamol 500mg" ek jagah)
    grouped: dict[str, list[Medicine]] = {}
    for m in all_medicines:
        grouped.setdefault(m.name, []).append(m)

    new_suggestions = []

    for medicine_name, medicine_list in grouped.items():
        shortage_phcs = []
        surplus_phcs = []

        for m in medicine_list:
            days_remaining = calculate_days_remaining(db, m)
            is_expiring_soon = (
                m.expiry_date is not None
                and m.expiry_date <= date.today() + timedelta(days=settings.EXPIRY_ALERT_DAYS)
            )

            if days_remaining is not None and days_remaining < settings.LOW_STOCK_DAYS_THRESHOLD:
                shortage_phcs.append((m, days_remaining))

            # Surplus: bahut zyada stock hai AUR (expiring hai YA consumption bahut slow hai)
            elif m.current_quantity >= settings.REDISTRIBUTION_MIN_SURPLUS and (
                is_expiring_soon or days_remaining is None or days_remaining > 60
            ):
                surplus_phcs.append((m, is_expiring_soon))

        # Har shortage ko ek surplus se match karo
        for shortage_medicine, days_left in shortage_phcs:
            for surplus_medicine, is_expiring in surplus_phcs:
                if surplus_medicine.phc_id == shortage_medicine.phc_id:
                    continue  # Same PHC hai, skip karo

                transfer_qty = min(
                    surplus_medicine.current_quantity - settings.REDISTRIBUTION_MIN_SURPLUS,
                    max(50, settings.REDISTRIBUTION_MIN_SURPLUS),
                )
                if transfer_qty <= 0:
                    continue

                reason = (
                    f"{medicine_name} sirf {days_left} din me khatam hogi is PHC me. "
                    f"Doosre PHC me {'expiring stock hai' if is_expiring else 'surplus stock hai jo use nahi ho raha'}."
                )

                suggestion = RedistributionSuggestion(
                    medicine_name=medicine_name,
                    from_phc_id=surplus_medicine.phc_id,
                    to_phc_id=shortage_medicine.phc_id,
                    suggested_quantity=transfer_qty,
                    reason=reason,
                    status=RedistributionStatus.SUGGESTED,
                )
                db.add(suggestion)
                new_suggestions.append(suggestion)
                break  # Ek shortage ke liye ek suggestion kaafi hai

    db.commit()
    for s in new_suggestions:
        db.refresh(s)
    return new_suggestions
