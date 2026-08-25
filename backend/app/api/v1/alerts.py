from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/subscribe")
async def subscribe():
    """Suscripciones a alertas (email/telegram/whatsapp) — planificadas en EPIC 4."""
    raise HTTPException(status_code=501, detail="Alertas no implementadas en el MVP — EPIC 4")
