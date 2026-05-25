# Incoming GRA Syafiq Bundle Review - 2026-05-25

## Files Reviewed

- Root XLSX: `Literature Review - Matrix 20260524.xlsx`
- Root ZIP: `1. GRA - Syafiq [Shared]-20260525T122622Z-3-001.zip`
- Extracted folder: `incoming/gra_syafiq_shared_20260525/`

The root XLSX is identical to the copy inside the extracted ZIP:

- `incoming/gra_syafiq_shared_20260525/1. GRA - Syafiq [Shared]/1. Literature Review/Literature Review - Matrix 20260524.xlsx`

The extracted ZIP contains 26 files grouped into:

- `1. Literature Review`
- `1. Thesis`
- `2. PRGS`
- `3. UUM Patent Application`
- `GRA Registration - Syafiq`

The original ZIP and root XLSX are intentionally ignored by git.

## Workbook Summary

`Literature Review - Matrix 20260524.xlsx` is a broad PhD literature matrix for:

`Development of an Intelligent Prototype for Perception-Oriented Risk-Aware Decision-Making and Spatial Navigation in Adaptive Confined Environments Using Reinforcement Learning`

Workbook structure:

- `README`: workbook metadata and content guide.
- `0 - Master Table`: 88 papers, 47 metadata columns.
- `1 - Paper Screening`: all 88 papers marked as included for the broader PhD scope.
- `2 - Final Lit Matrix`: research problem, objective, theory, method, findings, strengths, weaknesses, research gaps, innovation.
- `3 - Research Gap Tracker`: 54 consolidated gaps.
- `4 - Theory Framework`: 10 theory/framework comparisons.
- `5 - Methodology`: 14 methodology types.
- `6 - Thesis Chapter Cites`: 55 citation themes mapped to thesis chapters.

Important scope note:

The workbook is useful, but it is broader than the current focused article/prototype. It includes affective computing, EEG/wearables, human emotion, LiDAR, Space Syntax, TPB, affordance theory, robotics, general RL, robot navigation, digital twins, and smart-city crowd management. Those are relevant to the larger PhD/patent framing, but many should not be pulled into the current Stage 1 framework article unless the scope is intentionally expanded.

## Current Project Scope For Filtering

Use the following as the filter for the current project:

`vision-assisted risk-aware evacuation route recommendation in confined indoor environments`

Keep literature that directly supports:

- indoor navigation or evacuation routing
- confined indoor environments
- crowd density, crowd counting, or crowd detection
- risk-aware path planning or dynamic route cost
- smoke, fire, blockage, exit accessibility, or congestion
- explainable route recommendation / decision support
- simulation or design science validation for the framework
- indoor positioning only as a supporting component

Avoid overusing literature that mainly supports:

- emotion recognition as the main contribution
- EEG/wearable affect sensing
- broad human cognition or AI augmentation
- general RL algorithms without evacuation/routing context
- robot-only navigation without human evacuation relevance
- smart-city scale pedestrian flow without indoor/confined relevance
- patent/admin/funding process documents

## Literature Matrix Filter

### Strongly Related To Current Framework

These papers are directly useful for the current framework article/prototype:

- `P004` Risk-aware path planning under uncertain crowd dynamics using constrained reinforcement learning
- `P005` Crowd flow optimisation in confined transit spaces via multi-agent deep reinforcement learning
- `P009` Comfort-aware indoor wayfinding using deep reinforcement learning and environmental sensors
- `P027` LiDAR-based pedestrian detection and tracking in confined indoor spaces using PointNet++
- `P028` Privacy-preserving pedestrian analytics with LiDAR versus video
- `P029` Multi-sensor fusion for indoor pedestrian dynamics: LiDAR, UWB, and BLE
- `P031` Real-time crowd density estimation from sparse LiDAR using graph networks
- `P033` Visibility-aware path planning using extended Space Syntax measures
- `P036` Wayfinding behaviour in complex confined buildings
- `P040` Agent-based evacuation modelling with perception-driven decisions
- `P041` Digital twins for crowd management in event venues
- `P043` AI in evacuation guidance: a systematic review
- `P044` Adaptive signage and dynamic wayfinding using AI
- `P046` Crowd dynamics in metro stations: density, flow and bottleneck identification
- `P056` Real-time crowd state estimation using physics-informed neural networks
- `P070` Crowd flow visualisation and analytic dashboards for venue managers
- `P072` Real-time anomaly detection in crowd flow using deep learning
- `P073` Wayfinding ease and indoor map design
- `P075` Behavioural cloning of expert pedestrian guides for emergency simulation
- `P076` Explainable AI for navigation decisions
- `P081` Pathways for Design Research on Artificial Intelligence
- `P082` Design Science Research Framework for Performance Analysis Using Machine Learning Techniques
- `P083` A Proficiency Model for Design Science Research Education
- `P084` Multi-Objective Deep Reinforcement Learning for Crowd Route Guidance Optimization
- `P086` The Principles of Pedestrian Route Choice
- `P087` Crowd management and pedestrian movement during Hajj pilgrimage
- `P088` Safety, security, attractiveness perceptions, and pedestrian route choice

### Useful Only As Broader PhD Background

These may support the larger PhD, but they are not central for the current focused article unless the scope expands:

