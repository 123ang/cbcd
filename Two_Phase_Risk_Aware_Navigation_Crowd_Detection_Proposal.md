**A Two-Phase Risk-Aware Indoor Navigation and Camera-Based Crowd
Detection Decision-Support System for Confined Environments**

*Academic Research Proposal*

# Abstract

This proposal presents a two-phase research project for developing a
risk-aware indoor navigation and crowd detection decision-support system
for confined environments. Phase 1 focuses on a simulation-based 2D
indoor navigation prototype that recommends safer routes by considering
distance, obstacles, risk zones, crowd density, and exit accessibility
instead of relying only on the shortest path. Phase 2 extends the system
by integrating camera-based crowd detection using a pretrained YOLO
model to detect and count people from camera or recorded video input.
The detected crowd level is converted into a crowd-risk score and used
to update the route recommendation model. The study adopts Design
Science Research Methodology because it involves the design,
development, demonstration, and evaluation of a technological artifact.
The expected output is a React-based dashboard supported by a backend
algorithm engine that compares Dijkstra, A\*, Weighted A\*, and
reinforcement learning methods using measurable indicators such as route
distance, risk exposure, crowd exposure, total route cost, computation
time, and route success rate.

# 1. Introduction

Confined indoor environments such as event halls, campuses, shopping
malls, hospitals, stadiums, and transportation terminals often face
congestion, blocked pathways, and safety-related movement challenges. In
such environments, selecting the shortest route may not always be the
safest option because the nearest path may pass through crowded areas,
risk zones, or blocked corridors.

Traditional indoor navigation systems commonly focus on distance-based
route selection, while many crowd monitoring systems focus mainly on
people counting or alert generation. However, safer movement in confined
environments requires an integrated system that can combine spatial
navigation, risk assessment, crowd information, and decision-support
visualization. Therefore, this proposal combines two complementary
ideas: a simulation-based risk-aware navigation prototype and a
camera-based crowd detection prototype.

# 2. Background of Study

Indoor navigation and evacuation planning commonly use classical
pathfinding algorithms such as Dijkstra and A\*. These algorithms are
useful for finding efficient routes, but traditional shortest-path logic
may not be enough when risk, congestion, or blocked exits are present.
Recent evacuation research continues to compare algorithms such as
Dijkstra and A\* under scenarios involving dynamic risk and congestion,
showing the importance of evaluating route choices beyond simple
distance.

At the same time, computer vision models such as YOLO have made
camera-based people detection and crowd counting more practical.
However, people counting alone is not sufficient as a complete
decision-support contribution because many existing products and studies
already perform crowd detection. The stronger research contribution is
to use crowd detection as an input to update the navigation system,
allowing route recommendations to respond to crowd conditions.

# 3. Problem Statement

Existing indoor navigation systems may recommend the shortest route
without considering crowd density, risk zones, blocked corridors, or
exit congestion. As a result, a route that is mathematically shortest
may still be unsafe in a confined environment. Meanwhile, standalone
camera-based crowd detection systems can identify and count people, but
they often stop at monitoring or alert generation and do not directly
support spatial route decision-making.

Therefore, the main problem addressed in this study is the lack of an
integrated research prototype that combines risk-aware indoor
navigation, algorithm comparison, reinforcement learning, and
camera-based crowd detection to support safer route recommendation in
confined environments.

# 4. Research Gap

| **Research Area**         | **Existing Limitation**                                      | **Gap Addressed by This Study**                                                    |
|---------------------------|--------------------------------------------------------------|------------------------------------------------------------------------------------|
| Indoor navigation         | Often focuses on shortest path or static route guidance.     | Develops a risk-aware route recommendation model.                                  |
| Evacuation route planning | May focus on one hazard or a fixed emergency scenario.       | Tests multiple simulated risk, crowd, and blocked-exit scenarios.                  |
| Crowd monitoring          | Often detects or counts people only.                         | Uses crowd level as an input to route-risk calculation.                            |
| Camera-based analytics    | Often provides alerts but not spatial route recommendations. | Links camera crowd detection to indoor navigation decisions.                       |
| Algorithm evaluation      | Often compares algorithms separately.                        | Compares Dijkstra, A\*, Weighted A\*, and reinforcement learning in one dashboard. |

