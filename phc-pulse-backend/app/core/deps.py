"""
DEPENDENCIES - Ye decide karta hai "kaun logged in hai" aur "kya iska role sahi hai is endpoint ke liye"
Har protected API endpoint isko use karega taaki bina login ke koi access na kar sake
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Login expire ho gaya ya invalid hai, dobara login karein",
    )
    try:
        payload = decode_access_token(token)
        user_id = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


def require_district_officer(current_user: User = Depends(get_current_user)) -> User:
    """Sirf District Officer hi is endpoint ko access kar sakta hai"""
    if current_user.role != UserRole.DISTRICT_OFFICER:
        raise HTTPException(status_code=403, detail="Sirf District Officer ke paas ye access hai")
    return current_user


def require_phc_staff(current_user: User = Depends(get_current_user)) -> User:
    """Sirf PHC Staff hi is endpoint ko access kar sakta hai"""
    if current_user.role != UserRole.PHC_STAFF:
        raise HTTPException(status_code=403, detail="Sirf PHC Staff ke paas ye access hai")
    return current_user
