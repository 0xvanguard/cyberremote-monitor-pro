"""Tests de integración del MVP — API completa sobre SQLite temporal."""
import os
import sys
from pathlib import Path

# Configurar BD de test ANTES de importar la app (settings se instancia al importar)
TEST_DB = Path(__file__).parent / "test_mvp.db"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{TEST_DB}"
os.environ["ENVIRONMENT"] = "development"

sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    # TestClient como context manager ejecuta el lifespan (create_all + seed)
    with TestClient(app) as c:
        yield c
    TEST_DB.unlink(missing_ok=True)


class TestHealth:
    def test_health(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"


class TestJobs:
    def test_list_jobs_seeded(self, client):
        resp = client.get("/api/v1/jobs")
        assert resp.status_code == 200
        body = resp.json()
        assert body["total"] >= 16
        assert len(body["jobs"]) >= 16
        assert body["jobs"][0]["title"]

    def test_filter_by_level(self, client):
        resp = client.get("/api/v1/jobs", params={"level": "junior"})
        body = resp.json()
        assert body["total"] > 0
        assert all(j["level"] == "junior" for j in body["jobs"])

    def test_filter_by_country(self, client):
        resp = client.get("/api/v1/jobs", params={"country_code": "CO"})
        body = resp.json()
        assert body["total"] > 0
        assert all(j["country_code"] == "CO" for j in body["jobs"])

    def test_filter_by_specialty(self, client):
        resp = client.get("/api/v1/jobs", params={"specialty": "soc"})
        body = resp.json()
        assert body["total"] > 0
        assert any("soc" in j["specialties"] for j in body["jobs"])

    def test_free_text_search(self, client):
        resp = client.get("/api/v1/jobs", params={"q": "penetration"})
        body = resp.json()
        assert body["total"] > 0

    def test_invalid_level_rejected(self, client):
        resp = client.get("/api/v1/jobs", params={"level": "ceo"})
        assert resp.status_code == 422

    def test_pagination(self, client):
        resp = client.get("/api/v1/jobs", params={"limit": 5, "offset": 0})
        assert resp.status_code == 200
        assert len(resp.json()["jobs"]) == 5

    def test_get_job_detail(self, client):
        listing = client.get("/api/v1/jobs", params={"limit": 1}).json()
        job_id = listing["jobs"][0]["id"]
        resp = client.get(f"/api/v1/jobs/{job_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == job_id

    def test_get_job_not_found(self, client):
        resp = client.get("/api/v1/jobs/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404


class TestAnalytics:
    def test_rankings(self, client):
        resp = client.get("/api/v1/analytics/rankings")
        assert resp.status_code == 200
        rankings = resp.json()
        assert len(rankings) >= 1
        counts = [r["job_count"] for r in rankings]
        assert counts == sorted(counts, reverse=True)
        assert rankings[0]["country_name"] is not None

    def test_kpis(self, client):
        resp = client.get("/api/v1/analytics/kpis")
        assert resp.status_code == 200
        kpis = resp.json()
        assert kpis["total_jobs"] >= 16
        assert kpis["countries_with_jobs"] >= 5
        assert len(kpis["top_specialties"]) > 0

    def test_kpis_by_country(self, client):
        resp = client.get("/api/v1/analytics/kpis", params={"country_code": "CO"})
        body = resp.json()
        assert body["total_jobs"] >= 1


class TestCountries:
    def test_list_countries(self, client):
        resp = client.get("/api/v1/countries")
        assert resp.status_code == 200
        countries = resp.json()
        codes = {c["country_code"] for c in countries}
        assert "CO" in codes
        assert all(c["job_count"] > 0 for c in countries)


class TestStubEndpoints:
    """Los stubs deben responder con códigos honestos, no 500."""

    def test_auth_login_501(self, client):
        assert client.post("/api/v1/auth/login").status_code == 501

    def test_alerts_subscribe_501(self, client):
        assert client.post("/api/v1/alerts/subscribe").status_code == 501

    def test_feed_stub(self, client):
        resp = client.get("/api/v1/jobs/feed")
        assert resp.status_code == 200