This study fills the gap by developing a two-phase system in which
simulation-based navigation forms the decision engine, while
camera-based crowd detection becomes a real-world data input module.

# 5. Research Aim

The aim of this research is to develop and evaluate a two-phase
risk-aware indoor navigation decision-support system that integrates
simulation-based route recommendation and camera-based crowd detection
for safer movement in confined environments.

# 6. Research Objectives and Research Questions

The number of research questions is aligned with the number of research
objectives. Each research question corresponds directly to one
objective.

| **No.** | **Research Objective**                                                                                                                                                                                                                          | **Corresponding Research Question**                                                                                                                                                     |
|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| RO1     | To identify key spatial and environmental risk factors that affect safe indoor navigation in confined environments, including distance, obstacles, risk zones, crowd density, and exit accessibility.                                           | RQ1: What spatial and environmental risk factors should be considered when designing a risk-aware indoor navigation system for confined environments?                                   |
| RO2     | To develop a simulation-based 2D risk-aware indoor navigation model that recommends safer routes based on distance, obstacles, risk zones, crowd density, and exit accessibility.                                                               | RQ2: How can a simulation-based 2D indoor navigation model integrate distance, obstacles, risk zones, crowd density, and exit accessibility to recommend safer routes?                  |
| RO3     | To compare traditional and intelligent route recommendation methods, including Dijkstra, A\*, Weighted A\*, and reinforcement learning.                                                                                                         | RQ3: How does the proposed risk-aware route recommendation model perform compared with Dijkstra, A\*, Weighted A\*, and reinforcement learning methods?                                 |
| RO4     | To develop a camera-based crowd detection module using a pretrained YOLO model to detect and count people from camera or recorded video input.                                                                                                  | RQ4: How can a pretrained YOLO model be used to detect and count people from camera or recorded video input for crowd monitoring?                                                       |
| RO5     | To convert detected crowd levels into crowd-risk scores that can update the navigation model and support safer route decisions.                                                                                                                 | RQ5: How can detected crowd levels be converted into crowd-risk scores that update the navigation model and support safer route decisions?                                              |
| RO6     | To evaluate the proposed two-phase system using simulated scenarios and measurable performance indicators such as route distance, risk exposure, crowd exposure, total route cost, computation time, success rate, and decision explainability. | RQ6: How effective is the proposed two-phase system in improving route safety, reducing risk exposure, and supporting explainable route decisions compared with distance-based routing? |

# 7. Proposed System Overview

The proposed system is divided into two phases. Phase 1 develops the
core simulation-based navigation engine, while Phase 2 adds camera-based
crowd detection as a real-world sensing module. The final system is
intended to work as a decision-support prototype rather than a certified
emergency evacuation system.

| **Phase** | **Focus**                                        | **Main Output**                                                                                            |
|-----------|--------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| Phase 1   | Simulation-Based Risk-Aware Navigation Prototype | A React dashboard that compares shortest-path and risk-aware routes in a 2D indoor environment.            |
| Phase 2   | Camera-Based Crowd Detection Prototype           | A YOLO-based module that detects and counts people, classifies crowd level, and updates crowd-risk scores. |

Overall system flow: indoor layout -\> risk and obstacle setting -\>
crowd density input or camera detection -\> risk score calculation -\>
algorithm comparison -\> route recommendation -\> dashboard
visualization.

# 8. Phase 1: Simulation-Based Risk-Aware Navigation Prototype

## 8.1 Phase 1 Description

Phase 1 focuses on building a 2D indoor navigation simulator. Users can
create or select an indoor layout and define walls, obstacles, exits,
risk zones, and crowd-density zones. The system compares route
recommendation methods and determines whether the safest route differs
from the shortest route.

The main concept is that the safest route may be longer, but it should
reduce exposure to crowded or high-risk areas.

