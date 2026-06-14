import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient
from pydantic import ValidationError

import algorithms.pathfinding as pathfinding
import main
from utils.models import ScenarioRequest


def scenario_payload(rows=2, cols=2):
    grid = [[{"type": "empty"} for _ in range(cols)] for _ in range(rows)]
    return {
        "name": "Safety test",
        "grid": grid,
        "start": [0, 0],
        "exits": [[rows - 1, cols - 1]],
    }


class ScenarioValidationTests(unittest.TestCase):
    def assert_invalid(self, payload):
        with self.assertRaises(ValidationError):
            ScenarioRequest(**payload)

    def test_rejects_empty_ragged_and_oversized_grids(self):
        empty = scenario_payload()
        empty["grid"] = []
        self.assert_invalid(empty)

        ragged = scenario_payload()
        ragged["grid"] = [[{"type": "empty"}], [{"type": "empty"}, {"type": "empty"}]]
        self.assert_invalid(ragged)

        self.assert_invalid(scenario_payload(rows=81, cols=1))
        self.assert_invalid(scenario_payload(rows=1, cols=81))

    def test_rejects_missing_or_invalid_route_points(self):
        no_exits = scenario_payload()
        no_exits["exits"] = []
        self.assert_invalid(no_exits)

        bad_start = scenario_payload()
        bad_start["start"] = [9, 9]
        self.assert_invalid(bad_start)

        blocked_exit = scenario_payload()
        blocked_exit["grid"][1][1] = {"type": "wall"}
        self.assert_invalid(blocked_exit)


class ApiSafetyTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(main.app, raise_server_exceptions=False)
        limiter = getattr(main.app.state, "rate_limiter", None)
        if limiter is not None:
            limiter.clear()

    def test_compare_selected_rejects_missing_scenario_and_unknown_algorithms(self):
        missing = self.client.post("/compare-selected", json={"algorithms": ["dijkstra"]})
        self.assertEqual(missing.status_code, 422)

        unknown = self.client.post(
            "/compare-selected",
            json={"scenario": scenario_payload(), "algorithms": ["not-real"]},
        )
        self.assertEqual(unknown.status_code, 422)

        empty = self.client.post(
            "/compare-selected",
            json={"scenario": scenario_payload(), "algorithms": []},
        )
        self.assertEqual(empty.status_code, 422)

    def test_cors_only_allows_configured_frontend_origins(self):
        allowed = self.client.options(
            "/compare-selected",
            headers={
                "Origin": "https://cbcd.suntzutechnologies.com",
                "Access-Control-Request-Method": "POST",
            },
        )
        self.assertEqual(
            allowed.headers.get("access-control-allow-origin"),
            "https://cbcd.suntzutechnologies.com",
        )

        denied = self.client.options(
            "/compare-selected",
            headers={
                "Origin": "https://attacker.example",
                "Access-Control-Request-Method": "POST",
            },
        )
        self.assertNotIn("access-control-allow-origin", denied.headers)

    def test_write_routes_fail_closed_without_an_operator_api_key(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            scenario_file = Path(temp_dir) / "scenarios.json"
            with (
                patch.object(main, "SCENARIOS", scenario_file),
                patch.dict(os.environ, {}, clear=False),
            ):
                os.environ.pop("CBCD_API_KEY", None)
                response = self.client.post("/save-scenario", json=scenario_payload())

        self.assertEqual(response.status_code, 503)
        self.assertFalse(scenario_file.exists())

    def test_write_routes_require_the_configured_api_key(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            scenario_file = Path(temp_dir) / "scenarios.json"
            with (
                patch.object(main, "SCENARIOS", scenario_file),
                patch.dict(os.environ, {"CBCD_API_KEY": "operator-secret"}),
            ):
                missing = self.client.post("/save-scenario", json=scenario_payload())
                wrong = self.client.post(
                    "/save-scenario",
                    json=scenario_payload(),
                    headers={"X-API-Key": "wrong"},
                )
                accepted = self.client.post(
                    "/save-scenario",
                    json=scenario_payload(),
                    headers={"X-API-Key": "operator-secret"},
                )

        self.assertEqual(missing.status_code, 401)
        self.assertEqual(wrong.status_code, 401)
        self.assertEqual(accepted.status_code, 200)

    def test_compute_routes_are_rate_limited_per_client(self):
        with patch.dict(os.environ, {"CBCD_COMPUTE_RATE_LIMIT": "2"}):
            first = self.client.post("/run-dijkstra", json=scenario_payload())
            second = self.client.post("/run-dijkstra", json=scenario_payload())
            limited = self.client.post("/run-dijkstra", json=scenario_payload())

        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(limited.status_code, 429)
        self.assertIn("retry-after", limited.headers)

    def test_qlearning_rejects_grids_above_its_compute_budget(self):
        with patch.object(main, "qlearning") as qlearning:
            response = self.client.post(
                "/run-qlearning",
                json=scenario_payload(rows=51, cols=50),
            )

        self.assertEqual(response.status_code, 422)
        qlearning.assert_not_called()

    def test_camera_upload_rejects_content_beyond_limit_before_analysis(self):
        with (
            patch.object(main, "MAX_UPLOAD_BYTES", 8, create=True),
            patch.object(main, "analyze_media_upload") as analyze,
        ):
            response = self.client.post(
                "/camera/crowd",
                files={"media": ("large.jpg", b"123456789", "image/jpeg")},
            )

        self.assertEqual(response.status_code, 413)
        analyze.assert_not_called()


class QTablePersistenceTests(unittest.TestCase):
    def test_qlearning_does_not_persist_by_default(self):
        req = ScenarioRequest(**scenario_payload(rows=1, cols=2))
        with (
            patch.dict(os.environ, {}, clear=False),
            patch.object(Path, "mkdir") as mkdir,
            patch.object(Path, "write_text") as write_text,
        ):
            os.environ.pop("CBCD_PERSIST_Q_TABLES", None)
            pathfinding.qlearning(req)

        mkdir.assert_not_called()
        write_text.assert_not_called()

    def test_opt_in_q_table_storage_enforces_file_limit(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            with (
                patch.object(pathfinding, "Q_TABLE_DIR", Path(temp_dir), create=True),
                patch.dict(
                    os.environ,
                    {
                        "CBCD_PERSIST_Q_TABLES": "true",
                        "CBCD_Q_TABLE_MAX_FILES": "2",
                    },
                ),
            ):
                pathfinding.persist_q_table("one", {"q": {}})
                pathfinding.persist_q_table("two", {"q": {}})
                pathfinding.persist_q_table("three", {"q": {}})

            self.assertEqual(len(list(Path(temp_dir).glob("*.json"))), 2)
            self.assertFalse((Path(temp_dir) / "one.json").exists())


if __name__ == "__main__":
    unittest.main()
