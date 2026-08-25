from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from uuid import UUID
from datetime import datetime

from sqlalchemy import String, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.models import Job

router = APIRouter()

VALID_LEVELS = {"junior", "semi-junior", "mid", "senior"}


class JobOut(BaseModel):
    id: str
    title: str
    company: Optional[str] = None
    country_code: Optional[str] = None
    city: Optional[str] = None
    level: Optional[str] = None
    contract_type: Optional[str] = None
    specialties: list[str] = []
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: str = "USD"
    languages: list[str] = []
    source: str
    source_url: Optional[str] = None
    description_summary: Optional[str] = None
    posted_at: Optional[datetime] = None


class JobsListOut(BaseModel):
    total: int
    limit: int
    offset: int
    jobs: list[JobOut]


@router.get("", response_model=JobsListOut)
async def list_jobs(
    country_code: Optional[str] = Query(None, description="Código ISO de país (ej: CO, US)", max_length=2),
    city: Optional[str] = Query(None),
    level: Optional[str] = Query(None, description="junior | semi-junior | mid | senior"),
    specialty: Optional[str] = Query(None, description="pentesting | soc | cloud_security | devsecops | appsec | grc | osint | iam"),
    language: Optional[str] = Query(None, description="es | en | pt"),
    q: Optional[str] = Query(None, description="Búsqueda libre en título y empresa"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    Lista vacantes normalizadas con filtros avanzados y paginación.
    """
    if level and level not in VALID_LEVELS:
        raise HTTPException(status_code=422, detail=f"level inválido. Valores: {sorted(VALID_LEVELS)}")

    query = select(Job).where(Job.is_active.is_(True))

    if country_code:
        query = query.where(func.upper(Job.country_code) == country_code.upper())
    if city:
        query = query.where(Job.city.ilike(f"%{city}%"))
    if level:
        query = query.where(Job.level == level)
    if specialty:
        # JSON column → cast a texto para filtrado portable (SQLite + PostgreSQL)
        query = query.where(
            func.lower(func.cast(Job.specialties, String)).contains(specialty.lower())
        )
    if language:
        query = query.where(
            func.lower(func.cast(Job.languages, String)).contains(language.lower())
        )
    if q:
        like = f"%{q}%"
        query = query.where(or_(Job.title.ilike(like), Job.company.ilike(like)))

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()

    rows = (
        await db.execute(query.order_by(Job.posted_at.desc().nullslast(), Job.title).limit(limit).offset(offset))
    ).scalars().all()

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "jobs": [JobOut(**{k: v for k, v in j.to_dict().items()}) for j in rows],
    }


@router.get("/feed")
async def realtime_feed():
    """
    Signal feed en tiempo real — planificado con Redis Pub/Sub en EPIC 2.
    """
    return {"message": "WebSocket/SSE endpoint — implementación planificada en EPIC 2"}


@router.get("/{job_id}", response_model=JobOut)
async def get_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    """Detalle de una vacante específica."""
    job = (await db.execute(select(Job).where(Job.id == str(job_id)))).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobOut(**job.to_dict())
