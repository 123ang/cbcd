import json

import numpy as np

from utils.crowd_detector import crowd_level_for_density, summarize_detections, yolo_detections_from_result


def test_crowd_level_for_density_uses_route_scoring_categories():
    assert crowd_level_for_density(0) == {"level": "none", "intensity": 0}
    assert crowd_level_for_density(0.75) == {"level": "low", "intensity": 1}
    assert crowd_level_for_density(2.0) == {"level": "medium", "intensity": 2}
    assert crowd_level_for_density(3.5) == {"level": "high", "intensity": 3}
    assert crowd_level_for_density(4.5) == {"level": "critical", "intensity": 3}


def test_summarize_detections_keeps_peak_video_frame_for_counting():
    frames = [
        {"frame_index": 0, "detections": []},
        {
            "frame_index": 8,
            "detections": [
                {"x": 10, "y": 20, "width": 30, "height": 40, "confidence": 0.8},
                {"x": 80, "y": 20, "width": 30, "height": 40, "confidence": 0.7},
            ],
        },
        {
            "frame_index": 16,
            "detections": [
                {"x": 10, "y": 20, "width": 30, "height": 40, "confidence": 0.8},
            ],
        },
    ]

    summary = summarize_detections(frames, width=640, height=360, model="test-model")

    assert summary["people_count"] == 2
    assert summary["average_people_count"] == 1.0
    assert summary["peak_frame_index"] == 8
    assert len(summary["detections"]) == 2
    json.dumps(summary)


def test_yolo_detections_from_result_filters_to_person_class():
    class FakeBoxes:
        xyxy = np.array([[10, 20, 50, 100], [200, 10, 260, 90]], dtype=float)
        cls = np.array([0, 2], dtype=float)
        conf = np.array([0.91, 0.7], dtype=float)

    class FakeResult:
        boxes = FakeBoxes()

    detections = yolo_detections_from_result(FakeResult())

    assert detections == [
        {"x": 10, "y": 20, "width": 40, "height": 80, "confidence": 0.91}
    ]


def test_camera_crowd_endpoint_accepts_image_upload():
    import os

    import cv2
    from fastapi.testclient import TestClient

    from main import app

    os.environ["CBCD_DETECTOR_BACKEND"] = "hog"
    image = np.full((180, 240, 3), 255, dtype=np.uint8)
    ok, buffer = cv2.imencode(".jpg", image)
    assert ok

    response = TestClient(app).post(
        "/camera/crowd",
        files={"media": ("blank.jpg", buffer.tobytes(), "image/jpeg")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["media_type"] == "image"
    assert payload["people_count"] == 0
    assert payload["frames_analyzed"] == 1
    assert payload["preview_image_data_url"].startswith("data:image/jpeg;base64,")


if __name__ == "__main__":
    test_crowd_level_for_density_uses_route_scoring_categories()
    test_summarize_detections_keeps_peak_video_frame_for_counting()
    test_yolo_detections_from_result_filters_to_person_class()
    test_camera_crowd_endpoint_accepts_image_upload()
    print("crowd detector tests passed")
