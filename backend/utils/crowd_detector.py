import base64
import os
import tempfile
from pathlib import Path
from statistics import mean
from typing import Any, Dict, List, Optional, Tuple

try:
    import cv2
    import numpy as np
except ModuleNotFoundError:  # pragma: no cover - exercised when dependencies are missing.
    cv2 = None
    np = None

os.environ.setdefault("YOLO_CONFIG_DIR", str(Path(tempfile.gettempdir()) / "Ultralytics"))
os.environ.setdefault("MPLCONFIGDIR", str(Path(tempfile.gettempdir()) / "matplotlib"))

try:
    from ultralytics import YOLO
except ModuleNotFoundError:  # pragma: no cover - exercised when dependencies are missing.
    YOLO = None

HOG_MODEL_NAME = "opencv-hog-default-people-detector"
DEFAULT_YOLO_MODEL = "yolov8n.pt"
PERSON_CLASS_ID = 0
MAX_UPLOAD_BYTES = 50 * 1024 * 1024
VIDEO_FRAME_STEP = 12
VIDEO_MAX_FRAMES = 12
_YOLO_CACHE: Dict[str, Any] = {}


def _require_cv2():
    if cv2 is None or np is None:
        raise RuntimeError(
            "OpenCV is not installed. Install backend requirements to enable real crowd detection."
        )


def _detector_backend() -> str:
    configured = os.getenv("CBCD_DETECTOR_BACKEND", "auto").strip().lower()
    return configured if configured in {"yolo", "hog", "auto"} else "yolo"


def _yolo_model_name() -> str:
    return os.getenv("CBCD_YOLO_MODEL", DEFAULT_YOLO_MODEL).strip() or DEFAULT_YOLO_MODEL


def crowd_level_for_density(density: float) -> Dict[str, Any]:
    value = max(float(density or 0), 0.0)
    if value < 0.5:
        return {"level": "none", "intensity": 0}
    if value < 1.5:
        return {"level": "low", "intensity": 1}
    if value < 3:
        return {"level": "medium", "intensity": 2}
    if value < 4:
        return {"level": "high", "intensity": 3}
    return {"level": "critical", "intensity": 3}


def _hog_detector():
    _require_cv2()
    hog = cv2.HOGDescriptor()
    hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
    return hog


def _yolo_model(model_name: Optional[str] = None):
    if YOLO is None:
        raise RuntimeError("Ultralytics YOLO is not installed.")
    selected = model_name or _yolo_model_name()
    if selected not in _YOLO_CACHE:
        _YOLO_CACHE[selected] = YOLO(selected)
    return _YOLO_CACHE[selected]


def _confidence_from_weight(weight: float) -> float:
    return round(max(0.0, min(float(weight), 3.0)) / 3.0, 3)


def _resize_for_detection(frame):
    height, width = frame.shape[:2]
    max_width = 960
    if width <= max_width:
        return frame, 1.0
    scale = max_width / width
    resized = cv2.resize(frame, (max_width, int(height * scale)))
    return resized, scale


def _nms_boxes(boxes, weights):
    if not boxes:
        return []
    scores = [_confidence_from_weight(w) for w in weights]
    indexes = cv2.dnn.NMSBoxes(boxes, scores, score_threshold=0.05, nms_threshold=0.35)
    if len(indexes) == 0:
        return []
    flat_indexes = indexes.flatten() if hasattr(indexes, "flatten") else indexes
    return [int(i) for i in flat_indexes]


def _to_float_list(value):
    if value is None:
        return []
    if hasattr(value, "detach"):
        value = value.detach()
    if hasattr(value, "cpu"):
        value = value.cpu()
    if hasattr(value, "numpy"):
        value = value.numpy()
    if hasattr(value, "tolist"):
        return value.tolist()
    return value


def yolo_detections_from_result(result) -> List[Dict[str, Any]]:
    boxes = getattr(result, "boxes", None)
    if boxes is None:
        return []
    xyxy_values = _to_float_list(getattr(boxes, "xyxy", []))
    class_values = _to_float_list(getattr(boxes, "cls", []))
    confidence_values = _to_float_list(getattr(boxes, "conf", []))
    detections = []
    for idx, xyxy in enumerate(xyxy_values):
        class_id = int(class_values[idx]) if idx < len(class_values) else None
        if class_id != PERSON_CLASS_ID:
            continue
        confidence = float(confidence_values[idx]) if idx < len(confidence_values) else 0
        x1, y1, x2, y2 = [float(v) for v in xyxy[:4]]
        detections.append(
            {
                "x": round(x1),
                "y": round(y1),
                "width": round(max(x2 - x1, 0)),
                "height": round(max(y2 - y1, 0)),
                "confidence": round(confidence, 3),
            }
        )
    return detections


def _detect_people_yolo(frame, model=None) -> List[Dict[str, Any]]:
    selected_model = model or _yolo_model()
    results = selected_model.predict(frame, classes=[PERSON_CLASS_ID], conf=0.25, verbose=False)
    if not results:
        return []
    return yolo_detections_from_result(results[0])


def _detect_people_hog(frame, detector=None) -> List[Dict[str, Any]]:
    detector = detector or _hog_detector()
    resized, scale = _resize_for_detection(frame)
    rects, weights = detector.detectMultiScale(
        resized,
        winStride=(8, 8),
        padding=(8, 8),
        scale=1.05,
    )
    boxes = [[int(x), int(y), int(w), int(h)] for x, y, w, h in rects]
    keep = _nms_boxes(boxes, weights)
    detections = []
    for idx in keep:
        x, y, width, height = boxes[idx]
        detections.append(
            {
                "x": round(x / scale),
                "y": round(y / scale),
                "width": round(width / scale),
                "height": round(height / scale),
                "confidence": _confidence_from_weight(weights[idx]),
            }
        )
    return detections


