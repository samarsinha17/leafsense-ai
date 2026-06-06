from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database.session import Base


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    message: Mapped[str] = mapped_column(Text)
    response: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)


class AnalyticsSnapshot(Base):
    __tablename__ = "analytics"

    id: Mapped[int] = mapped_column(primary_key=True)
    total_scans: Mapped[int] = mapped_column(Integer, default=0)
    healthy_count: Mapped[int] = mapped_column(Integer, default=0)
    disease_count: Mapped[int] = mapped_column(Integer, default=0)
    average_confidence: Mapped[float] = mapped_column(Float, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class DatasetImage(Base):
    __tablename__ = "dataset_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    crop_name: Mapped[str] = mapped_column(String(120), index=True)
    disease_name: Mapped[str] = mapped_column(String(180), index=True)
    image_path: Mapped[str] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(120), default="custom")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class AdminSetting(Base):
    __tablename__ = "admin_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    setting_name: Mapped[str] = mapped_column(String(120), unique=True)
    setting_value: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
