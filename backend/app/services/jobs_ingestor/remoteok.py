import httpx
from typing import List, Optional
from datetime import datetime
import logging
from .base import BaseConnector, NormalizedJob

logger = logging.getLogger(__name__)

REMOTEOK_API = "https://remoteok.com/api"

CYBER_KEYWORDS = [
    "security", "cybersecurity", "pentest", "penetration",
    "soc", "siem", "devsecops", "appsec", "infosec",
    "cloud security", "network security", "osint",
    "incident response", "malware", "forensics", "compliance",
    "zero trust", "vulnerability", "ethical hacking", "ctf",
    "red team", "blue team", "purple team", "threat intel",
    "identity", "iam", "sast", "dast", "owasp",
]

JUNIOR_KEYWORDS = ["junior", "entry level", "entry-level", "intern", "trainee", "jr ", "jr."]
SEMI_JUNIOR_KEYWORDS = ["semi-junior", "semi junior", "associate", "1-2 years", "1-3 years"]

SPECIALTY_MAP = {
    "pentesting": ["pentest", "penetration", "red team", "ethical hacking"],
    "soc": ["soc", "siem", "blue team", "incident response"],
    "cloud_security": ["cloud security", "aws security", "azure security", "gcp security"],
    "devsecops": ["devsecops", "devops security", "sast", "dast", "pipeline"],
    "appsec": ["appsec", "application security", "owasp", "secure code"],
    "grc": ["compliance", "grc", "gdpr", "iso 27001", "nist", "soc2"],
    "osint": ["osint", "threat intel", "threat intelligence"],
    "iam": ["identity", "iam", "zero trust", "access management"],
}


class RemoteOKConnector(BaseConnector):
    source_name = "remoteok"

    async def fetch(self) -> List[NormalizedJob]:
        async with httpx.AsyncClient(
            headers={"User-Agent": "CyberRemote-Monitor/2.0 (+https://github.com/0xvanguard/cyberremote-monitor-pro)"},
            follow_redirects=True,
        ) as client:
            try:
                resp = await client.get(REMOTEOK_API, timeout=30)
                resp.raise_for_status()
                raw = resp.json()
            except Exception as e:
                logger.error(f"[RemoteOK] fetch error: {e}")
                return []

        jobs_raw = [j for j in raw if isinstance(j, dict) and "id" in j]
        normalized = []

        for job in jobs_raw:
            result = self._normalize(job)
            if result:
                normalized.append(result)

        logger.info(f"[RemoteOK] {len(normalized)} cyber jobs fetched")
        return normalized

    def _normalize(self, job: dict) -> Optional[NormalizedJob]:
        tags = [t.lower() for t in job.get("tags", [])]
        title = job.get("position", "").lower()
        description = job.get("description", "").lower()
        text = f"{title} {' '.join(tags)} {description[:500]}"

        if not any(kw in text for kw in CYBER_KEYWORDS):
            return None

        level = "mid"
        if any(kw in text for kw in JUNIOR_KEYWORDS):
            level = "junior"
        elif any(kw in text for kw in SEMI_JUNIOR_KEYWORDS):
            level = "semi-junior"

        specialties = [
            spec for spec, kws in SPECIALTY_MAP.items()
            if any(kw in text for kw in kws)
        ]

        posted_at = None
        if job.get("date"):
            try:
                posted_at = datetime.fromisoformat(job["date"].replace("Z", "+00:00"))
            except Exception:
                pass

        return NormalizedJob(
            source="remoteok",
            source_id=str(job.get("id", "")),
            title=job.get("position", "")[:500],
            company=job.get("company", "")[:255],
            country_code=None,  # RemoteOK no provee pais confiable
            specialties=specialties,
            level=level,
            contract_type="remote",
            salary_min=job.get("salary_min"),
            salary_max=job.get("salary_max"),
            currency="USD",
            languages=["en"],
            source_url=job.get("url", ""),
            posted_at=posted_at,
        )
