# Stage 1 Article Literature Summary

Source folder: `article/`  
Purpose: summarize the downloaded papers to support the first CBCD Stage 1 conceptual framework paper.

---

## Overall Synthesis

The reviewed literature supports the development of a **camera-assisted, risk-aware indoor navigation and decision-support framework** for confined environments. The papers can be grouped into five main research streams:

1. **Indoor fire evacuation routing** — studies show that shortest-path routing is insufficient during fire or hazardous conditions because route safety changes dynamically due to smoke, blockage, crowd congestion, visibility, and spatial semantics.
2. **Dynamic risk-aware path planning** — recent works integrate smoke, congestion, structural damage, and other hazard data into path cost functions, moving from geometric shortest paths to safer risk-optimal routes.
3. **Crowd detection and crowd counting** — YOLO-based detection and deep learning crowd-counting methods provide technical support for estimating crowd density from cameras in real time.
4. **Indoor localization and assistive evacuation systems** — indoor positioning remains difficult, but multimodal sensing and mobile/edge systems can support practical route guidance and adaptive decision making.
5. **Research methodology** — design science research and PRISMA provide justification for developing a conceptual framework and reporting literature review procedures transparently.

For the CBCD project, the key research gap is that many studies address **evacuation routing**, **hazard simulation**, **crowd detection**, or **decision-support systems** separately. Fewer studies integrate camera-based crowd perception directly into a risk-aware indoor navigation framework with route recommendation, visualization, and feedback-based replanning.

---

## Paper-by-Paper Summary

### 1. Three-Dimensional Indoor Fire Evacuation Routing

**File:** `three_dimensional_indoor_fire_evacuation_routing.pdf`

**Main focus:**  
This paper proposes a multi-semantic constrained 3D indoor fire evacuation routing method. It argues that traditional indoor navigation algorithms mainly consider geometric information, while fire evacuation requires additional semantic and environmental factors.

**Method / approach:**

- Extends indoor spatial modelling using IndoorGML-related concepts.
- Considers fire-related routing semantics such as path accessibility, path recognition degree, and fire parameters.
- Establishes a navigation cost function that reflects semantic changes during fire.
- Builds an A*-based routing algorithm with multiple semantic constraints.

**Key findings:**

- Traditional algorithms may generate unsafe routes because they ignore fire-related semantics.
- The proposed method can remove unusable nodes and edges from the evacuation path.
- The generated routes are safer and more effective than routes based only on geometric shortest path.

**Relevance to CBCD:**

This paper strongly supports the argument that indoor navigation should not rely only on shortest distance. It justifies CBCD’s use of multiple cost factors such as distance, risk, crowd condition, and exit suitability.

**How to use in Stage 1 paper:**

Use this paper in the literature review section on **risk-aware indoor navigation and fire evacuation routing**. It supports the need for semantic and risk-based route planning.

---

### 2. Algorithmic Evaluation of Fire Evacuation Efficiency Under Dynamic Crowd and Smoke Conditions

**File:** `algorithmic_evaluation_fire_evacuation_dynamic_crowd_smoke.pdf`

**Main focus:**  
This study evaluates evacuation efficiency in an underground station under static and dynamic conditions, including structural damage, smoke propagation, and real-time crowd congestion.

**Method / approach:**

- Uses a six-level underground station simulation model.
- Compares Dijkstra and A* algorithms.
- Tests multiple fire scenarios and disaster locations.
- Considers static structural damage and dynamic variables such as smoke and crowd congestion.

**Key findings:**

- Under static conditions, Dijkstra and A* produce identical maximum evacuation times.
- A* requires significantly less computation time than Dijkstra.
- Under dynamic smoke and crowd congestion, performance varies irregularly depending on scenario and disaster location.
- Real-time data alone may be insufficient; predictive disaster management and dynamic control are important.

**Relevance to CBCD:**

This paper directly supports CBCD’s comparison between Dijkstra, A*, and Weighted A*. It also supports the decision to treat time/search efficiency as supporting metrics while using total cost as the final decision metric.

**How to use in Stage 1 paper:**

Use it to justify algorithm comparison and the importance of dynamic risk/crowd factors in confined spaces.

---

