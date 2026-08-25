from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/login")
async def login():
    """Autenticación JWT/OIDC — planificada en EPIC 3 (Módulo Gubernamental)."""
    raise HTTPException(status_code=501, detail="Auth no implementado en el MVP — EPIC 3")


@router.get("/me")
async def me():
    raise HTTPException(status_code=401, detail="Not authenticated")