def detect_people_in_frame(frame, detector=None) -> List[Dict[str, Any]]:
    return _detect_people_hog(frame, detector)


def detect_people_in_frame_with_model(frame, yolo_model=None, hog_detector=None) -> Tuple[List[Dict[str, Any]], str]:
    backend = _detector_backend()
    if backend in {"yolo", "auto"}:
        try:
            return _detect_people_yolo(frame, yolo_model), f"ultralytics-{_yolo_model_name()}-person"
        except Exception:
            if backend == "yolo":
                raise
    return _detect_people_hog(frame, hog_detector), HOG_MODEL_NAME


def _image_data_url(frame) -> str:
    ok, encoded = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 82])
    if not ok:
        return ""
    raw = base64.b64encode(encoded.tobytes()).decode("ascii")
    return f"data:image/jpeg;base64,{raw}"


def summarize_detections(frames: List[Dict[str, Any]], width: int, height: int, model: str = HOG_MODEL_NAME):
    if not frames:
        return {
            "media_type": "unknown",
            "model": model,
            "image_width": width,
            "image_height": height,
            "frames_analyzed": 0,
            "people_count": 0,
            "average_people_count": 0,
            "peak_frame_index": None,
            "confidence_avg": 0,
            "detections": [],
            "frame_results": [],
        }
    peak = max(frames, key=lambda item: len(item.get("detections", [])))
    counts = [len(item.get("detections", [])) for item in frames]
    confidences = [
        det.get("confidence", 0)
        for item in frames
        for det in item.get("detections", [])
    ]
    return {
        "model": model,
        "image_width": width,
        "image_height": height,
        "frames_analyzed": len(frames),
        "people_count": len(peak.get("detections", [])),
        "average_people_count": round(mean(counts), 3),
        "peak_frame_index": peak.get("frame_index"),
        "confidence_avg": round(mean(confidences), 3) if confidences else 0,
        "detections": peak.get("detections", []),
        "frame_results": [
            {
                "frame_index": item.get("frame_index"),
                "people_count": len(item.get("detections", [])),
            }
            for item in frames
        ],
    }


def analyze_image_bytes(raw: bytes) -> Dict[str, Any]:
    _require_cv2()
    frame = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Uploaded image could not be decoded.")
    detections, model_name = detect_people_in_frame_with_model(frame)
    height, width = frame.shape[:2]
    summary = summarize_detections(
        [{"frame_index": 0, "detections": detections}],
        width=width,
        height=height,
        model=model_name,
    )
    summary["media_type"] = "image"
    summary["preview_image_data_url"] = _image_data_url(frame)
    return summary


def analyze_video_bytes(raw: bytes, suffix: str = ".mp4") -> Dict[str, Any]:
    _require_cv2()
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as fh:
        fh.write(raw)
        temp_path = Path(fh.name)
    try:
        capture = cv2.VideoCapture(str(temp_path))
        if not capture.isOpened():
            raise ValueError("Uploaded video could not be opened.")
        backend = _detector_backend()
        yolo_model = None
        hog_detector = None
        if backend == "yolo":
            yolo_model = _yolo_model()
        elif backend == "auto":
            try:
                yolo_model = _yolo_model()
            except Exception:
                hog_detector = _hog_detector()
        else:
            hog_detector = _hog_detector()
        model_name = f"ultralytics-{_yolo_model_name()}-person" if yolo_model is not None else HOG_MODEL_NAME
        frames = []
        preview_frame = None
        width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
        height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
        index = 0
        while len(frames) < VIDEO_MAX_FRAMES:
            ok, frame = capture.read()
            if not ok:
                break
            if index % VIDEO_FRAME_STEP == 0:
                try:
                    detections, model_name = detect_people_in_frame_with_model(frame, yolo_model, hog_detector)
                except Exception:
                    capture.release()
                    raise
                frames.append({"frame_index": index, "detections": detections, "_frame": frame})
            index += 1
        capture.release()
        public_frames = [
            {"frame_index": item["frame_index"], "detections": item["detections"]}
            for item in frames
        ]
        summary = summarize_detections(public_frames, width=width, height=height, model=model_name)
        summary["media_type"] = "video"
        if frames:
            peak = max(frames, key=lambda item: len(item.get("detections", [])))
            preview_frame = peak.get("_frame")
        summary["preview_image_data_url"] = _image_data_url(preview_frame) if preview_frame is not None else ""
        return summary
    finally:
        temp_path.unlink(missing_ok=True)


def analyze_media_upload(raw: bytes, filename: str, content_type: str = "") -> Dict[str, Any]:
    if len(raw) > MAX_UPLOAD_BYTES:
        raise ValueError("Upload is larger than the 50 MB prototype limit.")
    lower_name = (filename or "").lower()
    media_type = (content_type or "").lower()
    if media_type.startswith("image/") or lower_name.endswith((".jpg", ".jpeg", ".png", ".webp")):
        return analyze_image_bytes(raw)
    if media_type.startswith("video/") or lower_name.endswith((".mp4", ".mov", ".m4v", ".avi")):
        suffix = Path(lower_name).suffix or ".mp4"
        return analyze_video_bytes(raw, suffix=suffix)
    raise ValueError("Please upload a supported image or video file.")
