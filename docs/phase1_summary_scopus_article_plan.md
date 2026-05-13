# Phase 1 Summary and Scopus Article Writing Plan

Project title:

**A Two-Phase Risk-Aware Indoor Navigation and Camera-Based Crowd Detection Decision-Support System for Confined Environments**

This document summarizes the completed Phase 1 work and suggests how to convert it into a Scopus-style research article.

---

## 1. Phase 1 Summary

Phase 1 developed a simulation-based risk-aware indoor navigation prototype for confined environments. The main purpose is to show that the shortest path is not always the safest path when indoor risks such as obstacles, blocked routes, risk zones, crowd density, and exit accessibility are considered.

The Phase 1 system consists of:

- A **React/Vite dashboard** for map editing, algorithm execution, route visualization, and result comparison.
- A **FastAPI backend** that runs pathfinding and learning-based route recommendation algorithms.
- A **2D grid-based indoor environment** where users can configure walls, blocked cells, risk zones, crowd zones, start points, and exits.
- A **weighted route-cost model** that combines distance, crowd density, hazard/risk exposure, blockage penalty, and exit accessibility.
- A comparison framework for **Dijkstra, A\*, Weighted A\*, and Q-learning**.
- Built-in scenarios S1–S6 and an experiment harness that exports algorithm results to CSV.

---

## 2. Phase 1 Research Contribution

The main contribution of Phase 1 is not only a navigation dashboard, but a decision-support artifact that compares distance-based routing against risk-aware routing.

The contribution can be written as:

> This study proposes and evaluates a simulation-based risk-aware indoor navigation model that integrates distance, crowd exposure, hazard/risk exposure, blockage constraints, and exit accessibility into a weighted route-cost model. The prototype compares classical shortest-path algorithms with risk-aware and learning-based methods to support safer and more explainable route recommendations in confined environments.

Possible contribution points:

1. A configurable 2D indoor navigation simulation environment for confined-space route planning.
2. A weighted risk-aware cost model using five spatial/environmental factors.
3. A comparative dashboard for Dijkstra, A\*, Weighted A\*, and Q-learning.
4. Scenario-based evaluation using six indoor risk/crowd/blocked-route scenarios.
5. Explainable route recommendation through distance, risk score, crowd score, total cost, computation time, and nodes expanded.

---

## 3. Implemented Risk Factors

The Phase 1 model uses five key factors:

| Factor | Meaning | Prototype measurement |
|---|---|---|
| Distance | Travel effort from start to exit | Number of grid steps |
| Obstacles / blockage | Non-traversable or unavailable areas | Wall and blocked cells |
| Risk zones | Hazardous areas that should be avoided | Sum of risk cell intensity |
| Crowd density | Congested areas that increase delay or safety risk | Sum of crowd cell intensity |
| Exit accessibility | Preference for routes with better exit access | Distance/access cost to nearest exit |

Cost model:

```text
cell_cost = α·distance + β·crowd + γ·risk + δ·blockage

exit_access_score is reported separately as a path-level explainability metric.
```

Default weights:

```text
α = 1, β = 3, γ = 5, δ = 10, ε = 2 (reported exit-access weighting), Weighted A* heuristic weight = 1
```

---

## 4. Algorithms Compared

| Algorithm | Role in study | Expected behavior |
|---|---|---|
| Dijkstra | Shortest-path baseline | Finds low-distance path but may pass through risk/crowd zones |
| A\* | Heuristic shortest-path baseline | Usually faster than Dijkstra in open grid maps |
| Weighted A\* | Proposed risk-aware route method | May choose longer but safer routes by avoiding risk/crowd cells |
| Q-learning | Learning-based comparison method | Learns route policy through reward/penalty structure |

The article should present Dijkstra and A\* as baseline methods, Weighted A\* as the explicit proposed risk-aware method, and Q-learning as an intelligent comparison method.

---

