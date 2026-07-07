"""
SECURITY - Password hash karna aur JWT token banana/check karna
Password kabhi plain text me store nahi hota - bcrypt se hash karke store hota hai
"""
from datetime import datetime, timedelta
import bcrypt
from jose import jwt
from app.core.config import settings


def hash_password(password: str) -> str:
    # bcrypt directly use kar rahe hain (passlib me naye bcrypt version ke saath compatibility bug hai)
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(data: dict) -> str:
    """Login hone par ye token banta hai - iske andar user id aur role chhupa hota hai"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Token ko decode karke check karta hai valid hai ya nahi"""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
