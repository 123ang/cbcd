# Article Q&A Fast Context

Use this note when answering literature/proposal questions about crowd density, people counting, evacuation sensing, and the dynamic crowd/smoke evacuation paper.

## Quick Answers

### How many people is considered a crowd?

Do not define crowd by total people alone. Define it by local density and route context.

Recommended working thresholds for CBCD:

- Low / noticeable crowd: about 0.5-1.5 persons per m2.
- Medium / movement affected: about 1.5-3 persons per m2.
- High / congested: about 3-4 persons per m2.
- Dangerous / critical: above 4-5 persons per m2.

Literature support:

- Crowd safety literature often warns that densities above 3-4 persons/m2 should be avoided.
- Around 5 persons/m2 is commonly treated as a critical density where accident risk becomes high.
- For the prototype, map these to `crowd` cell intensity 1-3 rather than claiming one universal threshold.

Suggested thesis wording:

> In this study, crowd condition is operationalized as local pedestrian density rather than absolute headcount, because the safety impact of 20 people depends on whether they occupy a large hall or a narrow corridor.

Citation support:

- Use Yin et al. (2019) to support the safety threshold: dense crowds above 3-4 persons/m2 should be avoided, and 5 persons/m2 is commonly treated as critical/dangerous.
- Suggested in-text citation: `(Yin et al., 2019)`.

### How is crowd density calculated?

Basic formula:

`crowd_density = number_of_people_in_zone / zone_area_m2`

For CBCD grid cells:

`cell_density = detected_people_assigned_to_cell / real_world_cell_area_m2`

Then map density into route-planning intensity:

- intensity 1: low crowd
- intensity 2: medium crowd
- intensity 3: high crowd

Camera workflow:

1. Define zones or grid cells on the floor plan.
2. Calibrate camera perspective if real-world area is needed.
3. Detect people, heads, or estimate a density map.
4. Assign detections/density mass to zones.
5. Smooth over a short time window to reduce noisy frame-to-frame changes.
6. Convert zone density to `crowd` intensity for route cost.

Citation support:

- Use Gao et al. (2025) to support the broader crowd-counting and density-estimation literature.
- Use Yiğit (2025) and Chen et al. (2025) to support YOLO-based human detection and real-time indoor crowd monitoring.
- Suggested in-text citation: `(Gao et al., 2025; Yiğit, 2025; Chen et al., 2025)`.

### What is the best way to calculate people?

There is no single best method for every crowd condition.

- Low/moderate density: object detection such as YOLO is practical because individuals are visible.
- High density or heavy occlusion: density-map crowd counting is usually better because individual bodies overlap.
- Best research-grade approach: hybrid detection + density estimation + tracking/temporal smoothing.
- Best for the current CBCD prototype: YOLO count per region first, then optionally add density-estimation later if dense crowd accuracy becomes a research focus.

Important limitation:

YOLO gives boxes and counts, but crowd evacuation needs zone-level density. Therefore the useful output is not only "people detected"; it is "people per zone/cell per square meter."

Citation support:

- Use Yiğit (2025) for YOLO human-recognition feasibility.
- Use Chen et al. (2025) for lightweight YOLOv8n-style real-time crowd monitoring in dense indoor environments.
- Use Gao et al. (2025) for the argument that density-map crowd counting becomes important when individual detection is difficult.
- Suggested in-text citation: `(Yiğit, 2025; Chen et al., 2025; Gao et al., 2025)`.

### What input data is best for evacuation?

GPS is not a good primary input indoors. It is weak/unavailable in complex indoor spaces.

Best practical evacuation data stack:

- Floor plan / BIM / IndoorGML: static geometry, walls, exits, stairs.
- Camera or CCTV: people count, flow, crowd distribution.
- Smoke/temperature/fire sensors: hazard severity and spread.
- Indoor positioning: UWB, BLE, Wi-Fi RTT, IMU, or phone inertial sensors for user location.
- Thermal imaging / mmWave radar / inertial tracking: stronger for smoke-filled or dark emergency environments.
- LiDAR: useful for mapping geometry and depth, but not a replacement for crowd and smoke sensing.

Recommended for CBCD:

- Phase 1: floor plan + manual risk/crowd grid.
- Phase 2: camera/YOLO crowd estimation.
- Future work: add indoor positioning or IoT fire/smoke sensors.

Camera + LiDAR is stronger than camera + GPS for indoor spatial understanding, but camera + indoor positioning + smoke sensors is more directly useful for evacuation guidance.