## 8.2 Phase 1 Prototype Features

| **Feature**                | **Description**                                                            |
|----------------------------|----------------------------------------------------------------------------|
| 2D indoor grid map         | Represents a confined indoor environment.                                  |
| Start point selection      | Allows the user to select the starting location.                           |
| Exit point selection       | Supports one or more destination or exit points.                           |
| Wall/obstacle placement    | Marks blocked or inaccessible areas.                                       |
| Risk zone placement        | Marks danger areas or high-risk zones.                                     |
| Crowd zone placement       | Allows low, medium, or high crowd-density settings.                        |
| Algorithm comparison       | Compares Dijkstra, A\*, Weighted A\*, and reinforcement learning.          |
| Route visualization        | Displays generated routes on the dashboard.                                |
| Evaluation table           | Shows distance, risk score, crowd score, total cost, and computation time. |
| Recommendation explanation | Explains why a route is recommended.                                       |

## 8.3 Phase 1 Algorithms

Four route recommendation approaches will be implemented and compared.

Dijkstra Algorithm: Dijkstra will be used as the basic shortest-path
baseline. It calculates the shortest route based mainly on distance or
uniform movement cost.

A\* Algorithm: A\* will be used as another baseline algorithm. It uses a
heuristic function to guide the search toward the destination more
efficiently.

Weighted A\* / Risk-Aware Pathfinding: Weighted A\* will be used as the
main risk-aware routing approach. It considers distance, crowd density,
hazard/risk cost, obstacle or blockage penalty, and exit accessibility.

Proposed route-cost model:

Total Route Cost = alpha(Distance Cost) + beta(Crowd Density Cost) +
gamma(Hazard/Risk Cost) + delta(Obstacle or Blockage Penalty) +
epsilon(Exit Accessibility Cost)

Reinforcement Learning: Q-learning will be used in the early stage
because it is suitable for grid-based environments. The agent learns to
reach an exit while avoiding walls, risk zones, and crowded zones.

| **RL Element**            | **Description**                                          |
|---------------------------|----------------------------------------------------------|
| Agent                     | A simulated person moving inside the indoor environment. |
| State                     | Current grid-cell position.                              |
| Action                    | Move up, down, left, or right.                           |
| Reward for reaching exit  | Positive reward, such as +100.                           |
| Penalty for wall/blockage | Large negative reward, such as -100.                     |
| Penalty for risk zone     | Negative reward, such as -30.                            |
| Penalty for crowd zone    | Moderate negative reward, such as -15.                   |
| Movement cost             | Small negative reward for each step, such as -1.         |

# 9. React-Based Dashboard Design

The system will use a web-based dashboard developed using React rather
than Streamlit. React is suitable for this project because it supports
interactive UI components, real-time state updates, reusable dashboard
components, and flexible visualization for maps, tables, and charts.

| **Component**      | **Recommended Technology** |
|--------------------|----------------------------|
| Frontend framework | React with Vite            |
| Styling            | Tailwind CSS               |
| Charts             | Recharts or Chart.js       |
| Grid visualization | HTML Canvas or SVG         |
| Backend API        | FastAPI                    |
| Algorithm engine   | Python                     |
| Data format        | JSON                       |

The dashboard will include: Dashboard Overview, Map Editor, Algorithm
Comparison, Result Visualization, and Scenario Testing pages.

# 10. Phase 2: Camera-Based Crowd Detection Prototype

## 10.1 Phase 2 Description

Phase 2 extends the simulation prototype by adding camera-based crowd
detection. A pretrained YOLO model will be used to detect and count
people from a camera feed or recorded video. The purpose is not only to
count people, but to convert detected crowd levels into risk scores for
route recommendation.

Phase 2 system flow: camera/video input -\> YOLO person detection -\>
people counting -\> crowd-density calculation -\> threshold
classification -\> crowd-risk score -\> navigation model update -\>
route recalculation.

## 10.2 Phase 2 Prototype Features