## 5. Current Experimental Evidence

The existing experiment log contains:

- **72 result rows**
- **6 scenarios**: S1–S6
- **4 algorithms**: Dijkstra, A\*, Weighted A\*, Q-learning
- **3 weight presets**: Default, Safety-heavy, Distance-heavy

Observed winner count by lowest total cost:

| Algorithm | Number of winning cases |
|---|---:|
| Weighted A\* | 11 |
| Dijkstra | 7 |
| A\* | 0 |
| Q-learning | 0 |

Average computation time from current experiment log:

| Algorithm | Average time |
|---|---:|
| A\* | ~0.130 ms |
| Dijkstra | ~0.749 ms |
| Weighted A\* | ~0.677 ms |
| Q-learning | ~155.858 ms |

Interpretation:

- **A\*** is usually the fastest baseline.
- **Weighted A\*** most often gives the lowest total route cost under risk-aware settings.
- **Dijkstra** performs well in normal or distance-heavy layouts where risk/crowd exposure is low.
- **Q-learning** is much slower in this prototype because it requires training/exploration, but it is useful as a learning-based comparison method.

Important writing angle:

> The results suggest that risk-aware routing can reduce modeled risk/crowd exposure compared with pure shortest-path methods, while maintaining acceptable computation time for simulation-based decision support.

---

## 6. Suggested Scopus Article Angle

Recommended article focus:

**Risk-Aware Indoor Navigation Decision Support Using Weighted Pathfinding and Reinforcement Learning Comparison in Simulated Confined Environments**

This is stronger than writing only about “a navigation app” because Scopus articles need a clear research gap, method, evaluation, and contribution.

The article should focus on:

- Why shortest-path routing is not enough in confined indoor environments.
- How risk, crowd density, blockage, and exit accessibility can be modeled as route costs.
- How different algorithms behave under the same risk-aware scenarios.
- Whether the proposed risk-aware model can recommend safer routes while remaining explainable.

---

## 7. Possible Article Titles

Option 1:

**A Risk-Aware Indoor Navigation Decision-Support Model for Confined Environments Using Weighted Pathfinding and Reinforcement Learning Comparison**

Option 2:

**Simulation-Based Evaluation of Risk-Aware Route Recommendation Algorithms for Indoor Navigation in Confined Environments**

Option 3:

**Beyond Shortest Path: A Risk-Aware Indoor Navigation Prototype Integrating Crowd, Hazard, and Exit Accessibility Factors**

Option 4:

**Comparative Analysis of Dijkstra, A\*, Weighted A\*, and Q-Learning for Risk-Aware Indoor Route Recommendation**

Recommended title:

**Beyond Shortest Path: A Risk-Aware Indoor Navigation Decision-Support Model for Confined Environments**

Reason: it is clear, research-oriented, and highlights the main contribution.

---

## 8. Suggested Abstract Draft

Indoor navigation systems commonly recommend routes based on distance or travel efficiency. However, in confined environments such as campuses, event halls, hospitals, malls, and transport terminals, the shortest path may not be the safest path because it may pass through crowded areas, hazardous zones, or blocked corridors. This study proposes a simulation-based risk-aware indoor navigation decision-support model that integrates distance, crowd density, hazard/risk exposure, blockage constraints, and exit accessibility into a weighted route-cost formulation. A React-based dashboard and FastAPI backend were developed to model indoor layouts, configure risk and crowd zones, and compare four route recommendation methods: Dijkstra, A\*, Weighted A\*, and Q-learning. Six simulated scenarios were used to evaluate route distance, risk exposure, crowd exposure, total route cost, computation time, nodes expanded, and route success. Experimental results show that the risk-aware Weighted A\* approach most frequently produced the lowest total route cost under risk-aware scenarios, while A\* generally achieved the fastest computation time. The findings demonstrate that explainable risk-aware route recommendation can support safer decision-making compared with distance-only routing in simulated confined environments. The proposed Phase 1 artifact provides a foundation for future integration with camera-based crowd detection.