### 3. Assistive Mobile Application for Fire Emergency Evacuation of Visually Impaired People

**File:** `assistive_mobile_application_fire_evacuation_visually_impaired.pdf`

**Main focus:**  
This paper presents a mobile application for fire evacuation guidance for visually impaired individuals. It focuses on dynamic route computation, real-time sensor data, and accessible navigation instructions.

**Method / approach:**

- Implements a Flutter/Dart mobile application.
- Uses modified Dijkstra routing on the user’s phone.
- Incorporates dynamic edge weights from smoke density, fire proximity, and crowd congestion.
- Uses audio-visual guidance and Wi-Fi RSSI-based positioning.
- Emphasizes decentralized computation to maintain operation if building infrastructure fails.

**Key findings:**

- Static guidance is insufficient during evolving fire conditions.
- Dynamic routing can identify safer alternatives when initial paths become blocked or dangerous.
- Mobile and decentralized systems can support real-time evacuation guidance.
- Crowd congestion and environmental hazards should be part of route computation.

**Relevance to CBCD:**

This paper supports the practical system direction of CBCD: dynamic routing, multiple exits, blocked routes, congestion, and user-facing route guidance.

**How to use in Stage 1 paper:**

Use it in sections discussing **adaptive evacuation guidance**, **real-time route recalculation**, and **decision-support interfaces**.

---

### 4. Multimodal Image-Based Indoor Localization with Machine Learning — A Systematic Review

**File:** `multimodal_image_based_indoor_localization_ml_review.pdf`

**Main focus:**  
This systematic review studies multimodal indoor positioning methods using machine learning, especially combinations involving camera imagery, motion sensors, radio signals, and LiDAR.

**Method / approach:**

- Reviews around 40 relevant studies.
- Classifies multimodal indoor positioning approaches.
- Discusses image-based indoor localization and data fusion.

**Key findings:**

- Indoor localization is more difficult than outdoor positioning because GPS/GNSS is unreliable indoors.
- No single indoor positioning solution is universally dominant.
- Combining multiple data sources can improve indoor positioning accuracy.
- Camera imagery can contribute to indoor localization when fused with other modalities.

**Relevance to CBCD:**

CBCD currently focuses on route planning and camera-based crowd information, but indoor localization is an important future component. This paper helps explain why the conceptual framework should include user/location input and possible localization modules.

**How to use in Stage 1 paper:**

Use it in the literature review to discuss **indoor localization challenges** and justify why CBCD can start with a conceptual/prototype environment while leaving real localization as future work.

---

### 5. Dynamic Risk Perception-Based Evacuation Path Optimization Framework in Metro Fire Scenarios

**File:** `dynamic_risk_perception_metro_fire.pdf`

**Main focus:**  
This paper proposes DSCA-Evac, a dynamic risk-aware evacuation path optimization framework for metro station fires.

**Important note:**  
The PDF indicates that it is a **preprint and has not been peer reviewed**. It can be useful for conceptual and technical inspiration, but should be cited carefully if used in the final article.

**Method / approach:**

- Integrates smoke distribution data from Fire Dynamics Simulator (FDS).
- Builds a Unity-based dynamic simulation environment.
- Develops DSCA-Star, an improved A*-style path planning algorithm.
- Incorporates smoke concentration thresholds into the path cost function.
- Uses dynamic replanning when risk conditions change.

**Key findings:**

- The framework shifts route planning from “geometrically optimal path” to “risk-optimal path.”
- DSCA-Star reduces risk exposure compared with traditional A*.
- It maintains better safety-efficiency balance than NavMesh and Ant Colony Optimization in tested scenarios.
- Future work includes more personalized thresholds, richer crowd dynamics, and real-time streaming data.

**Relevance to CBCD:**

This is one of the closest papers to CBCD’s risk-aware routing idea. It supports the use of a cost function that combines hazard/risk factors with path planning.

**How to use in Stage 1 paper:**

Use cautiously as a recent example of dynamic risk-aware evacuation framework. It supports CBCD’s conceptual direction, especially the need for feedback-based replanning and risk-aware path cost.

---

### 6. Crowd Detection: Leveraging YOLO for Human Recognition

**File:** `crowd_detection_yolo_human_recognition.pdf`

