"""Seed idempotente: carga datos demo solo si la tabla jobs está vacía."""
import json
import logging
from pathlib import Path
from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Job

logger = logging.getLogger(__name__)

SEED_FILE = Path(__file__).parent / "seed_data.json"


async def seed_if_empty(db: AsyncSession) -> int:
    """Inserta las vacantes demo si no hay ninguna activa. Retorna cuántas insertó."""
    total = (await db.execute(select(func.count(Job.id)))).scalar_one()
    if total > 0:
        logger.info(f"[seed] BD ya contiene {total} vacantes — seed omitido")
        return 0

    with open(SEED_FILE, encoding="utf-8") as f:
        rows = json.load(f)

    for row in rows:
        db.add(Job(id=str(uuid4()), is_active=True, **row))

    await db.commit()
    logger.info(f"[seed] {len(rows)} vacantes demo insertadas")
    return len(rows)
