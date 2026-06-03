# Stage D - iPhone / Camera Computer Vision Input

Date: 2026-06-02

## Current Implementation Status

Stage D is now implemented as a web upload/capture workflow, not as live streaming or a native iPhone app.

Implemented:

- `Camera Vision` tab in the React app.
- Camera labels with source type: iPhone, CCTV/IP camera, or uploaded media.
- Camera marker on the coverage map.
- Clickable floor-plan grid coverage cells for each camera.
- Coverage percentage against walkable grid cells.
- Real-world area per grid cell for density calculation.
- Built-in sample photo/video buttons for quick YOLO testing.
- Upload control for iPhone/CCTV photos and short videos.
- Backend `/camera/crowd` multipart upload endpoint.
- Ultralytics YOLO `yolov8n.pt` as the primary person detector.
- OpenCV HOG fallback if YOLO is unavailable in auto mode.
- Bounding-box preview, people count, average confidence, frame count, and peak-frame result.
- Density conversion: people count / mapped coverage area.
- Crowd-level conversion into existing route-grid crowd intensity.
- Scenario JSON preservation through `metadata.vision_input`.
- Built-in `S7 YOLO camera crowd update` scenario for article/demo evidence.

Important limitation:

The current detector is YOLO-based, but it is still an object detector, not a specialized dense-crowd counting model. It should work best when people are visible enough to be detected as individual persons. Dense occlusion may require a stronger crowd-counting model later.

## Goal

Stage D adds a practical computer-vision input path for the current risk-aware indoor navigation prototype. The aim is not to build the full commercial camera network immediately. The aim is to show that an iPhone or camera image can provide visual crowd input that is converted into crowd-density scores and mapped into the existing grid/floor-plan route model.

The Stage D contribution should be:

`iPhone visual input -> people detection/counting -> zone or grid crowd score -> route-cost update -> safer route explanation`

## Recommended Direction

Use the iPhone first as a low-cost pilot sensing device, not as the final building-wide deployment device.

The implemented research path is:

1. Use the current web app to upload/capture an image or short video from iPhone.
2. Run YOLO person detection on the uploaded frame/video.
3. Return people count, bounding boxes, and confidence.
4. Let the user manually map detection regions to floor-plan zones/cells.
5. Convert mapped detections into crowd-level cells.
6. Re-run the existing route algorithms.

For the current demo, the downloaded sample photo and video are available through the Camera Vision tab. The built-in S7 scenario demonstrates the route-planning effect after YOLO-derived crowd cells are applied.

This keeps Stage D aligned with the existing prototype and avoids overbuilding a native iOS app too early.

## Three Implementation Options

### Option A - Web Upload/Capture From iPhone

This is the best first implementation.

How it works:

- Add an `iPhone Capture` or `Computer Vision Input` panel to the existing web app.
- On iPhone Safari, the user selects/captures a photo or video using an upload control.
- The frontend sends the media to a backend detection endpoint.
- Backend returns people count, bounding boxes, and confidence.
- The frontend displays the frame with detections and lets the user assign detection regions to the floor-plan grid.

Strengths:

- Fastest to build.
- No Apple Developer account needed for the prototype.
- Works with ordinary iPhone camera.
- Good for demos and article validation.
- Keeps detection logic in the existing backend.

Weaknesses:

- Not true live CCTV.
- Camera angle and floor-plan mapping are manual at first.
- Video processing may be slower if handled frame-by-frame.

This option is now implemented for Stage D.

### Option B - iPhone As Continuity Camera For Mac Demo

This is useful for a live demo, not the main product architecture.

How it works:

- Mount the iPhone above a printed floor plan or small indoor mockup.
- Use Apple Continuity Camera so the Mac sees the iPhone as a webcam.
- The web app or backend reads that camera stream and runs detection.

Strengths:

- Looks good in a live demo.
- Uses iPhone rear camera quality.
- Avoids building native iOS code.

Weaknesses:

- Requires Mac + iPhone setup.
- It is a demo capture method, not a deployable building product.
- Stability depends on Continuity Camera requirements.

Use this for a later live demonstration after the upload workflow is accepted.

### Option C - Native iPhone App

This is best for later research/product development.

How it works:

- Build a Swift iOS app.
- Use AVFoundation for live camera capture.
- Use Vision + Core ML for on-device person/head detection.
- Optionally use ARKit scene depth / LiDAR on supported devices for depth-aware estimation.
- Send only counts, bounding boxes, zone IDs, and confidence scores to the backend.

Strengths:

- Most professional.
- Can run on device.
- Better privacy story if only derived analytics are sent.
- Can later support LiDAR/depth and AR floor-plan calibration.

Weaknesses:

- Slower to build.
- Requires Apple Developer tooling.
- LiDAR is not available on every iPhone, so the app must check support at runtime.
- More difficult to test and maintain.

Use this only after the web capture pipeline proves the research logic.

## Recommended Stage D Breakdown

