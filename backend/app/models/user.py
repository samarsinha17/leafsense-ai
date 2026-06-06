from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base
from app.models.enums import UserRole


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str | None] = mapped_column(Text, nullable=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.user, index=True)
    profile_image: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    google_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    scans = relationship("Scan", back_populates="user")


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    jwt_token: Mapped[str] = mapped_column(Text)
    login_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expiry_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    user = relationship("User", back_populates="sessions")
