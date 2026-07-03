from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from .base import NormalizedJob
import logging

logger = logging.getLogger(__name__)


async def upsert_jobs(db: AsyncSession, jobs: List[NormalizedJob]) -> dict:
    """
    Inserta o actualiza vacantes normalizadas en PostgreSQL.
    Usa INSERT ... ON CONFLICT (source, source_id) DO UPDATE.
    Retorna conteo de inserted / updated / skipped.
    """
    inserted = 0
    updated = 0
    errors = 0

    for job in jobs:
        try:
            result = await db.execute(
                text("""
                    INSERT INTO jobs (
                        title, company, country_code, city, lat, lng,
                        specialties, level, contract_type,
                        salary_min, salary_max, currency, languages,
                        source, source_id, source_url, posted_at
                    ) VALUES (
                        :title, :company, :country_code, :city, :lat, :lng,
                        :specialties, :level, :contract_type,
                        :salary_min, :salary_max, :currency, :languages,
                        :source, :source_id, :source_url, :posted_at
                    )
                    ON CONFLICT (source, source_id) DO UPDATE SET
                        title = EXCLUDED.title,
                        company = EXCLUDED.company,
                        specialties = EXCLUDED.specialties,
                        level = EXCLUDED.level,
                        salary_min = EXCLUDED.salary_min,
                        salary_max = EXCLUDED.salary_max,
                        is_active = TRUE,
                        ingested_at = NOW()
                    RETURNING (xmax = 0) AS is_insert
                """),
                {
                    "title": job.title,
                    "company": job.company,
                    "country_code": job.country_code,
                    "city": job.city,
                    "lat": job.lat,
                    "lng": job.lng,
                    "specialties": job.specialties,
                    "level": job.level,
                    "contract_type": job.contract_type,
                    "salary_min": job.salary_min,
                    "salary_max": job.salary_max,
                    "currency": job.currency,
                    "languages": job.languages,
                    "source": job.source,
                    "source_id": job.source_id,
                    "source_url": str(job.source_url) if job.source_url else None,
                    "posted_at": job.posted_at,
                }
            )
            row = result.fetchone()
            if row and row[0]:
                inserted += 1
            else:
                updated += 1
        except Exception as e:
            logger.error(f"[writer] Error upserting job {job.source_id}: {e}")
            errors += 1

    await db.commit()
    summary = {"inserted": inserted, "updated": updated, "errors": errors}
    logger.info(f"[writer] upsert complete: {summary}")
    return summary
