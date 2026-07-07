"""
OCR SERVICE - Register ki photo se medicine stock nikalne ka kaam
Gemini Vision API use karta hai. IMPORTANT: Hum kabhi "95% accurate" jaisa fixed claim nahi karte -
Gemini khud har item ke liye ek confidence deta hai, wahi honestly dikhate hain UI pe.
"""
import base64
import json
from google import genai
from app.core.config import settings

_client = None


def _get_client():
    """Client ko sirf tab banate hain jab actually zarurat pade (lazy init) -
    isse bina API key ke bhi server start ho sakta hai, sirf scan feature use karte waqt key chahiye"""
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY .env file me set nahi hai")
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client

EXTRACTION_PROMPT = """
Tum ek medical inventory OCR assistant ho. Is image me ek PHC/CHC ka medicine stock register hai.

Har medicine entry ke liye extract karo:
- name (medicine ka naam)
- quantity (kitni bachi hai, number me)
- expiry_date (agar likha hai, format YYYY-MM-DD, warna null)
- confidence (0-100 ke beech, tumhe khud kitna sure ho is reading pe - handwriting unclear ho to kam confidence do)

SIRF valid JSON array return karo, koi extra text nahi. Format:
[
  {"name": "Paracetamol 500mg", "quantity": 200, "expiry_date": "2026-12-01", "confidence": 88},
  {"name": "Amoxicillin", "quantity": 50, "expiry_date": null, "confidence": 65}
]

Agar image me kuch samajh nahi aata ya register nahi hai, khaali array [] return karo.
"""


def extract_stock_from_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> list[dict]:
    """
    Image bytes leta hai, Gemini Vision ko bhejta hai, aur extracted medicine list return karta hai.
    Har item ke saath uska confidence score bhi hota hai (fake claim nahi, real per-item confidence).
    """
    response = _get_client().models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            {"inline_data": {"mime_type": mime_type, "data": base64.b64encode(image_bytes).decode()}},
            EXTRACTION_PROMPT,
        ],
    )

    raw_text = response.text.strip()
    # Gemini kabhi kabhi ```json wrapper de deta hai - usko clean karte hain
    raw_text = raw_text.replace("```json", "").replace("```", "").strip()

    try:
        items = json.loads(raw_text)
        return items if isinstance(items, list) else []
    except json.JSONDecodeError:
        # Agar parsing fail ho jaye, khaali list return karo - crash nahi karna chahiye
        return []
