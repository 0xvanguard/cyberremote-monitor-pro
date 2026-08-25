"""Capa de base de datos async — MVP.

Soporta SQLite (dev local) y PostgreSQL/asyncpg (Docker) vía DATABASE_URL.
"""
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    pass


engine = create_async_engine(settings.DATABASE_URL, echo=False)

SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncSession:
    """Dependencia FastAPI: sesión de BD por request."""
    async with SessionLocal() as session:
        yield session
