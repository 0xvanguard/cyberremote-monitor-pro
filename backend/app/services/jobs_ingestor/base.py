from abc import ABC, abstractmethod
from typing import List
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NormalizedJob(BaseModel):
    source: str
    source_id: str
    title: str
    company: str
    country_code: Optional[str] = None
    city: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    specialties: List[str] = []
    level: str  # junior | semi-junior | mid | senior
    contract_type: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: str = "USD"
    languages: List[str] = []
    source_url: Optional[str] = None
    description_summary: Optional[str] = None
    posted_at: Optional[datetime] = None


class BaseConnector(ABC):
    """Interfaz base para todos los conectores de fuentes de empleo."""

    @abstractmethod
    async def fetch(self) -> List[NormalizedJob]:
        """Obtiene y normaliza vacantes de la fuente."""
        ...

    @property
    @abstractmethod
    def source_name(self) -> str:
        ...
