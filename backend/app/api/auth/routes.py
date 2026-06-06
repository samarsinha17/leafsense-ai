from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.core.security import create_token, hash_password, verify_password
from app.database.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


class GoogleTokenRequest(BaseModel):
    token: str = Field(min_length=10)


class GoogleTokenResponse(BaseModel):
    email: EmailStr
    name: str
    picture: str | None = None
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: UserRole


class GoogleLoginRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(default="Google User", min_length=2, max_length=120)
    google_id: str | None = None


@router.post("/signup", response_model=UserResponse, status_code=201)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    role = UserRole.admin if payload.email.lower() in get_settings().admin_emails else UserRole.user
    user = User(full_name=payload.full_name, email=payload.email.lower(), password_hash=hash_password(payload.password), role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if user.email.lower() in get_settings().admin_emails and user.role != UserRole.admin:
        user.role = UserRole.admin
        db.commit()
    access = create_token(str(user.id))
    refresh_days = get_settings().refresh_token_expire_days
    refresh = create_token(str(user.id), "refresh", timedelta(days=refresh_days))
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/google", response_model=GoogleTokenResponse)
def verify_google_token(payload: GoogleTokenRequest, db: Session = Depends(get_db)):
    try:
        from google.auth.transport import requests
        from google.oauth2 import id_token

        client_id = get_settings().google_client_id
        if not client_id:
            raise HTTPException(status_code=500, detail="Google Client ID is not configured")
        claims = id_token.verify_oauth2_token(payload.token, requests.Request(), client_id)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google ID token") from exc

    email = claims.get("email")
    name = claims.get("name")
    if not email or not name:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google token is missing required profile fields")
    email = email.lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        role = UserRole.admin if email in get_settings().admin_emails else UserRole.user
        user = User(
            full_name=name,
            email=email,
            password_hash=None,
            role=role,
            google_id=claims.get("sub"),
            profile_image=claims.get("picture"),
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.full_name = user.full_name or name
        user.google_id = user.google_id or claims.get("sub")
        user.profile_image = user.profile_image or claims.get("picture")
        user.is_verified = True
        if email in get_settings().admin_emails:
            user.role = UserRole.admin
        db.commit()
    access = create_token(str(user.id))
    refresh = create_token(str(user.id), "refresh", timedelta(days=get_settings().refresh_token_expire_days))
    return GoogleTokenResponse(email=email, name=name, picture=claims.get("picture"), access_token=access, refresh_token=refresh, role=user.role)


@router.post("/google-login", response_model=TokenResponse)
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if not email.endswith("@gmail.com"):
        raise HTTPException(status_code=400, detail="Google login requires a Gmail address")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        role = UserRole.admin if email in get_settings().admin_emails else UserRole.user
        user = User(full_name=payload.full_name, email=email, password_hash=None, role=role, google_id=payload.google_id, is_verified=True)
        db.add(user)
        db.commit()
        db.refresh(user)
    elif payload.google_id and not user.google_id:
        user.google_id = payload.google_id
        user.is_verified = True
        db.commit()
    if email in get_settings().admin_emails and user.role != UserRole.admin:
        user.role = UserRole.admin
        db.commit()
    access = create_token(str(user.id))
    refresh = create_token(str(user.id), "refresh", timedelta(days=get_settings().refresh_token_expire_days))
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/verify-otp")
def verify_otp():
    return {"verified": True}


@router.post("/forgot-password")
def forgot_password():
    return {"status": "otp_sent"}


@router.post("/reset-password")
def reset_password():
    return {"status": "password_reset"}


@router.post("/logout")
def logout():
    return {"status": "logged_out"}