| **Feature**               | **Description**                                             |
|---------------------------|-------------------------------------------------------------|
| Camera or video input     | Uses webcam or recorded video.                              |
| Human detection           | Uses pretrained YOLO to detect the person class.            |
| People counting           | Counts detected persons in each frame or zone.              |
| Crowd-density calculation | Estimates number of people per defined area.                |
| Threshold classification  | Classifies area as normal, moderate, crowded, or high-risk. |
| Risk score conversion     | Converts crowd status into route cost.                      |
| Dashboard integration     | Sends crowd-risk score to the Phase 1 navigation model.     |

## 10.3 Crowd Threshold Classification

The system may use either a simple people-count threshold or a
density-based threshold. The density-based method is stronger for
research because it considers the estimated area.

| **Density / Count Level**             | **Crowd Status** | **Suggested Risk Score** |
|---------------------------------------|------------------|--------------------------|
| 0-1.0 people/m² or 0-5 people         | Normal           | 1                        |
| 1.1-2.5 people/m² or 6-15 people      | Moderate         | 3                        |
| 2.6-4.6 people/m² or 16-25 people     | Crowded          | 6                        |
| 4.7+ people/m² or more than 25 people | High Risk        | 9                        |

# 11. Integration Between Phase 1 and Phase 2

The final system will integrate camera crowd detection with the
navigation model. For example, if Camera 1 detects that Corridor A has a
high crowd density, the system will update the crowd-risk score for
Corridor A. The route recommendation engine will then recalculate the
safest route and may recommend Corridor B even if it is longer.

| **Module**                   | **Input**                                     | **Output**                                 |
|------------------------------|-----------------------------------------------|--------------------------------------------|
| YOLO crowd detection module  | Camera or recorded video                      | People count and crowd status              |
| Crowd-risk conversion module | People count, estimated area, threshold rules | Crowd-risk score                           |
| Navigation engine            | Indoor map, risk zones, crowd-risk scores     | Recommended route                          |
| React dashboard              | Algorithm results and route scores            | Visualization, comparison, and explanation |

# 12. Proposed System Architecture

The proposed architecture consists of four main components: React
Dashboard, FastAPI Backend, Algorithm Engine, and Crowd Detection
Module.

| **Layer**              | **Main Components**                                                                                |
|------------------------|----------------------------------------------------------------------------------------------------|
| React Dashboard        | Map Editor, Algorithm Comparison, Result Visualization, Scenario Testing                           |
| FastAPI Backend        | Scenario API, Algorithm API, Camera Detection API, Result API                                      |
| Algorithm Engine       | Dijkstra, A\*, Weighted A\*, Q-learning                                                            |
| Crowd Detection Module | Camera/video input, pretrained YOLO, people counting, crowd-density calculation, risk score output |
| Storage                | Scenario JSON, algorithm results, experiment logs                                                  |

# 13. Research Methodology

This study will adopt Design Science Research Methodology because the
research involves designing, developing, demonstrating, and evaluating a
technological artifact. Design Science Research is widely used in
information systems research where the outcome is an artifact such as a
model, method, system, or prototype.

| **DSRM Stage**         | **Application in This Study**                                                        |
|------------------------|--------------------------------------------------------------------------------------|
| Problem identification | Identify limitations in shortest-path navigation and standalone crowd detection.     |
| Define objectives      | Develop a risk-aware navigation and crowd detection decision-support prototype.      |
| Design and development | Build Phase 1 simulator and Phase 2 camera-based crowd detection module.             |
| Demonstration          | Demonstrate the system using simulated scenarios and camera/recorded video input.    |
| Evaluation             | Compare algorithms and evaluate route safety, risk exposure, and system performance. |
| Communication          | Present results through thesis, publication, and prototype demonstration.            |

# 14. Experimental Design