- `P001`, `P007`, `P008`, `P012`, `P038`, `P049`, `P063`, `P064`, `P065`, `P066`, `P071`: perception, behaviour, comfort, theory, or pedestrian dynamics background.
- `P002`, `P006`, `P015`, `P016`, `P018`, `P019`, `P020`, `P021`, `P024`, `P025`, `P026`, `P030`, `P032`, `P034`, `P057`, `P058`, `P059`, `P062`, `P079`: robotics/RL/social navigation methods that can inspire implementation but should not dominate the framework article.
- `P010`, `P011`, `P051`, `P052`, `P068`, `P069`: trajectory prediction literature; useful if adding movement forecasting later, not needed for the current manual/grid framework.
- `P039`, `P042`, `P047`: smart city, mass gathering, and retail flow context; useful for motivation, not core evidence.
- `P085`: crowd-aware robot navigation with preference modelling; conceptually close but robot-centred.

### Not Related / Low Priority For Current Project

These should be excluded from the current framework article/prototype unless the study intentionally returns to the broader perception-emotion thesis:

- `P003` Multimodal emotion recognition using EEG and video
- `P013` Proximal Policy Optimization Algorithms
- `P014` Soft Actor-Critic
- `P017` Affect inference from gait and crowd motion
- `P022` Deep deterministic policy gradients for continuous control
- `P023` Distributional reinforcement learning with quantile regression
- `P035` CCTV-to-LiDAR ethics transition, unless writing privacy discussion
- `P037` VR as a testbed for perception-driven navigation
- `P045` Human-AI collaboration in spatial decision-making
- `P048` Stress responses to crowd density in public transport
- `P050` Sentiment and stress detection from wearable sensors
- `P053` Federated learning for pedestrian behaviour modelling
- `P054` Self-supervised learning for pedestrian motion prediction
- `P055` Causal inference in pedestrian movement
- `P060` Decentralised multi-robot navigation
- `P061` Perception-action coupling in learned visual navigation
- `P067` Pedestrian crossing decisions with TPB-deep learning
- `P074` Pedestrian intention modelling for intelligent vehicles
- `P077` Prioritised experience replay for sparse-reward navigation
- `P078` World models for robot navigation
- `P080` Deep reinforcement learning for autonomous navigation

Reason:

These papers are mostly about general RL, emotion/affect sensing, wearables, robotics, autonomous vehicles, or broad AI methodology. They may be useful later for a full PhD theory chapter, but they are not strong support for a focused article on vision-assisted crowd density, indoor risk scoring, and evacuation route recommendation.

## ZIP Content Filter

### Relevant To Current Project

- `1. Literature Review/Literature Review - Matrix 20260524.xlsx`
  - Same as the root XLSX.
  - Relevant as a source map, but must be filtered using the categories above.

- `1. Thesis/PhD Naz_Chapter 1.docx`
  - Related to the broader PhD direction.
  - Useful for understanding original framing, but too broad for the current framework article unless carefully narrowed.

- `1. Thesis/(908752) Nazrul_s Progress Update.pdf`
  - Related to broader Chapter 1 progress and conceptual framing.
  - Useful for background memory, not directly needed in the current article.

- `2. PRGS/IzwanPRGS2025_ver01.pdf`
  - Related to the prototype/grant version of the project.
  - Useful for aligning prototype direction, but broader than the current article.
  - Wording issue to remember: use `reinforcement learning`, not `reinforced learning`.

- `3. UUM Patent Application/2. UUM ICC Patent Form - Filled/ICC010 Supporting Documents.docx`
  - Related to the patent/prototype framing.
  - Useful only if preparing patent or PRGS documents, not for the journal article unless paraphrased and narrowed.

### Admin / Not Related To Article Or Prototype Coding

- `GRA Registration - Syafiq/*`
  - Personal/admin documents for GRA registration.
  - Not related to the article, prototype, or literature review.
  - Should not be used as research source material.

- `3. UUM Patent Application/1. UUM ICC Patent Form - Template/*`
  - Blank patent/admin templates.
  - Not useful for article/prototype content.

- `3. UUM Patent Application/Guide on Patent Search Report/*`
  - Patent search guide.
  - Useful only for patent filing workflow.

- `3. UUM Patent Application/*.png`
  - Patent filing infographics / submission visuals.
  - Admin only.

- `2. PRGS/LAMPIRAN E-GARIS PANDUAN PRGS (PINDAAN TAHUN 2025).pdf`
  - Funding guideline.
  - Useful only for grant compliance, not article/prototype design.

- `1. Literature Review/Website Carian Journal Paper.jfif`
  - Search-process screenshot/image.
  - Not research evidence.

## Practical Recommendation

For the current article, do not import the whole 88-paper matrix. Use only the strongly related set plus the papers already downloaded and cited in the current draft. The current article is stronger when it stays focused on:

- crowd density and crowd counting
- indoor evacuation route planning
- risk-aware routing
- explainable decision support
- design science framework development

For the prototype, the useful extracted materials are mainly:

- PRGS proposal for high-level prototype ambition
- literature matrix for methods/evaluation ideas
- patent supporting document only if preparing IP wording

Everything under GRA registration and most patent administration material is not related to the current coding/article work.