Citation support:

- Use Łukasik et al. (2024) for multimodal indoor localization and the weakness of single-source indoor positioning.
- Use NIST (2019) for emergency responder tracking in difficult indoor/fire-like conditions and the need for robust non-GPS modalities.
- Use Kim et al. (2026) for combining CCTV/person count, indoor positioning, smoke concentration, temperature, and visibility into centralized evacuation control.
- Use Mocanu et al. (2026) for mobile evacuation guidance with indoor positioning, dynamic fire/smoke/crowd data, and modified Dijkstra routing.
- Suggested in-text citation: `(Łukasik et al., 2024; NIST, 2019; Kim et al., 2026; Mocanu et al., 2026)`.

### What is "Algorithmic Evaluation of Fire Evacuation Efficiency Under Dynamic Crowd and Smoke Conditions" about?

This paper evaluates Dijkstra and A* in a six-level underground station evacuation simulation.

Setup:

- Four models: static structural damage; dynamic smoke; structural damage + crowd congestion; smoke + crowd congestion.
- Eight disaster locations.
- Two algorithms: Dijkstra and A*.
- Total: 64 simulations.
- Main metrics: maximum evacuation time and algorithm computation time.

Main findings:

- Under static structural damage only, Dijkstra and A* produced identical maximum evacuation times.
- A* was much faster computationally: average 26.62 s vs Dijkstra 337.88 s, about 12.7 times faster.
- Under dynamic smoke and crowd congestion, there was no consistent winner. Dijkstra was better in some cases, A* in others.
- The important conclusion is not "A* is always better" or "Dijkstra is always safer"; the conclusion is that reactive route recalculation based only on current conditions is not enough.
- Future evacuation systems need predictive hazard propagation and centralized crowd distribution across multiple routes.

How CBCD should use this:

- Use Dijkstra/A* as baselines.
- Use Weighted A* or a risk-cost model for explainable route recommendation.
- Evaluate distance, time, risk exposure, crowd exposure, and risk reduction vs Dijkstra.
- Do not claim that one algorithm is universally best under dynamic emergency conditions.

Citation support:

- Use Kim et al. (2026) as the direct source for Dijkstra/A* comparison under structural damage, smoke, and crowd congestion.
- Use Zhou et al. (2020) to support the wider claim that indoor fire routing should include fire/environmental semantics, not only geometry.
- Use Mocanu et al. (2026) to support practical dynamic route computation using modified Dijkstra and sensor-informed edge weights.
- Suggested in-text citation: `(Zhou et al., 2020; Kim et al., 2026; Mocanu et al., 2026)`.

## Citation-Ready Literature Support By Framework Component

| Framework component | Claim to support | Main citations |
|---|---|---|
| Problem/methodology | A conceptual framework and prototype can be valid design science artifacts. | Hevner et al. (2004); Peffers et al. (2007) |
| Structured literature review | If the article reports a structured review/search process, use transparent reporting. | Page et al. (2021) |
| Spatial environment / floor plan | Indoor routing needs spatial semantics, exits, accessibility, and fire-related route constraints. | Zhou et al. (2020) |
| Dynamic hazard/risk | Smoke, structural damage, and crowd congestion change evacuation performance and route choice. | Kim et al. (2026); Zhou et al. (2020) |
| Crowd density threshold | Crowd safety should be based on density, with high-risk thresholds around 3-5 persons/m2. | Yin et al. (2019) |
| Crowd detection/counting | YOLO can detect people; density-estimation methods are important for occlusion and high-density scenes. | Yiğit (2025); Chen et al. (2025); Gao et al. (2025) |
| Indoor positioning/sensing | GPS is weak indoors; multimodal data fusion is preferred for localization. | Łukasik et al. (2024); NIST (2019) |
| Dynamic evacuation guidance | Evacuation routing can use dynamic edge weights from fire, smoke, crowd congestion, and user location. | Mocanu et al. (2026); Kim et al. (2026) |
| Article research gap | Crowd detection and evacuation routing are often separated; CBCD links perception to route-cost recommendation. | Gao et al. (2025); Kim et al. (2026); Zhou et al. (2020) |

## Useful Article Questions to Ask and Answer

1. Why is shortest-path routing insufficient for confined-space evacuation?
   Answer: Because risk, smoke, blocked routes, crowd congestion, and exit accessibility can make the shortest path unsafe.