**Main focus:**  
This paper compares YOLO models for human detection in crowded environments.

**Method / approach:**

- Combines four public human detection datasets.
- Evaluates YOLOv5, YOLOv8, and YOLOv11 models.
- Uses mAP@50 and mAP@50-95 as evaluation metrics.

**Key findings:**

- YOLOv8m achieves the highest reported mAP@50 and mAP@50-95 among the tested models.
- YOLOv8 variants perform strongly compared with YOLOv5 and YOLOv11 variants.
- YOLO-based methods are effective for human detection in dense environments.

**Relevance to CBCD:**

This paper supports the crowd detection side of CBCD. It provides evidence that YOLO can be used for camera-based human detection and crowd monitoring.

**How to use in Stage 1 paper:**

Use it in the crowd detection literature review to justify YOLO as a feasible computer vision method for identifying people in crowded spaces.

---

### 7. Dense-stream YOLOv8n: A Lightweight Framework for Real-Time Crowd Monitoring in Smart Libraries

**File:** `dense_stream_yolov8n_smart_libraries.pdf`

**Main focus:**  
This paper proposes Dense-Stream YOLOv8n, a lightweight pedestrian flow detection method for real-time crowd monitoring in smart libraries.

**Method / approach:**

- Improves YOLOv8n with a lightweight convolutional enhancement module called DensityNet.
- Applies pruning and knowledge distillation.
- Targets high-density and side-view dynamic environments.
- Evaluates accuracy, FPS, GFLOPs, and parameter count.

**Key findings:**

- Dense-Stream YOLOv8n achieves high detection accuracy in dense scenes.
- It improves real-time performance, reaching very high FPS compared with baseline YOLOv8n.
- Computational load and parameter count are reduced, making it suitable for edge devices.
- The model performs well under occlusion and varying crowd density.

**Relevance to CBCD:**

This paper supports the possibility of real-time camera-based crowd monitoring in indoor public environments. It also supports future edge-device deployment for CBCD.

**How to use in Stage 1 paper:**

Use it to justify that lightweight real-time crowd detection can feed crowd density information into the route-planning layer.

---

### 8. A Survey of Deep Learning Methods for Density Estimation and Crowd Counting

**File:** `survey_deep_learning_density_estimation_crowd_counting.pdf`

**Main focus:**  
This survey reviews more than 300 works on crowd counting and density estimation, especially CNN-based density map methods.

**Method / approach:**

- Reviews deep learning methods for object and crowd counting.
- Discusses CNN-based density map estimation.
- Classifies crowd counting models by architecture, learning paradigm, inference method, supervision form, and generalization ability.

**Key findings:**

- Crowd counting is important for public safety and crowd management.
- CNN-based approaches dominate recent crowd counting research.
- Density estimation is useful when individual detection becomes difficult due to occlusion and high crowd density.
- Crowd counting remains challenging under scale variation, perspective changes, occlusion, and domain shift.

**Relevance to CBCD:**

This paper supports CBCD’s crowd scoring concept. If object detection is insufficient in dense environments, density estimation can be considered as an alternative or complementary crowd perception method.

**How to use in Stage 1 paper:**

Use it to show that crowd information can be obtained not only by detecting people but also by estimating density maps, which can then inform risk-aware navigation.

---

### 9. Agent-Based Simulation for Pedestrian Evacuation: A Systematic Literature Review

**File:** `agent_based_simulation_pedestrian_evacuation_slr.pdf`

**Main focus:**  
This systematic literature review examines agent-based modelling (ABM) for pedestrian evacuation behaviour.

**Method / approach:**

- Uses a systematic literature review process.
- Focuses on ABM-based evacuation modelling.
- Reviews behavioural factors, decision-making models, simulation tools, validation techniques, and common challenges.

**Key findings:**

- ABM is useful for representing heterogeneous evacuees and emergent crowd behaviour.
- Important factors include demographic, physiological, psychological, and social characteristics.
- Many evacuation models still rely on simplified rule-based decision-making.
- Common challenges include modeller bias, computational complexity, limited empirical data, and difficulty in validation/calibration.
- More standardized behavioural frameworks and validation approaches are needed.

**Relevance to CBCD:**

