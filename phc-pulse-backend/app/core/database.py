"""
DATABASE CONNECTION - Ye file PostgreSQL se connection banati hai
SQLAlchemy ORM use kar rahe hain (Python classes se database tables control karte hain)
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Engine = actual database connection
engine = create_engine(settings.DATABASE_URL)

# SessionLocal = har request ke liye ek database "conversation" session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = saare models (tables) isi se inherit karenge
Base = declarative_base()


def get_db():
    """
    Har API request ko ek database session milega, aur request khatam hote hi
    session automatically close ho jayega. Isse memory leak nahi hota.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