---

## 9. Recommended Article Structure

### 1. Introduction

Write about:

- Confined indoor environments often face congestion, blocked paths, and safety risks.
- Shortest-path navigation may be unsafe during crowding or hazards.
- Existing systems often separate navigation and crowd monitoring.
- This study develops a risk-aware route recommendation prototype.

End the introduction with:

- Research gap
- Research aim
- Main contributions

Suggested contribution paragraph:

> The contributions of this study are threefold. First, it proposes a weighted risk-aware route-cost model that integrates distance, crowd exposure, hazard exposure, blockage constraints, and exit accessibility. Second, it develops a web-based decision-support prototype for configuring indoor scenarios and visualizing algorithmic route recommendations. Third, it evaluates Dijkstra, A\*, Weighted A\*, and Q-learning across multiple simulated confined-environment scenarios using route safety, route efficiency, and computation metrics.

### 2. Literature Review

Suggested subsections:

1. Indoor navigation and shortest-path routing
2. Risk-aware and evacuation route planning
3. Crowd-aware navigation and congestion modeling
4. Reinforcement learning for path planning
5. Research gap summary

Gap paragraph:

> Prior studies have examined shortest-path algorithms, evacuation planning, crowd monitoring, and reinforcement learning separately. However, fewer studies provide an integrated and explainable decision-support prototype that allows risk factors, crowd exposure, and blocked routes to be configured and compared across classical, risk-aware, and learning-based algorithms in one evaluation environment.

### 3. Methodology

Use **Design Science Research Methodology (DSRM)**.

Explain stages:

| DSRM stage | Application in this study |
|---|---|
| Problem identification | Shortest path may be unsafe in confined spaces |
| Define objectives | Recommend safer, explainable routes using risk-aware factors |
| Design and development | React dashboard + FastAPI algorithm engine |
| Demonstration | Six simulated scenarios S1–S6 |
| Evaluation | Algorithm comparison using distance, risk, crowd, total cost, time, and nodes |
| Communication | Article, prototype documentation, dashboard visuals |

### 4. Proposed System

Suggested subsections:

1. System architecture
2. Grid-based indoor environment
3. Risk factor representation
4. Weighted route-cost model
5. Algorithm modules
6. Dashboard and visualization

Include the cost formula clearly:

```text
cell_cost = α·distance + β·crowd + γ·risk + δ·blockage

exit_access_score is reported separately as a path-level explainability metric.
```

### 5. Experimental Design

Describe:

- Six scenarios S1–S6
- Three weight presets
- Four algorithms
- Evaluation metrics

Suggested scenario table:

| Scenario | Purpose |
|---|---|
| S1 Normal layout | Baseline route behavior |
| S2 Risk zone on shortest path | Test risk avoidance |
| S3 Crowded main corridor | Test crowd avoidance |
| S4 Blocked exit | Test blocked/alternative exit behavior |
| S5 Dynamic crowd update | Simulate changing crowd condition |
| S6 Algorithm comparison sweep | Stress comparison across methods |

Metrics table:

| Metric | Meaning | Better direction |
|---|---|---|
| Distance | Number of route steps | Lower |
| Risk score | Exposure to risk cells | Lower |
| Crowd score | Exposure to crowd cells | Lower |
| Total cost | Weighted cost using current factors | Lower |
| Time | Computation time | Lower |
| Nodes expanded | Search effort | Lower |
| Success | Whether route reaches an exit | Higher |

### 6. Results and Discussion

Recommended discussion points:

1. In normal scenarios, distance-based methods can perform well because there is little risk/crowd exposure.
2. In risk or crowd scenarios, Weighted A\* can choose longer but safer routes.
3. A\* is usually computationally fastest because the heuristic guides the search efficiently.
4. Q-learning is slower but useful to demonstrate learning-based route behavior.
5. The dashboard improves explainability by showing why a route is recommended.

