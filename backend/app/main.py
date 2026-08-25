from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.api.v1 import alerts, analytics, auth, countries, jobs
from app.core.config import settings

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Crea las tablas al arrancar y carga datos demo si la BD está vacía."""
    from app.core.database import Base, engine, SessionLocal
    from app.core.seed import seed_if_empty
    import app.models  # noqa: F401 — registra los modelos en Base.metadata

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with SessionLocal() as db:
        inserted = await seed_if_empty(db)
        logger.info(f"[startup] MVP listo — seed insertó {inserted} vacantes")
    yield


app = FastAPI(
    title="CyberRemote Monitor Pro API",
    description="Intelligence API for global remote cybersecurity job market monitoring",
    version="2.0.0-mvp",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    lifespan=lifespan,
)

# ─── Middleware ────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["Jobs"])
app.include_router(countries.router, prefix="/api/v1/countries", tags=["Countries"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "version": "2.0.0-mvp"}
