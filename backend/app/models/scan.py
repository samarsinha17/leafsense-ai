from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base


class Scan(Base):
    __tablename__ = "scans"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    image_url: Mapped[str] = mapped_column(Text)
    crop_name: Mapped[str] = mapped_column(String(120), index=True)
    disease_name: Mapped[str] = mapped_column(String(180), index=True)
    confidence_score: Mapped[float] = mapped_column(Float)
    severity: Mapped[str] = mapped_column(String(32), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="scans")
    reports = relationship("Report", back_populates="scan", cascade="all, delete-orphan")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    scan_id: Mapped[int] = mapped_column(ForeignKey("scans.id", ondelete="CASCADE"), index=True)
    pdf_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    csv_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    scan = relationship("Scan", back_populates="reports")
