from celery import Celery
from celery.schedules import crontab
from app.core.config import settings
import asyncio

celery_app = Celery(
    "cyberremote",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    beat_schedule={
        # Ingesta RemoteOK cada 2 horas
        "ingest-remoteok": {
            "task": "app.worker.ingest_source",
            "schedule": crontab(minute=0, hour="*/2"),
            "args": ["remoteok"],
        },
        # Actualizar geo_entities cada 4 horas
        "update-geo-entities": {
            "task": "app.worker.update_geo_entities",
            "schedule": crontab(minute=30, hour="*/4"),
        },
    },
)


@celery_app.task(name="app.worker.ingest_source", bind=True, max_retries=3)
def ingest_source(self, source: str):
    """Task Celery: ejecuta el pipeline de ingesta para una fuente."""
    from app.services.jobs_ingestor.pipeline import run_pipeline
    from app.core.database import get_sync_session

    try:
        loop = asyncio.get_event_loop()
        with get_sync_session() as db:
            result = loop.run_until_complete(run_pipeline(source, db_session=db))
        return result
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


@celery_app.task(name="app.worker.update_geo_entities")
def update_geo_entities():
    """Task Celery: recalcula intensity_score y job_count en geo_entities."""
    from app.services.geo_enricher.updater import refresh_geo_entities
    from app.core.database import get_sync_session

    loop = asyncio.get_event_loop()
    with get_sync_session() as db:
        result = loop.run_until_complete(refresh_geo_entities(db))
    return result
