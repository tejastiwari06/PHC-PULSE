"""
CONFIG FILE - Saari settings yaha se control hoti hain
Environment variables .env file se load hote hain (isse secrets code me hardcode nahi karne padte)
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database connection string
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/phc_pulse"

    # JWT Auth settings (login token ke liye)
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 din tak login valid rahega

    # Gemini AI API key (OCR ke liye)
    GEMINI_API_KEY: str = ""

    # Thresholds (business logic ke liye)
    LOW_STOCK_DAYS_THRESHOLD: int = 5      # 5 din se kam stock bacha to alert
    EXPIRY_ALERT_DAYS: int = 30            # 30 din me expire hone wali medicine flag hogi
    REDISTRIBUTION_MIN_SURPLUS: int = 50   # Itna surplus ho tabhi transfer suggest hoga

    class Config:
        env_file = ".env"


settings = Settings()