### D1 - Image Capture And Detection

Frontend:

- Implemented through the `Camera Vision` tab.
- Allows image/video upload or iPhone capture through browser file input.
- Shows detector preview, people count, confidence, frames analyzed, and bounding boxes.

Backend:

- Implemented through `/camera/crowd`.
- Accepts image or short-video upload.
- Runs Ultralytics YOLO person detection, with OpenCV HOG fallback in auto mode.
- Returns:
  - total people count
  - bounding boxes
  - confidence
  - image width/height
  - detection model name/version

Prototype output:

- "Detected 14 people in uploaded frame."
- "Crowd level: medium/high based on selected zone area."

### D2 - Mapping Detection To Floor-Plan Grid

Frontend:

- Implemented as camera coverage cells on the floor-plan grid.
- User clicks cells that the camera covers.
- Detected people are divided by mapped coverage area.
- Density is converted into route-grid crowd intensity.

Data model:

```json
{
  "metadata": {
    "vision_input": {
      "cameras": [
        {
          "id": "cam-123",
          "name": "Camera 1",
          "source_type": "iphone",
          "coverage_cells": [[8, 10], [8, 11]],
          "cell_area_m2": 1,
          "last_analysis": {
            "people_count": 14,
            "density": 2.4,
            "crowd_level": "medium",
            "crowd_intensity": 2,
            "model": "ultralytics-yolov8n.pt-person",
            "detections": [
              {"x": 120, "y": 80, "width": 40, "height": 120, "confidence": 0.91}
            ]
          }
        }
      ]
    }
  }
}
```

Prototype output:

- The grid crowd cells update from the image input.
- Weighted A* can choose a safer route when camera-derived crowd density increases.

### D3 - Video Or Live Demo

Options:

- Uploaded short-video frame sampling is implemented.
- Use Continuity Camera for a live Mac demo.
- Later, build native iOS capture if needed.

Prototype output:

- Dynamic crowd update scenario:
  - low crowd frame -> route A selected
  - high crowd frame -> route B selected
  - dashboard explains crowd exposure reduction

### D4 - Native iPhone Research Prototype

Only start this after D1-D3 work.

Native iOS components:

- AVFoundation camera capture.
- Vision/Core ML detection request.
- Optional ARKit scene-depth support on LiDAR-capable devices.
- HTTPS/WebSocket event stream to backend.
- Privacy mode that sends only derived detections, not raw video.

## iPhone Technical Notes

Apple supports several relevant building blocks:

- AVFoundation provides camera capture sessions and media processing.
- Vision can run object-recognition workflows on live capture using Core ML models.
- Core ML supports on-device model inference.
- ARKit can use camera/motion features, and LiDAR-capable devices can expose scene depth for depth-aware workflows.
- Continuity Camera can use an iPhone as a Mac webcam for a demo setup.

Important limitation:

Do not claim all iPhones provide LiDAR. Treat LiDAR as an optional enhancement for supported Pro devices and check device capability at runtime.

## How This Connects To Stage C

Stage C gives us the floor plan and grid.

Stage D should not create a separate computer-vision demo that floats outside the routing model. It must feed the existing grid:

1. Detect people from iPhone input.
2. Estimate count/density by region.
3. Convert density to crowd cell intensity.
4. Re-run Dijkstra, A*, Weighted A*, and Q-learning.
5. Explain route change.

The current implementation follows this connection by applying vision-derived crowd cells to the same grid used by the route algorithms.

This is the strongest article/prototype claim.

## Patent-Safe Boundary

Public demo:

- Show iPhone input.
- Show detected count.
- Show crowd cells updating.
- Show route recommendation changing.

Keep private:

- Any proprietary ASNA/SDSOS optimization logic.
- Exact scoring rules if they are part of patent novelty.
- Detailed internal algorithm flow beyond what is needed for academic framework discussion.

## Business Interpretation

iPhone support is useful for:

- low-cost pilot deployment
- demo without CCTV integration
- campus/building proof of concept
- event temporary monitoring
- investor/patent demonstration

Long-term commercial deployment should support fixed CCTV, IP cameras, edge devices, or LiDAR sensors. The iPhone path is a bridge into that business version.

## Sources Checked

- Apple Support, Continuity Camera: `https://support.apple.com/en-us/HT213244`
- Apple Developer, AVFoundation / `AVCaptureSession`: `https://developer.apple.com/documentation/avfoundation/avcapturesession`
- Apple Developer, Vision object recognition in live capture: `https://developer.apple.com/documentation/vision/recognizing-objects-in-live-capture`
- Apple Developer, Core ML overview: `https://developer.apple.com/machine-learning/core-ml/`
- Apple Developer, ARKit in iOS: `https://developer.apple.com/documentation/arkit/arkit_in_ios`
- Apple Developer, scene depth / LiDAR point cloud sample: `https://developer.apple.com/documentation/arkit/visualizing_a_point_cloud_using_scene_depth`