| **Scenario**                           | **Purpose**                                                                                     |
|----------------------------------------|-------------------------------------------------------------------------------------------------|
| Scenario 1: Normal indoor layout       | Test whether all algorithms can find a valid route.                                             |
| Scenario 2: Risk zone on shortest path | Test whether the risk-aware model avoids high-risk zones.                                       |
| Scenario 3: Crowded main corridor      | Test whether the system recommends an alternative route when the shortest corridor is crowded.  |
| Scenario 4: Blocked exit               | Test whether the system redirects users to another available exit.                              |
| Scenario 5: Dynamic crowd update       | Test whether camera-based crowd detection updates risk scores and triggers route recalculation. |
| Scenario 6: Algorithm comparison       | Compare Dijkstra, A\*, Weighted A\*, and Q-learning under the same map condition.               |

# 15. Evaluation Metrics

| **Metric**                    | **Description**                                                           |
|-------------------------------|---------------------------------------------------------------------------|
| Route distance                | Number of steps or estimated meters from start to exit.                   |
| Risk exposure score           | Total accumulated risk along the selected route.                          |
| Crowd exposure score          | Total accumulated crowd cost along the selected route.                    |
| Total route cost              | Weighted cost combining distance, risk, crowd, and exit condition.        |
| Computation time              | Time taken by each algorithm to generate a route.                         |
| Success rate                  | Whether the route successfully reaches an exit.                           |
| Route safety improvement      | Reduction of risk compared with shortest-path routing.                    |
| Crowd classification accuracy | Accuracy of camera-based crowd classification against manual observation. |
| System usability              | User or expert evaluation of dashboard clarity.                           |
| Decision explainability       | Whether the system clearly explains why a route is recommended.           |

Example formula: Risk Reduction (%) = (Dijkstra Risk Score - Proposed
Model Risk Score) / Dijkstra Risk Score x 100

# 16. Expected Outcomes

- A React-based risk-aware indoor navigation dashboard.

- A 2D indoor map editor for confined-space simulation.

- A route recommendation engine comparing Dijkstra, A\*, Weighted A\*,
  and reinforcement learning.

- A risk-cost model that integrates distance, crowd density, obstacles,
  risk zones, and exit accessibility.

- A camera-based crowd detection module using pretrained YOLO.

- A crowd-risk classification method that converts people count or
  density into route cost.

- A complete prototype that demonstrates safer route recommendation
  compared with shortest-path routing.

# 17. Expected Research Contribution

Theoretical contribution: The study contributes a risk-aware route-cost
model that integrates spatial and environmental risk factors into indoor
navigation.

Technical contribution: The study develops a working prototype that
combines 2D indoor simulation, algorithm comparison, reinforcement
learning, camera-based people detection, crowd-risk scoring, and a
React-based decision-support dashboard.

Practical contribution: The system can support planning and
decision-making for event managers, facility managers, campus safety
officers, shopping mall operators, building planners, and emergency
management teams.

# 18. Scope of Study

This study focuses on confined indoor environments represented as 2D
maps or grid layouts. The system first uses simulated risk and crowd
data, then later uses camera or recorded video input for crowd
detection. The study is developed as a decision-support prototype for
research, simulation, and planning purposes.

# 19. Limitations of Study

- The Phase 1 simulator uses simplified 2D indoor layouts and may not
  fully represent multi-floor or irregular building structures.

- Camera-based detection may be affected by lighting, camera angle,
  occlusion, and video quality.

- The reinforcement learning model may require sufficient training
  episodes and careful reward design.

- The system is intended for decision support and research demonstration
  only, not as a certified emergency evacuation system without
  real-world validation and safety approval.

# 20. Development Plan

| **Phase** | **Activity**                                     | **Output**                     |
|-----------|--------------------------------------------------|--------------------------------|
| Phase 1.1 | Build React dashboard and map editor             | 2D indoor map interface        |
| Phase 1.2 | Implement Dijkstra and A\*                       | Shortest-path baselines        |
| Phase 1.3 | Implement Weighted A\* risk-aware model          | Safer route recommendation     |
| Phase 1.4 | Add Q-learning reinforcement learning            | AI-based route comparison      |
| Phase 1.5 | Add comparison table and visual results          | Algorithm evaluation dashboard |
| Phase 2.1 | Add YOLO person detection using video input      | People detection module        |
| Phase 2.2 | Add people counting and threshold classification | Crowd status output            |
| Phase 2.3 | Convert crowd level into risk score              | Crowd-risk layer               |
| Phase 2.4 | Connect camera module to navigation model        | Dynamic route update           |
| Phase 2.5 | Conduct evaluation and testing                   | Final prototype results        |

