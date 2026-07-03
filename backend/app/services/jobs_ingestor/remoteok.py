import httpx
import asyncio
from typing import List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

REMOTEOK_API = "https://remoteok.com/api"

# Especialidades de ciberseguridad a detectar en títulos/tags
CYBER_KEYWORDS = [
    "security", "cybersecurity", "pentest", "penetration",
    "soc", "siem", "devsecops", "appsec", "infosec",
    "cloud security", "network security", "osint",
    "incident response", "malware", "forensics", "compliance",
    "zero trust", "vulnerability", "ethical hacking",
]

JUNIOR_KEYWORDS = ["junior", "entry level", "entry-level", "intern", "trainee", "jr"]
SEMI_JUNIOR_KEYWORDS = ["semi-junior", "semi junior", "associate", "1-2 years", "1-3 years"]


async def fetch_cyber_jobs() -> List[dict]:
    """
    Obtiene vacantes de ciberseguridad junior/semi-junior desde RemoteOK API.
    Filtra por palabras clave de ciberseguridad y nivel.
    """
    async with httpx.AsyncClient(headers={"User-Agent": "CyberRemote-Monitor/2.0"}) as client:
        try:
            resp = await client.get(REMOTEOK_API, timeout=30)
            resp.raise_for_status()
            all_jobs = resp.json()
            # primer elemento es metadata
            jobs = [j for j in all_jobs if isinstance(j, dict) and "id" in j]
        except Exception as e:
            logger.error(f"Error fetching RemoteOK: {e}")
            return []

    cyber_jobs = []
    for job in jobs:
        tags = [t.lower() for t in job.get("tags", [])]
        title = job.get("position", "").lower()
        description = job.get("description", "").lower()
        text = f"{title} {' '.join(tags)} {description}"

        is_cyber = any(kw in text for kw in CYBER_KEYWORDS)
        if not is_cyber:
            continue

        level = "mid"
        if any(kw in text for kw in JUNIOR_KEYWORDS):
            level = "junior"
        elif any(kw in text for kw in SEMI_JUNIOR_KEYWORDS):
            level = "semi-junior"

        cyber_jobs.append({
            "source": "remoteok",
            "source_id": str(job.get("id", "")),
            "title": job.get("position", ""),
            "company": job.get("company", ""),
            "level": level,
            "tags": tags,
            "salary_min": job.get("salary_min"),
            "salary_max": job.get("salary_max"),
            "source_url": job.get("url", ""),
            "posted_at": job.get("date"),
            "contract_type": "remote",
        })

    logger.info(f"RemoteOK: {len(cyber_jobs)} cyber jobs fetched (all levels)")
    return cyber_jobs
