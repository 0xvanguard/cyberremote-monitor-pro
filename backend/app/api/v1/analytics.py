from fastapi import APIRouter, Depends, Query
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.models import Job
from app.core.countries import COUNTRY_NAMES

router = APIRouter()


class CountryRanking(BaseModel):
    country_code: str
    country_name: Optional[str] = None
    job_count: int
    avg_salary_usd: Optional[int] = None


@router.get("/rankings", response_model=list[CountryRanking])
async def get_rankings(
    top_n: int = Query(10, ge=1, le=50),
    level: Optional[str] = Query(None, description="junior | semi-junior | mid | senior"),
    db: AsyncSession = Depends(get_db),
):
    """
    Ranking de países por volumen de vacantes activas (intensity proxy del MVP).
    """
    query = (
        select(
            Job.country_code,
            func.count(Job.id).label("job_count"),
            func.avg(Job.salary_min).label("avg_salary"),
        )
        .where(Job.is_active.is_(True), Job.country_code.is_not(None))
        .group_by(Job.country_code)
        .order_by(func.count(Job.id).desc())
    )
    if level:
        query = query.where(Job.level == level)

    rows = (await db.execute(query.limit(top_n))).all()
    return [
        CountryRanking(
            country_code=r.country_code,
            country_name=COUNTRY_NAMES.get(r.country_code.upper()),
            job_count=r.job_count,
            avg_salary_usd=int(r.avg_salary) if r.avg_salary is not None else None,
        )
        for r in rows
    ]


@router.get("/kpis")
async def get_kpis(
    country_code: Optional[str] = Query(None, max_length=2),
    db: AsyncSession = Depends(get_db),
):
    """
    KPIs globales o por país: volumen activo, países con demanda,
    top especialidades y distribución por nivel.
    """
    base = select(Job).where(Job.is_active.is_(True))
    if country_code:
        base = base.where(func.upper(Job.country_code) == country_code.upper())

    jobs = (await db.execute(base)).scalars().all()

    specialties: dict[str, int] = {}
    levels: dict[str, int] = {}
    countries: set[str] = set()
    salaries: list[int] = []

    for j in jobs:
        for s in j.specialties or []:
            specialties[s] = specialties.get(s, 0) + 1
        if j.level:
            levels[j.level] = levels.get(j.level, 0) + 1
        if j.country_code:
            countries.add(j.country_code.upper())
        if j.salary_min:
            salaries.append(j.salary_min)

    return {
        "total_jobs": len(jobs),
        "countries_with_jobs": len(countries),
        "top_specialties": sorted(specialties.items(), key=lambda x: -x[1])[:5],
        "levels": dict(sorted(levels.items(), key=lambda x: -x[1])),
        "avg_salary_min_usd": int(sum(salaries) / len(salaries)) if salaries else None,
    }


@router.get("/trends")
async def get_trends(
    country_code: Optional[str] = Query(None, max_length=2),
    months: int = Query(6, le=24),
):
    """
    Serie temporal de demanda — requiere histórico acumulado (EPIC 5).
    """
    return {"trends": [], "country_code": country_code, "months": months,
            "message": "Planificado para EPIC 5 — requiere histórico de ingesta"}
