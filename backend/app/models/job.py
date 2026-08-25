"""Modelo Job — versión MVP del esquema `jobs` de data/schemas/001_initial.sql.

Notas de MVP:
- Sin columna geom PostGIS (se añadirá en EPIC 2 con GeoAlchemy2).
- specialties/languages usan JSON genérico (compatible SQLite + PostgreSQL).
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import JSON, Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    company: Mapped[Optional[str]] = mapped_column(String(255))
    country_code: Mapped[Optional[str]] = mapped_column(String(2), index=True)
    city: Mapped[Optional[str]] = mapped_column(String(255))
    lat: Mapped[Optional[float]] = mapped_column()
    lng: Mapped[Optional[float]] = mapped_column()

    specialties: Mapped[list] = mapped_column(JSON, default=list)
    level: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    contract_type: Mapped[Optional[str]] = mapped_column(String(50))
    salary_min: Mapped[Optional[int]] = mapped_column(Integer)
    salary_max: Mapped[Optional[int]] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    languages: Mapped[list] = mapped_column(JSON, default=list)

    source: Mapped[str] = mapped_column(String(100))
    source_id: Mapped[str] = mapped_column(String(255))
    source_url: Mapped[Optional[str]] = mapped_column(Text)
    description_summary: Mapped[Optional[str]] = mapped_column(Text)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    posted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    ingested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "country_code": self.country_code,
            "city": self.city,
            "lat": float(self.lat) if self.lat is not None else None,
            "lng": float(self.lng) if self.lng is not None else None,
            "specialties": self.specialties or [],
            "level": self.level,
            "contract_type": self.contract_type,
            "salary_min": self.salary_min,
            "salary_max": self.salary_max,
            "currency": self.currency,
            "languages": self.languages or [],
            "source": self.source,
            "source_id": self.source_id,
            "source_url": self.source_url,
            "description_summary": self.description_summary,
            "is_active": self.is_active,
            "posted_at": self.posted_at.isoformat() if self.posted_at else None,
        }
