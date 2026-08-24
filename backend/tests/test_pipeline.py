"""Tests for pipeline orchestration"""
import sys
import os
import asyncio
from unittest.mock import patch, AsyncMock, MagicMock
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.jobs_ingestor.base import NormalizedJob


class TestPipeline:
    def test_connectors_registry(self):
        from app.services.jobs_ingestor.pipeline import CONNECTORS
        assert "remoteok" in CONNECTORS

    def test_unknown_connector_raises(self):
        from app.services.jobs_ingestor.pipeline import run_pipeline
        with pytest.raises(ValueError, match="Conector desconocido"):
            asyncio.run(run_pipeline("nonexistent_source"))

    @patch("app.services.jobs_ingestor.pipeline.upsert_jobs", new_callable=AsyncMock)
    @patch("app.services.jobs_ingestor.pipeline.CONNECTORS")
    def test_dry_run_mode(self, mock_connectors, mock_upsert):
        from app.services.jobs_ingestor.pipeline import run_pipeline
        mock_connector_instance = MagicMock()
        mock_connector_instance.fetch = AsyncMock(return_value=[
            NormalizedJob(
                source="remoteok", source_id="1",
                title="SOC Analyst", company="SecCo", level="junior",
            )
        ])
        mock_connector_cls = MagicMock(return_value=mock_connector_instance)
        mock_connectors.get.return_value = mock_connector_cls

        result = asyncio.run(run_pipeline("remoteok", db_session=None))
        assert result["fetched"] == 1
        assert result["dry_run"] is True

    @patch("app.services.jobs_ingestor.pipeline.CONNECTORS")
    def test_empty_fetch_returns_zeros(self, mock_connectors):
        from app.services.jobs_ingestor.pipeline import run_pipeline
        mock_connector_instance = MagicMock()
        mock_connector_instance.fetch = AsyncMock(return_value=[])
        mock_connector_cls = MagicMock(return_value=mock_connector_instance)
        mock_connectors.get.return_value = mock_connector_cls

        result = asyncio.run(run_pipeline("remoteok", db_session=None))
        assert result["fetched"] == 0
        assert result["inserted"] == 0

    @patch("app.services.jobs_ingestor.pipeline.upsert_jobs", new_callable=AsyncMock)
    @patch("app.services.jobs_ingestor.pipeline.CONNECTORS")
    def test_with_db_session(self, mock_connectors, mock_upsert):
        from app.services.jobs_ingestor.pipeline import run_pipeline
        mock_connector_instance = MagicMock()
        mock_connector_instance.fetch = AsyncMock(return_value=[
            NormalizedJob(
                source="remoteok", source_id="1",
                title="SOC Analyst", company="SecCo", level="junior",
            )
        ])
        mock_connector_cls = MagicMock(return_value=mock_connector_instance)
        mock_connectors.get.return_value = mock_connector_cls
        mock_upsert.return_value = {"inserted": 1, "updated": 0, "errors": 0}

        mock_db = MagicMock()
        result = asyncio.run(run_pipeline("remoteok", db_session=mock_db))
        assert result["fetched"] == 1
        assert result["inserted"] == 1
        mock_upsert.assert_called_once()

import pytest
