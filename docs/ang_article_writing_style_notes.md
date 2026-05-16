# Ang Article Writing Style Notes

Source folder reviewed: `ang_article/`  
Files reviewed:

- `2022.03.07.pdf` — *Framework to Mine XML Format Event Logs*
- `Enabling_efficient_business_process_mini.pdf` — *Enabling efficient business process mining using flatten sequential structure model*
- `package_converted.pdf` — *Optimizing Business Process Analysis: Application of Data Mining in XML Format Business Process Log Data*

Purpose: capture the author's academic writing style so the first CBCD paper can be drafted in a familiar voice.

---

## 1. Overall writing pattern

The writing style is practical, framework-oriented, and method-driven. The papers usually follow this flow:

1. Introduce the domain and why it matters.
2. Explain the data/problem complexity.
3. Point out limitations of existing methods.
4. Propose a framework/model.
5. Explain phases of the framework step by step.
6. Demonstrate the model using experiment or scenario data.
7. Present results in tables.
8. Conclude with practical usefulness and future work.

For the Stage 1 CBCD conceptual paper, the closest matching structure is:

1. Introduction
2. Literature Review
3. Proposed Conceptual Framework
4. Framework Layers / Process Flow
5. Scenario Walkthrough
6. Validation Plan
7. Discussion
8. Conclusion and Future Work

---

## 2. Common paragraph style

The writing often uses direct explanatory sentences such as:

- “This paper proposes…”
- “The proposed framework…”
- “The motivation to develop this framework is…”
- “The detail phases that happen in the framework are elaborated as following.”
- “The results show that…”
- “In a nutshell…”
- “For future works…”

The style is clear and functional rather than highly rhetorical. It prioritizes explanation and procedure.

For the CBCD paper, we should write in a clean academic style but preserve this practical voice:

> This paper proposes a conceptual framework for camera-assisted risk-aware indoor navigation and crowd-informed decision support. The proposed framework integrates spatial environment modelling, risk representation, crowd perception, route planning, decision-support visualization, and feedback-based replanning.

---

## 3. Abstract style

The abstracts usually include:

1. Background/context
2. Problem or limitation
3. Proposed method/framework
4. What the method enables
5. Result/contribution/future usefulness

Typical tone:

- Problem is stated plainly.
- Contribution is framed as enabling broader analysis or decision-making.
- Keywords are domain + method focused.

For CBCD, the abstract should similarly state:

- Indoor navigation often focuses on shortest path.
- Shortest path may not be safe in crowded or hazardous confined environments.
- Existing crowd detection and navigation studies are often separate.
- This paper proposes an integrated conceptual framework.
- The framework supports safer and explainable route decision support.

---

## 4. Introduction style

The introductions normally:

- Start broad with technology/domain growth.
- Define key terms.
- Explain why existing approaches are insufficient.
- Narrow into the research need.
- End by introducing the proposed framework/model.

For CBCD, use this movement:

1. Indoor navigation is important in complex confined environments.
2. Shortest-path routing is common but can be unsafe.
3. Hazards, blocked exits, and crowd density can affect route safety.
4. Camera-based crowd detection can provide dynamic crowd information.
5. However, crowd detection often stops at monitoring and is not connected to route decision support.
6. Therefore, this paper proposes a conceptual framework integrating these components.

---

## 5. Literature review style

The reviewed papers use subsections and define concepts before discussing gaps. They frequently use “X is defined as…” and “Researchers have developed…” patterns.

For CBCD, literature review should use clear subsections:

- Indoor navigation and evacuation routing
- Risk-aware path planning
- Crowd detection and crowd counting
- Agent-based simulation / evacuation modelling
- Design science and conceptual framework development

Each subsection should end with a bridge to the gap.

Example style:

> Although these studies provide useful approaches for evacuation routing, most of them focus on route computation or hazard modelling separately. Limited studies connect camera-based crowd perception directly with risk-aware route recommendation and decision-support visualization.

---

## 6. Framework / methodology style

The author's papers explain frameworks through phases/layers. Each phase is described in simple sequential order:

- Phase 1: pre-processing
- Phase 2: extraction
- Phase 3: conversion
- Phase 4: knowledge discovery
- Phase 5: interpretation

For CBCD, we should mirror this by explaining framework layers:

- Layer 1: Spatial Environment Layer
- Layer 2: Risk Representation Layer
- Layer 3: Crowd Perception Layer
- Layer 4: Route Planning Layer
- Layer 5: Decision-Support and Visualization Layer
- Layer 6: Feedback and Replanning Layer

Use repeated structure for each layer:

1. What the layer does
2. Input
3. Process
4. Output
5. Why it matters

---

## 7. Results / discussion style

The author's papers present results with tables and then explain which method performed best. They use comparative phrases such as:

- “Table X summarizes…”
- “The highest value is…”
- “Compared to…”
- “This suggests that…”
- “It can be concluded that…”

For a Stage 1 conceptual paper, there may not be numerical results yet, so use:

- scenario walkthrough tables
- framework layer summary table
- literature comparison table
- expert review checklist table

Discussion should focus on how the framework addresses the gap.

---

## 8. Conclusion style

Conclusions often start with “In a nutshell” or “In short,” then restate:

- What was proposed
- What it enables
- Why it is useful
- Future work

For CBCD:

> In a nutshell, this paper proposes a conceptual framework that integrates spatial modelling, risk representation, camera-based crowd perception, route planning, decision-support visualization, and feedback-based replanning for confined indoor environments. The framework provides a foundation for future prototype development and simulation-based evaluation.

---

## 9. Style to preserve

Preserve:

- Clear framework-first explanation
- Step-by-step process descriptions
- Practical usefulness and decision-maker angle
- Tables for summary and comparison
- Direct statement of future work

Improve gently:

- Reduce grammar roughness while keeping the author's voice.
- Avoid overclaiming.
- Use more precise academic linking phrases.
- Make research gap sharper and more Scopus-friendly.

---

## 10. Suggested voice for CBCD first paper

Best target voice:

> Clear, practical, framework-driven academic writing with stronger grammar polish and a sharper research gap.

Avoid making the paper sound too theoretical or too “AI-generated.” The user's natural style is grounded in practical models, phases, datasets/scenarios, and decision-maker usefulness.