This paper supports the future simulation and validation direction of CBCD. It also helps explain why Stage 1 should first define a conceptual framework before full simulation or deployment.

**How to use in Stage 1 paper:**

Use it in the literature review or validation-plan section to discuss future evaluation through simulation and the limitations of evacuation modelling.

---

### 10. Design Science in Information Systems Research

**File:** `design_science_information_systems_research_hevner.pdf`

**Main focus:**  
This foundational paper explains design science research in Information Systems. It distinguishes behavioural science, which seeks to explain or predict, from design science, which seeks to create effective artifacts.

**Method / approach:**

- Presents design science as a research paradigm.
- Describes IS research as operating at the intersection of people, organizations, and technology.
- Emphasizes artifact creation and evaluation.
- Discusses relevance, rigor, and contribution to the knowledge base.

**Key findings / principles:**

- Design science aims to create “what is effective.”
- Research artifacts may include constructs, models, methods, and instantiations.
- Effective design science requires both building and evaluating artifacts.
- Research must address a relevant problem and contribute to knowledge.

**Relevance to CBCD:**

CBCD fits well with design science because it aims to create a framework/prototype artifact that solves a practical decision-support problem in indoor navigation.

**How to use in Stage 1 paper:**

Use it to justify the research methodology and explain why a conceptual framework is a valid design science artifact.

---

### 11. A Design Science Research Methodology for Information Systems Research

**File:** `design_science_research_methodology_peffers.pdf`

**Main focus:**  
This paper presents the Design Science Research Methodology (DSRM), a process model for conducting design science research.

**Method / approach:**

The DSRM process includes six activities:

1. Problem identification and motivation
2. Define objectives for a solution
3. Design and development
4. Demonstration
5. Evaluation
6. Communication

**Key findings:**

- DSRM provides a structured process for conducting and presenting design science research.
- The process can be followed sequentially or entered from different starting points depending on the research context.
- It helps researchers communicate artifact-based research clearly.

**Relevance to CBCD:**

This is highly suitable for structuring the CBCD research journey:

- Stage 1: problem identification, objective definition, conceptual framework
- Phase 1 prototype: design and development
- Experiments/simulation: demonstration and evaluation
- Paper/thesis: communication

**How to use in Stage 1 paper:**

Use DSRM as the methodological foundation for developing the conceptual framework.

---

### 12. The PRISMA 2020 Statement

**File:** `prisma_2020_statement.pdf`

**Main focus:**  
PRISMA 2020 provides updated reporting guidance for systematic reviews.

**Method / approach:**

- Provides a checklist and flow diagram guidance.
- Emphasizes transparent, complete, and accurate reporting of review methods and findings.
- Covers title, abstract, introduction, methods, results, discussion, and other information.

**Key findings / principles:**

- Systematic reviews should clearly explain why the review was conducted, how studies were identified and selected, and what was found.
- Transparent reporting improves evidence-based decision making.
- The discussion should interpret results, explain limitations, and discuss implications for practice, policy, and future research.

**Relevance to CBCD:**

If the Stage 1 paper includes a literature review or systematic mapping component, PRISMA can guide transparent reporting. Even if the paper is not a full systematic review, PRISMA helps improve literature review rigor.

**How to use in Stage 1 paper:**

Use it to describe the literature search and selection process if the paper includes a structured review section.

---

## Literature Gap for the CBCD Stage 1 Paper

Based on these papers, the Stage 1 conceptual paper can argue the following gap:

> Existing research has made important progress in indoor fire evacuation routing, dynamic risk-aware path planning, crowd detection, crowd counting, indoor localization, and evacuation simulation. However, these areas are often studied separately. Indoor route-planning studies commonly focus on shortest path, semantic constraints, smoke risk, or simulation performance. Crowd detection studies focus mainly on identifying or counting people from camera images, but they do not usually connect the detected crowd condition to route cost and navigation decision support. Therefore, there is a need for a conceptual framework that integrates spatial environment modelling, risk representation, camera-based crowd perception, route planning, decision-support visualization, and feedback-based replanning for confined indoor environments.

---

## Suggested Use in the First Paper

### Introduction

Use the literature to establish that:

