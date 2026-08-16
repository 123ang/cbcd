# Smart Evacuation Route Planner

## Plain-English Two-Page Summary

### What this project is

The Smart Evacuation Route Planner is a research prototype that helps a person responsible for a building study safer indoor evacuation routes. Its main idea is simple: the shortest route to an exit is not always the safest route. A short corridor may contain fire risk, an obstruction, or too many people. A slightly longer route may therefore be the better choice.

The prototype combines a building map, information about danger and crowding, and several route-planning methods. It then shows the possible routes side by side and explains why one route may be safer than another. It is intended as a decision-support and research tool. It is not yet a certified emergency system and should not be used as the only source of instructions during a real emergency.

### What the user can do

The application has three main work areas.

The **Scenario Builder** allows the user to create a simple building layout on a grid. Each square can represent open space, a wall, a blocked area, a risky area, a crowded area, a starting point, or an exit. Risky and crowded areas can be given different levels of seriousness. The user can add several exits, move the start and exits, change the map size, and use ready-made scenarios to demonstrate different conditions. The map can also be saved as a JSON file and opened again later.

The **Floor Plan Planning** area allows the user to upload a real floor plan as a JPG, PNG, or PDF. The floor plan appears underneath the grid, and its visibility can be adjusted. The user manually traces the important features of the building on top of the image, such as walls, corridors, risk areas, the starting location, and exits. This converts an ordinary floor-plan image into a simplified map that the route engine can understand. The traced map and the floor-plan image can be preserved together when the scenario is exported.

The **Camera Vision** area connects crowd information to the map. The user creates a camera label, identifies whether the source is an iPhone, CCTV camera, or uploaded media, and marks which map cells are covered by that camera. The user also states the approximate real-world area represented by each covered cell. A photograph or short video can then be uploaded for analysis.

### How the camera and crowd function works

The backend uses a YOLO person-detection model to look for people in the uploaded image or selected video frames. It draws a box around each detected person and reports the number found. If YOLO is unavailable and the system is configured for automatic fallback, it can use an older OpenCV people detector instead.

For a video, the prototype does not inspect every frame. It samples a limited number of frames to keep the analysis manageable. It reports both the highest number of people found in one sampled frame and the average count across the sampled frames. The image from the busiest sampled frame is used as the preview.

The prototype then estimates crowd density using a straightforward calculation:

`crowd density = detected people / camera coverage area`

For example, if ten people are detected in an area estimated at five square metres, the calculated density is two people per square metre. The application converts this value into none, low, medium, high, or critical crowding. It then marks the camera's covered map cells with a matching crowd level. This information becomes part of the route calculation.

This is an important first connection between computer vision and evacuation planning, but it remains simplified. The detector counts visible people; it does not yet track each person continuously or determine the exact map location of every individual. The same crowd level is currently applied across the selected camera-coverage cells. Dense crowds, poor lighting, unusual camera angles, and people blocking one another can also cause undercounting.

### How routes are calculated

After the map is prepared, the user can run one route method or compare all four methods.

**Dijkstra** finds a shortest available route without treating risk or crowding as reasons to take a longer path. It provides the main baseline: what would happen if distance were the central concern?

**A-star** also searches for a short route, but uses the direction of the nearest exit to guide its search. It often reaches the same kind of answer as Dijkstra while checking fewer possible cells.

**Weighted A-star** is the main risk-aware method. It gives every step a cost based on distance, crowd exposure, risk exposure, and blockage. The user can adjust how strongly each factor matters. As a result, it may deliberately choose a longer route when that route avoids a dangerous or crowded corridor. This method is especially useful because its decision can be explained using visible factors rather than presented as an unexplained answer.

**Q-learning** is included as an artificial-intelligence comparison. It repeatedly tries movements and receives rewards for reaching an exit and penalties for walls, danger, crowding, and unnecessary steps. It then uses what it learned to construct a route. In this prototype, Q-learning is a research comparison rather than a claim that learning-based routing will always perform best.

Walls and blocked cells cannot be crossed. Risk and crowd cells can be crossed, but they increase the route's cost. The prototype allows the user to choose whether distance or safety should have more influence by changing the weights or selecting a prepared distance-focused or safety-focused setting.

### What the results tell the user

The calculated routes are drawn over the same map in different colours. The user can show or hide individual routes, replay their movement, and compare the results in a table. For each route, the application reports whether an exit was reached, which exit was used, travel distance, risk exposure, crowd exposure, total cost, calculation time, and how much searching or training was required.

It also compares every method with Dijkstra. This shows how much extra distance was accepted, how much risk changed, and the percentage of risk or crowd exposure that was reduced. The recommendation panel selects the successful route with the lowest total modelled cost and explains whether the result favours the shortest route or a safer alternative.

A built-in demonstration shows the central idea clearly. In the camera-crowd scenario, the shortest methods use a 25-step corridor that has a crowd score of 21. Weighted A-star instead takes a 35-step detour with no crowd exposure. Under the selected safety weights, the longer route has the lower overall cost and produces a 100 percent reduction in modelled crowd exposure. This does not prove that the route is universally safest, but it demonstrates that live or recently observed crowd information can change a route recommendation.

### What the prototype achieves and what remains

The current prototype already demonstrates an end-to-end research concept:

`building plan -> marked hazards and exits -> visual crowd count -> crowd level on map -> route comparison -> understandable recommendation`

This is useful for evacuation research, safety demonstrations, scenario testing, and discussions with building managers. It provides measurable evidence for the claim that route quality should consider more than distance alone. Results can be downloaded as a CSV file for later analysis, and seven prepared scenarios cover normal routes, risk areas, crowded corridors, blocked exits, changing crowd conditions, algorithm comparison, and camera-derived crowd updates.

However, several parts remain future development. The system does not yet receive continuous live camera streams, track individual people, forecast where groups will move, model smoke spreading over time, generate a full 3D digital twin, or send directions directly to occupants' phones. The floor plan must still be traced manually, camera coverage and real-world area must be calibrated by the user, and the safety weights require research validation. Real building trials, expert review, ground-truth crowd counts, privacy controls, and emergency-system certification would be required before operational use.

In plain terms, the Smart Evacuation Route Planner currently acts like a controlled indoor safety laboratory. It lets a user describe a building, add danger and crowd information, test several ways of reaching an exit, and see why a safer route may differ from the shortest one. Its strongest achievement is not simply detecting people or drawing a path. It is connecting observed crowd conditions to an explainable route decision.