# 21. Proposed Timeline

| **Month** | **Activity**                                       |
|-----------|----------------------------------------------------|
| Month 1   | Literature review and system requirement analysis  |
| Month 2   | Design system architecture and risk-cost model     |
| Month 3   | Develop React dashboard and 2D map editor          |
| Month 4   | Implement Dijkstra, A\*, and Weighted A\*          |
| Month 5   | Implement Q-learning reinforcement learning module |
| Month 6   | Conduct Phase 1 testing and algorithm comparison   |
| Month 7   | Develop YOLO-based camera crowd detection module   |
| Month 8   | Integrate crowd detection with navigation system   |
| Month 9   | Conduct full system testing using scenarios        |
| Month 10  | Evaluate results and refine model                  |
| Month 11  | Prepare thesis chapters and publication draft      |
| Month 12  | Final prototype demonstration and documentation    |

# 22. Conclusion

This proposal presents a two-phase academic research prototype for
risk-aware indoor navigation and camera-based crowd detection. Phase 1
develops a simulation-based navigation system that recommends safer
routes by considering distance, obstacles, crowd density, risk zones,
and exit accessibility. Phase 2 enhances the system by using a
pretrained YOLO model to detect and count people from camera or recorded
video input, classify crowd levels, and update the navigation model with
crowd-risk scores. The proposed study is suitable for PhD-level research
because it combines algorithm development, reinforcement learning,
computer vision, dashboard design, and measurable evaluation. Most
importantly, the research contribution is not only detecting crowds or
finding shortest paths, but developing an integrated decision-support
framework that explains and recommends safer movement decisions in
confined environments.

# References

Alano, J. M. L. (2024). Real-Time In/Out Crowd Counting System Utilizing
YOLOv8 Object Detection. Emerging Library & Information Perspectives.
https://ui.adsabs.harvard.edu/abs/2024elti.conf...37A/abstract

Bhattarai, M., et al. (2021). A Deep Q-learning based Path Planning and
Navigation Approach. SCITEPRESS.
https://www.scitepress.org/PublishedPapers/2021/102671/102671.pdf

Kim, H. (2026). Algorithmic Evaluation of Fire Evacuation Efficiency
Under Dynamic Risk and Congestion Conditions. Fire, 9(1), 32.
https://www.mdpi.com/2571-6255/9/1/32

Long, Z., et al. (2025). Human-Risk-Aware Safe Path Planning Based on
Deep Reinforcement Learning. Sensors, 25(23), 7211.
https://www.mdpi.com/1424-8220/25/23/7211

Peffers, K., Tuunanen, T., Rothenberger, M. A., & Chatterjee, S. (2007).
A Design Science Research Methodology for Information Systems Research.
Journal of Management Information Systems, 24(3), 45-77.
https://doi.org/10.2753/MIS0742-1222240302

Shyaa, T. A. R. (2024). Enhancing Real Human Detection and People
Counting Using YOLOv8. BIO Web of Conferences.
https://www.bio-conferences.org/articles/bioconf/abs/2024/16/bioconf_iscku2024_00061/bioconf_iscku2024_00061.html

Fitkau, I. (2025). Applying Multi-Agent Reinforcement Learning for
Escape Path Planning. EG-ICE 2025.
https://pureportal.strath.ac.uk/files/291658801/Fitkau-Hartmann-EG-ICE-2025-Applying-multi-agent-reinforcement-learning-for-escape-path-planning.pdf

Dynamic Evacuation Route Planning in Complex Buildings. (2025). Malmö
University.
https://mau.diva-portal.org/smash/get/diva2%3A1967976/FULLTEXT02.pdf
