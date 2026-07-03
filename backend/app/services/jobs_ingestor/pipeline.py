"""
pipeline.py
===========
Orquesta el proceso completo de ingesta:
  1. Fetch desde conector
  2. Enriquecimiento geo (geocodificacion)
  3. Escritura en PostgreSQL

Uso desde Celery task o script manual:
    asyncio.run(run_pipeline("remoteok"))
"""
import asyncio
from typing import Optional
import logging

from .remoteok import RemoteOKConnector
from .writer import upsert_jobs
from .base import NormalizedJob

logger = logging.getLogger(__name__)

CONNECTORS = {
    "remoteok": RemoteOKConnector,
    # "weworkremotely": WeWorkRemotelyConnector,  # TODO EPIC 2
    # "linkedin": LinkedInConnector,              # TODO EPIC 2
}


async def run_pipeline(source: str, db_session=None) -> dict:
    """
    Ejecuta el pipeline de ingesta para una fuente.
    Si db_session es None, imprime resultados (modo dry-run).
    """
    connector_cls = CONNECTORS.get(source)
    if not connector_cls:
        raise ValueError(f"Conector desconocido: {source}. Disponibles: {list(CONNECTORS.keys())}")

    logger.info(f"[pipeline] Iniciando ingesta: {source}")
    connector = connector_cls()
    jobs = await connector.fetch()
    logger.info(f"[pipeline] {len(jobs)} vacantes normalizadas desde {source}")

    if not jobs:
        return {"source": source, "fetched": 0, "inserted": 0, "updated": 0, "errors": 0}

    if db_session is None:
        # Dry-run: mostrar primeras 3
        for job in jobs[:3]:
            print(f"  [{job.level.upper()}] {job.title} @ {job.company} | {job.specialties}")
        return {"source": source, "fetched": len(jobs), "dry_run": True}

    result = await upsert_jobs(db_session, jobs)
    return {"source": source, "fetched": len(jobs), **result}


if __name__ == "__main__":
    # python -m app.services.jobs_ingestor.pipeline
    async def main():
        print("=== CyberRemote Monitor Pro — Ingesta Dry-Run ===")
        result = await run_pipeline("remoteok", db_session=None)
        print(f"\nResultado: {result}")

    asyncio.run(main())
