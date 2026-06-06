from pydantic import BaseModel, EmailStr, Field
from app.models.enums import UserRole
from datetime import datetime


class SignupRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    is_verified: bool
    profile_image: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