Suggested result statement:

> Across the current scenario and weight combinations, Weighted A\* achieved the lowest total cost in most cases, indicating that explicit integration of risk and crowd factors can improve route recommendation beyond distance-only routing. A\* achieved the lowest average computation time, while Q-learning required substantially longer computation due to training overhead.

### 7. Conclusion

Write:

- This study developed a Phase 1 simulation-based risk-aware navigation prototype.
- It demonstrated that route recommendation should consider more than distance.
- Weighted A\* performed strongly under risk-aware evaluation.
- The system provides explainable comparison results.
- Future work will integrate YOLO-based camera crowd detection in Phase 2.

---

## 10. Figures to Include in the Article

Recommended figures:

1. Overall system architecture diagram
2. Phase 1 dashboard screenshot
3. Grid cell type legend
4. Route-cost model diagram
5. Example scenario showing shortest path vs safer path
6. Algorithm comparison table screenshot
7. Bar chart of winner count by algorithm
8. Bar chart of average computation time by algorithm
9. Phase 1 to Phase 2 integration flow

---

## 11. Tables to Include in the Article

Recommended tables:

1. Literature comparison table
2. Risk factor definition table
3. Algorithm comparison table
4. Scenario design table
5. Evaluation metric table
6. Experimental result summary table
7. Limitations and future work table

---

## 12. What to Avoid in the Article

Avoid claiming:

- The system is a certified evacuation system.
- The system proves real-world evacuation safety.
- Q-learning outperforms all methods if current results do not show that.
- Camera-based crowd detection is completed in Phase 1.

Better wording:

- “decision-support prototype”
- “simulation-based evaluation”
- “modeled risk exposure”
- “confined-environment scenario simulation”
- “foundation for future camera-based integration”

---

## 13. Suggested Scope for Scopus Submission

For a Scopus article, keep the paper focused on **Phase 1 only** unless Phase 2 is fully implemented and evaluated.

Recommended paper scope:

> This paper presents the design, implementation, and scenario-based evaluation of a simulation-based risk-aware indoor navigation decision-support prototype. Camera-based crowd detection is discussed as future integration work.

This is safer academically because Phase 1 already has working implementation and experiment logs.

Possible article type:

- Applied computing article
- Decision-support system article
- Simulation-based evaluation article
- Indoor navigation / smart environment article

---

## 14. Next Work Before Submission

Before submitting to a Scopus-indexed venue, strengthen the paper by doing these:

1. Re-run experiments after final UI/backend changes.
2. Add statistical summary tables for each scenario and algorithm.
3. Export charts from the experiment logs.
4. Add screenshots of S2/S3 showing longer-but-safer route behavior.
5. Expand literature review with 20–30 recent references.
6. Add a clear limitation section.
7. Add threat-to-validity discussion.
8. If possible, compare against at least one additional risk-aware baseline or ablation:
   - distance-only
   - distance + risk only
   - distance + crowd only
   - full model

---

## 15. One-Paragraph Thesis/Article Summary

Phase 1 of this research developed a simulation-based risk-aware indoor navigation decision-support prototype for confined environments. The system allows users to design 2D indoor grid layouts with walls, blocked cells, risk zones, crowd-density zones, start points, and exits. A weighted route-cost model integrates distance, crowd exposure, hazard/risk exposure, blockage constraints, and exit accessibility. The prototype compares Dijkstra, A\*, Weighted A\*, and Q-learning using route distance, risk score, crowd score, total cost, computation time, nodes expanded, and success rate. Results from six simulated scenarios show that risk-aware routing, especially Weighted A\*, can recommend safer routes by avoiding risk and crowd zones, while A\* remains computationally efficient. The Phase 1 artifact demonstrates the value of explainable risk-aware route recommendation and provides a foundation for Phase 2 camera-based crowd detection integration.
