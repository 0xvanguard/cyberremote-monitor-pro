from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()


@router.get("/rankings")
async def get_rankings(
    top_n: int = Query(10, le=50),
    specialty: Optional[str] = Query(None),
    level: Optional[str] = Query(None, description="junior | semi-junior | mid"),
):
    """
    Ranking dinámico de países/ciudades por oportunidad para perfiles junior.
    Retorna top N ordenados por intensity_score.
    """
    # TODO: query a geo_entities con cálculo de intensity_score
    return {"rankings": [], "top_n": top_n}


@router.get("/kpis")
async def get_kpis(
    country_code: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
):
    """
    KPIs globales o por país/región:
    - Volumen total de vacantes activas
    - Ratio oferta/demanda estimado
    - Top especialidades demandadas
    - Variación semanal/mensual
    """
    # TODO: calcular desde PostgreSQL + caché Redis
    return {
        "total_jobs": 0,
        "countries_with_jobs": 0,
        "top_specialties": [],
        "weekly_delta": 0,
    }


@router.get("/trends")
async def get_trends(
    country_code: Optional[str] = Query(None),
    months: int = Query(6, le=24),
):
    """
    Serie temporal de demanda por especialidad y país.
    Usada para el módulo gubernamental de predicción de tendencias.
    """
    # TODO: implementar con datos históricos en PostgreSQL
    return {"trends": [], "country_code": country_code, "months": months}
