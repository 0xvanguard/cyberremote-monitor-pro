"""
jobs_ingestor
=============
Módulo de ingesta y normalización de vacantes desde fuentes externas.

Conectores disponibles (en desarrollo):
- RemoteOK API (JSON público)
- We Work Remotely (RSS/scraping)
- LinkedIn (API oficial con OAuth)
- Glassdoor / Indeed (scraping ético)

Cada conector implementa la interfaz BaseConnector:
    async def fetch() -> list[RawJob]
    async def normalize(raw: RawJob) -> Job
"""
