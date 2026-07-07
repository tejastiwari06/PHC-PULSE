"""
AUTH SCHEMAS - Login/Signup request me kya aayega, response me kya jayega - ye define karta hai
Antigravity (frontend) isi format ko follow karke API call karega
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole


class UserSignup(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole
    phc_id: Optional[int] = None  # District officer ke liye None rahega


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: UserRole
    phc_id: Optional[int] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
