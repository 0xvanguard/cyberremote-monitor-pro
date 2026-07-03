from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List
from uuid import UUID

router = APIRouter()


@router.get("/")
async def list_jobs(
    country_code: Optional[str] = Query(None, description="Código ISO de país (ej: CO, US)"),
    city: Optional[str] = Query(None),
    level: Optional[str] = Query(None, description="junior | semi-junior | mid"),
    specialty: Optional[str] = Query(None, description="pentesting | soc | cloud | devsecops | osint"),
    contract_type: Optional[str] = Query(None, description="full-time | part-time | freelance"),
    language: Optional[str] = Query(None, description="es | en | pt"),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    """
    Lista vacantes normalizadas con filtros avanzados.
    Soporta filtrado por país, ciudad, nivel, especialidad, tipo de contrato e idioma.
    """
    # TODO: implementar query a PostgreSQL con SQLAlchemy
    return {
        "total": 0,
        "jobs": [],
        "filters": {
            "country_code": country_code,
            "level": level,
            "specialty": specialty,
        }
    }


@router.get("/feed")
async def realtime_feed():
    """
    Endpoint WebSocket/SSE para el signal feed en tiempo real.
    Las vacantes nuevas se publican a través de Redis Pub/Sub.
    """
    # TODO: implementar SSE o upgrade a WebSocket
    return {"message": "WebSocket endpoint — ver /ws/jobs"}


@router.get("/{job_id}")
async def get_job(job_id: UUID):
    """Detalle de una vacante específica."""
    # TODO: query a PostgreSQL
    raise HTTPException(status_code=404, detail="Job not found")