2. How can crowd detection be connected to route planning?
   Answer: Convert people counts into zone/cell density, then convert density into crowd-risk cost used by the route algorithm.

3. Which algorithm should be the baseline?
   Answer: Dijkstra is the safest baseline for optimal shortest path; A* is the faster shortest-path baseline; Weighted A* is the explainable risk-aware method.

4. Does dynamic data automatically improve evacuation?
   Answer: Not always. The dynamic crowd/smoke paper shows current-state routing can be inconsistent unless paired with prediction and crowd distribution.

5. What sensors are most defensible for the conceptual framework?
   Answer: Floor plan + camera/CCTV + smoke/fire sensors + indoor positioning. GPS should be treated as weak indoors.

6. Is YOLO enough for crowd density?
   Answer: YOLO is enough for a first implementation in low/moderate density, but dense occlusion may require density-map crowd counting or hybrid methods.

7. What is the research gap?
   Answer: Crowd detection papers often stop at counting, while evacuation routing papers often assume crowd/risk inputs already exist. CBCD links crowd perception to risk-aware route recommendation.

8. What evaluation metrics should the article use?
   Answer: Distance, risk exposure, crowd exposure, total route cost, computation time, success rate, risk reduction vs Dijkstra, and explanation quality.

9. What should be avoided in the article?
   Answer: Do not claim fully real-time evacuation deployment, exact fire simulation, GPS-ready indoor tracking, or universal best algorithm before those modules are validated.

## Reference List Starter

Use APA style unless the target journal requires another format.

- Chen, Z., Xie, X., Qiu, T., & Yao, L. (2025). Dense-stream YOLOv8n: A lightweight framework for real-time crowd monitoring in smart libraries. *Scientific Reports, 15*, Article 11618. https://doi.org/10.1038/s41598-025-94659-x
- Gao, G., Gao, J., Liu, Q., Wang, Q., et al. (2025). A survey of deep learning methods for density estimation and crowd counting. *Vicinagearth, 2*, Article 2. https://doi.org/10.1007/s44336-024-00011-8
- Haghani, M., & Ronchi, E. (2024). Revisiting the paper "Simulating dynamical features of escape panic": What have we learnt since then? *Collective Dynamics, 9*, 1-11. https://doi.org/10.17815/CD.2024.168
- Helbing, D., Farkas, I., & Vicsek, T. (2000). Simulating dynamical features of escape panic. *Nature, 407*, 487-490. https://doi.org/10.1038/35035023
- Helbing, D., & Johansson, A. (2013). Pedestrian, crowd, and evacuation dynamics. arXiv:1309.1609. https://arxiv.org/abs/1309.1609
- Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75-105.
- Kim, H., Haam, S., Yoo, M., & Song, W. S. (2026). Algorithmic evaluation of fire evacuation efficiency under dynamic crowd and smoke conditions. *Fire, 9*(1), Article 32. https://doi.org/10.3390/fire9010032
- Lopez-Carmona, M. A., & Paricio Garcia, A. (2021). CellEVAC: An adaptive guidance system for crowd evacuation through behavioral optimization. *Safety Science, 139*, Article 105215. https://doi.org/10.1016/j.ssci.2021.105215
- Łukasik, S., Szott, S., & Leszczuk, M. (2024). Multimodal image-based indoor localization with machine learning: A systematic review. *Sensors, 24*(18), Article 6051. https://doi.org/10.3390/s24186051
- Mocanu, A., Avram, C., Radu, D., Sita, I. V., & Astilean, A. (2026). Assistive mobile application for fire emergency evacuation of visually impaired people. *Sensors, 26*(5), Article 1572. https://doi.org/10.3390/s26051572
- National Institute of Standards and Technology. (2019). *Pervasive, accurate, and reliable LBS for emergency responders*. https://www.nist.gov/ctl/pscr/pervasive-accurate-and-reliable-lbs-emergency-responders
- Page, M. J., McKenzie, J. E., Bossuyt, P. M., Boutron, I., Hoffmann, T. C., Mulrow, C. D., et al. (2021). The PRISMA 2020 statement: An updated guideline for reporting systematic reviews. *BMJ, 372*, n71. https://doi.org/10.1136/bmj.n71
- Peffers, K., Tuunanen, T., Rothenberger, M. A., & Chatterjee, S. (2007). A design science research methodology for information systems research. *Journal of Management Information Systems, 24*(3), 45-77. https://doi.org/10.2753/MIS0742-1222240302
- Yin, J., Zheng, X.-M., & Tsaur, R.-C. (2019). Occurrence mechanism and coping paths of accidents of highly aggregated tourist crowds based on system dynamics. *PLOS ONE, 14*(9), e0222389. https://doi.org/10.1371/journal.pone.0222389
- Yiğit, G. (2025). Crowd detection: Leveraging YOLO for human recognition. *Turkish Journal of Engineering, 9*(3), 571-577. https://doi.org/10.31127/tuje.1627839
- Zhou, Y., Pang, Y., Chen, F., & Zhang, Y. (2020). Three-dimensional indoor fire evacuation routing. *ISPRS International Journal of Geo-Information, 9*(10), Article 558. https://doi.org/10.3390/ijgi9100558

