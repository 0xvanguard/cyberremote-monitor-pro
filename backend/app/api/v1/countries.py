from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import Job
from app.core.countries import COUNTRY_NAMES

router = APIRouter()


@router.get("")
async def list_countries(db: AsyncSession = Depends(get_db)):
    """
    Países con vacantes activas: código, nombre, conteo y salario promedio.
    Fuente para el mapa coroplético del frontend.
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
    rows = (await db.execute(query)).all()
    return [
        {
            "country_code": r.country_code.upper(),
            "country_name": COUNTRY_NAMES.get(r.country_code.upper()),
            "job_count": r.job_count,
            "avg_salary_usd": int(r.avg_salary) if r.avg_salary is not None else None,
        }
        for r in rows
    ]
