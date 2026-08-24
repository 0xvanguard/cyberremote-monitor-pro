"""Tests for RemoteOKConnector normalization logic"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.jobs_ingestor.remoteok import RemoteOKConnector


class TestRemoteOKNormalize:
    def setup_method(self):
        self.connector = RemoteOKConnector()

    def test_normalizes_cyber_job(self):
        raw = {
            "id": 12345,
            "position": "Junior Security Analyst",
            "company": "CyberCorp",
            "tags": ["security", "soc", "siem"],
            "description": "We need a junior SOC analyst to monitor SIEM alerts",
            "date": "2026-01-15T10:00:00Z",
            "url": "https://remoteok.com/remote-jobs/12345",
        }
        job = self.connector._normalize(raw)
        assert job is not None
        assert job.source_id == "12345"
        assert job.title == "Junior Security Analyst"
        assert job.company == "CyberCorp"
        assert job.level == "junior"
        assert "soc" in job.specialties
        assert "osint" not in job.specialties or "soc" in job.specialties

    def test_filters_non_cyber_jobs(self):
        raw = {
            "id": 99999,
            "position": "React Developer",
            "company": "StartupInc",
            "tags": ["javascript", "react", "frontend"],
            "description": "Build beautiful UIs with React and TypeScript",
        }
        job = self.connector._normalize(raw)
        assert job is None

    def test_detects_semi_junior_level(self):
        raw = {
            "id": 22222,
            "position": "AppSec Engineer",
            "company": "SecureCo",
            "tags": ["appsec", "owasp"],
            "description": "1-2 years experience in application security",
        }
        job = self.connector._normalize(raw)
        assert job is not None
        assert job.level == "semi-junior"

    def test_detects_mid_level_default(self):
        raw = {
            "id": 33333,
            "position": "Cloud Security Engineer",
            "company": "CloudSec",
            "tags": ["cloud security", "aws"],
            "description": "Design and implement cloud security architecture",
        }
        job = self.connector._normalize(raw)
        assert job is not None
        assert job.level == "mid"

    def test_maps_pentesting_specialty(self):
        raw = {
            "id": 44444,
            "position": "Penetration Tester",
            "company": "RedTeam Inc",
            "tags": ["pentest", "red team", "ethical hacking"],
            "description": "Conduct penetration tests and red team engagements",
        }
        job = self.connector._normalize(raw)
        assert job is not None
        assert "pentesting" in job.specialties

    def test_maps_multiple_specialties(self):
        raw = {
            "id": 55555,
            "position": "DevSecOps Engineer",
            "company": "PipelineCo",
            "tags": ["devsecops", "sast", "dast", "owasp"],
            "description": "Secure the CI/CD pipeline with SAST and DAST tools",
        }
        job = self.connector._normalize(raw)
        assert job is not None
        assert "devsecops" in job.specialties
        assert "appsec" in job.specialties

    def test_handles_missing_fields(self):
        raw = {
            "id": 66666,
            "position": "SOC Analyst",
            "company": "SOC Inc",
            "tags": ["soc", "siem"],
        }
        job = self.connector._normalize(raw)
        assert job is not None
        assert job.salary_min is None
        assert job.salary_max is None
        assert job.posted_at is None

    def test_handles_date_parsing(self):
        raw = {
            "id": 77777,
            "position": "Security Engineer",
            "company": "SecCo",
            "tags": ["security"],
            "date": "2026-03-01T14:30:00Z",
        }
        job = self.connector._normalize(raw)
        assert job is not None
        assert job.posted_at is not None
        assert job.posted_at.year == 2026

    def test_handles_invalid_date(self):
        raw = {
            "id": 88888,
            "position": "Security Engineer",
            "company": "SecCo",
            "tags": ["security"],
            "date": "not-a-date",
        }
        job = self.connector._normalize(raw)
        assert job is not None
        assert job.posted_at is None

    def test_detects_grc_specialty(self):
        raw = {
            "id": 99999,
            "position": "GRC Analyst",
            "company": "ComplianceCo",
            "tags": ["compliance", "iso 27001", "gdpr"],
            "description": "Manage GRC framework and compliance requirements",
        }
        job = self.connector._normalize(raw)
        assert job is not None
        assert "grc" in job.specialties

    def test_detects_iam_specialty(self):
        raw = {
            "id": 11111,
            "position": "IAM Engineer",
            "company": "IdentityCo",
            "tags": ["identity", "iam", "zero trust"],
            "description": "Implement zero trust identity and access management",
        }
        job = self.connector._normalize(raw)
        assert job is not None
        assert "iam" in job.specialties

    def test_source_name(self):
        assert self.connector.source_name == "remoteok"
