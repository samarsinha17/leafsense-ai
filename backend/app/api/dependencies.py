from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.security import decode_token
from app.database.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.core.config import get_settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_current_user(token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    try:
        user_id = int(decode_token(token))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_optional_user(token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User | None:
    if not token:
        return None
    try:
        user_id = int(decode_token(token))
    except ValueError:
        return None
    return db.get(User, user_id)


def require_admin(user: User = Depends(get_current_user)) -> User:
    admin_emails = {email.lower() for email in get_settings().admin_emails}
    if user.role != UserRole.admin and user.email.lower() not in admin_emails:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user