- Indoor evacuation is safety-critical in confined environments.
- Shortest-path routing alone is not sufficient.
- Dynamic hazards and crowd congestion affect evacuation safety.
- Camera-based crowd detection can provide useful real-time crowd information.
- There is a need to integrate crowd perception with risk-aware route planning.

### Literature Review Sections

Recommended subsections:

1. Indoor fire evacuation routing and risk-aware navigation
2. Dynamic path planning under smoke, blockage, and crowd congestion
3. Camera-based crowd detection and crowd density estimation
4. Indoor localization and user guidance systems
5. Design science and conceptual framework development

### Proposed Framework Support

The reviewed papers support the following CBCD framework layers:

| CBCD framework layer | Supporting literature |
|---|---|
| Spatial environment layer | 3D indoor fire evacuation routing; indoor localization review |
| Risk representation layer | 3D fire routing; dynamic risk perception metro fire; algorithmic evaluation under smoke/crowd |
| Crowd perception layer | YOLO human detection; Dense-Stream YOLOv8n; crowd counting survey |
| Route planning layer | Dijkstra/A* comparison; modified Dijkstra mobile evacuation; DSCA-Star; A*-based fire routing |
| Decision-support and visualization layer | mobile evacuation guidance; dynamic evacuation simulation papers |
| Feedback and replanning layer | dynamic risk perception framework; mobile evacuation system; algorithmic evaluation under dynamic conditions |
| Research methodology layer | Hevner design science; Peffers DSRM; PRISMA 2020 |

---

## Strongest Papers to Cite for CBCD

For the first Stage 1 paper, the most important papers are:

1. **Three-Dimensional Indoor Fire Evacuation Routing** — strongest support for semantic/risk-aware indoor evacuation routing.
2. **Algorithmic Evaluation of Fire Evacuation Efficiency Under Dynamic Crowd and Smoke Conditions** — strongest support for algorithm comparison and dynamic smoke/crowd impact.
3. **Assistive Mobile Application for Fire Emergency Evacuation of Visually Impaired People** — strongest support for practical dynamic routing and user guidance.
4. **Dynamic Risk Perception-Based Evacuation Path Optimization Framework in Metro Fire Scenarios** — closest conceptual similarity, but cite carefully because it is a preprint.
5. **Dense-Stream YOLOv8n** and **Crowd Detection: Leveraging YOLO** — support camera-based crowd monitoring.
6. **Hevner** and **Peffers** — support design science methodology.
7. **PRISMA 2020** — supports structured literature review reporting.

---

## Caution Notes

- `dynamic_risk_perception_metro_fire.pdf` is marked as a non-peer-reviewed preprint. It can inspire the framework, but should not be treated as the strongest evidence.
- Some downloaded papers are dated 2026. Before final submission, verify whether the target journal accepts online-first/future-dated articles and confirm bibliographic details.
- Crowd detection papers provide technical feasibility, but the Stage 1 paper should avoid claiming that CBCD has already implemented real camera detection unless it is clearly described as future Phase 2 work.
- For Stage 1, position CBCD as a **conceptual framework** and not yet a fully deployed emergency evacuation system.

---

## Suggested Research Gap Paragraph Draft

Existing indoor evacuation studies have demonstrated the importance of incorporating fire semantics, smoke propagation, structural accessibility, and congestion into route planning. At the same time, recent computer vision studies show that YOLO-based detection and deep learning crowd-counting methods can estimate crowd conditions in real time. However, these two research directions are commonly investigated separately. Route-planning studies often assume that risk and crowd information are already available, while crowd detection studies usually stop at monitoring and do not translate crowd density into navigation decisions. Therefore, this paper proposes a conceptual framework that integrates camera-based crowd perception with risk-aware indoor navigation to support safer and more explainable route recommendation in confined environments.

---

## Suggested Conceptual Contribution Statement

The main contribution of this paper is a conceptual framework for camera-assisted risk-aware indoor navigation in confined environments. The framework integrates six components: spatial environment modelling, risk representation, camera-based crowd perception, route planning, decision-support visualization, and feedback-based replanning. By linking crowd detection outputs with route cost calculation and route recommendation, the framework provides a foundation for future prototype development and simulation-based evaluation.