## Should More Articles Be Downloaded?

The current folder is enough to write a first conceptual framework article, especially if the paper is positioned as framework/design-science work rather than a full systematic review.

Download more only in targeted gaps. Added local notes are in `article/download_notes.md`.

1. One classic crowd dynamics / escape-panic paper.
   - Helbing, D., Farkas, I., & Vicsek, T. (2000). Simulating dynamical features of escape panic. *Nature, 407*, 487-490. https://doi.org/10.1038/35035023
   - Why: gives a classic foundation for pedestrian jamming, panic, and crowd-flow behavior.
   - Local file: `article/helbing_2000_escape_panic_arxiv.pdf`.

2. One crowd perception / social density paper.
   - Alnabulsi, H., & Drury, J. (2014). Social identification moderates the effect of crowd density on safety at the Hajj. *PNAS, 111*(25), 9091-9096. https://doi.org/10.1073/pnas.1404953111
   - Why: useful if discussing why density alone is not the whole human-safety story.
   - Note: PDF download was blocked by publisher/PMC access gate in this environment; keep citation, download manually if needed.

3. One recent congestion-aware fire evacuation framework.
   - INFED: Enhancing fire evacuation dynamics through 3D congestion-aware indoor navigation framework. *Simulation Modelling Practice and Theory, 136*, 103010. https://doi.org/10.1016/j.simpat.2024.103010
   - Why: very close to CBCD because it combines fire constraints, congestion, and indoor navigation.
   - Note: PDF is publisher-gated here; use abstract-level claims unless full text is obtained.

4. One optimization-model review for evacuation.
   - A review of optimisation models for pedestrian evacuation and design problems. *Safety Science*. https://doi.org/10.1016/j.ssci.2016.04.001
   - Why: strengthens the algorithm/evaluation background.
   - Note: PDF is publisher-gated here; use abstract-level claims unless full text is obtained.

5. One density-threshold / crowd accident paper.
   - Yin, J., Zheng, X.-M., & Tsaur, R.-C. (2019). Occurrence mechanism and coping paths of accidents of highly aggregated tourist crowds based on system dynamics. *PLOS ONE, 14*(9), e0222389. https://doi.org/10.1371/journal.pone.0222389
   - Why: supports density-based crowd-risk scoring and threshold discussion.
   - Local file: `article/yin_2019_highly_aggregated_tourist_crowd_accidents_plosone.pdf`.

6. One adaptive evacuation guidance paper.
   - Lopez-Carmona et al. (2021). CellEVAC: An adaptive guidance system for crowd evacuation through behavioral optimization. *Safety Science, 139*, 105215.
   - Why: supports adaptive guidance and crowd-aware route management.
   - Local file: `article/lopez_carmona_2021_cellevac_adaptive_crowd_evacuation.pdf`.

Do not download too many before writing. Add 3-5 targeted articles, then start drafting the framework paper.

## Suggested First Article Titles

Best title:

> A Conceptual Framework for Camera-Assisted Risk-Aware Indoor Navigation in Confined Environments

Stronger if emphasizing evacuation:

> A Conceptual Framework for Camera-Assisted Risk-Aware Evacuation Route Recommendation in Confined Indoor Environments

More technical:

> Integrating Crowd Perception and Risk-Aware Path Planning for Indoor Evacuation: A Conceptual Framework

More design-science style:

> Designing a Crowd-Aware Risk-Based Indoor Navigation Framework for Emergency Evacuation Decision Support

Recommended final choice for the first framework paper:

> A Conceptual Framework for Camera-Assisted Risk-Aware Evacuation Route Recommendation in Confined Indoor Environments

Reason: it clearly states the artifact, input source, risk-aware routing purpose, and target environment without overclaiming implementation results.
