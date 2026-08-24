"""Tests for NormalizedJob model"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.jobs_ingestor.base import NormalizedJob


class TestNormalizedJob:
    def test_minimal_job(self):
        job = NormalizedJob(
            source="remoteok",
            source_id="123",
            title="Security Analyst",
            company="Acme Corp",
            level="junior",
        )
        assert job.source == "remoteok"
        assert job.source_id == "123"
        assert job.level == "junior"
        assert job.currency == "USD"
        assert job.specialties == []
        assert job.languages == []

    def test_full_job(self):
        job = NormalizedJob(
            source="remoteok",
            source_id="456",
            title="Senior Pentester",
            company="CyberSec Inc",
            country_code="US",
            city="New York",
            lat=40.7128,
            lng=-74.0060,
            specialties=["pentesting", "red team"],
            level="senior",
            contract_type="full-time",
            salary_min=120000,
            salary_max=180000,
            currency="USD",
            languages=["en", "es"],
            source_url="https://example.com/job/456",
            description_summary="Red team engagement role",
        )
        assert job.lat == 40.7128
        assert len(job.specialties) == 2
        assert "es" in job.languages

    def test_level_values(self):
        for level in ["junior", "semi-junior", "mid", "senior"]:
            job = NormalizedJob(
                source="test", source_id="1", title="T", company="C", level=level
            )
            assert job.level == level

    def test_optional_fields_default_to_none(self):
        job = NormalizedJob(
            source="test", source_id="1", title="T", company="C", level="mid"
        )
        assert job.country_code is None
        assert job.city is None
        assert job.salary_min is None
        assert job.salary_max is None
        assert job.posted_at is None
