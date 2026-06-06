from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_token(subject: str, token_type: str = "access", expires_delta: timedelta | None = None) -> str:
    settings = get_settings()
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": subject,
        "type": token_type,
        "exp": datetime.now(timezone.utc) + expires_delta,
    }
    secret = settings.jwt_refresh_secret if token_type == "refresh" else settings.jwt_secret
    return jwt.encode(payload, secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str, token_type: str = "access") -> str:
    settings = get_settings()
    secret = settings.jwt_refresh_secret if token_type == "refresh" else settings.jwt_secret
    try:
        payload = jwt.decode(token, secret, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise ValueError("Invalid token") from exc
    if payload.get("type") != token_type or not payload.get("sub"):
        raise ValueError("Invalid token")
    return str(payload["sub"])
