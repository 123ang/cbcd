"""Regression check for optional vision dependencies at API startup."""

import builtins
import importlib.util
from pathlib import Path
from unittest.mock import patch


def test_unsupported_cv2_cpu_does_not_break_module_import():
    module_path = Path(__file__).parent / "utils" / "crowd_detector.py"
    spec = importlib.util.spec_from_file_location("crowd_detector_without_cv2", module_path)
    module = importlib.util.module_from_spec(spec)
    real_import = builtins.__import__

    def import_with_unsupported_cv2(name, *args, **kwargs):
        if name == "cv2":
            raise RuntimeError("NumPy requires unsupported X86_V2 instructions")
        if name == "ultralytics":
            raise AssertionError("YOLO must not retry a broken OpenCV/NumPy import")
        return real_import(name, *args, **kwargs)

    with patch("builtins.__import__", side_effect=import_with_unsupported_cv2):
        spec.loader.exec_module(module)

    assert module.cv2 is None
    assert module.np is None
    assert module.YOLO is None
    try:
        module._require_cv2()
    except RuntimeError as exc:
        assert "unavailable" in str(exc)
    else:
        raise AssertionError("Camera analysis must report unavailable dependencies")


if __name__ == "__main__":
    test_unsupported_cv2_cpu_does_not_break_module_import()
    print("optional vision import test passed")
