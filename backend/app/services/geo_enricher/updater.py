from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)


async def refresh_geo_entities(db: AsyncSession) -> dict:
    """
    Recalcula job_count e intensity_score en geo_entities
    basado en los jobs activos de las ultimas 30 dias.
    """
    await db.execute(text("""
        INSERT INTO geo_entities (country_code, city, job_count, intensity_score, updated_at)
        SELECT
            country_code,
            COALESCE(city, 'Unknown') as city,
            COUNT(*) as job_count,
            -- intensity_score: 0-100 normalizado sobre max del dataset
            ROUND(
                (COUNT(*) * 100.0 / NULLIF((SELECT MAX(cnt) FROM (
                    SELECT COUNT(*) as cnt FROM jobs
                    WHERE is_active = TRUE AND posted_at > NOW() - INTERVAL '30 days'
                    GROUP BY country_code
                ) sub), 0)
            )::numeric, 2
            ) as intensity_score,
            NOW()
        FROM jobs
        WHERE is_active = TRUE
          AND posted_at > NOW() - INTERVAL '30 days'
          AND country_code IS NOT NULL
        GROUP BY country_code, city
        ON CONFLICT (country_code, city) DO UPDATE SET
            job_count = EXCLUDED.job_count,
            intensity_score = EXCLUDED.intensity_score,
            updated_at = NOW()
    """))
    await db.commit()

    result = await db.execute(text("SELECT COUNT(*) FROM geo_entities"))
    count = result.scalar()
    logger.info(f"[geo_enricher] geo_entities actualizado: {count} registros")
    return {"geo_entities_updated": count}
