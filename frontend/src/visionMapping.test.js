import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  applyVisionCrowdToScenario,
  coveragePercent,
  coverageAreaM2,
  densityToCrowdLevel,
  walkableCellCount,
} from './visionMapping.js';

test('densityToCrowdLevel maps people per square meter into crowd route intensity', () => {
  assert.deepEqual(densityToCrowdLevel(0), { level: 'none', intensity: 0 });
  assert.deepEqual(densityToCrowdLevel(0.75), { level: 'low', intensity: 1 });
  assert.deepEqual(densityToCrowdLevel(2), { level: 'medium', intensity: 2 });
  assert.deepEqual(densityToCrowdLevel(3.5), { level: 'high', intensity: 3 });
  assert.deepEqual(densityToCrowdLevel(4.5), { level: 'critical', intensity: 3 });
});

test('coverageAreaM2 calculates camera coverage from selected grid cells', () => {
  assert.equal(coverageAreaM2([[0, 0], [0, 1], [1, 1]], 1.5), 4.5);
});

test('coveragePercent compares coverage against walkable cells only', () => {
  const grid = [
    [{ type: 'empty' }, { type: 'wall' }, { type: 'crowd' }],
    [{ type: 'risk' }, { type: 'blocked' }, { type: 'empty' }],
  ];

  assert.equal(walkableCellCount(grid), 4);
  assert.equal(coveragePercent([[0, 0], [0, 1], [1, 2]], grid), 50);
});

test('applyVisionCrowdToScenario marks only passable empty/crowd coverage cells', () => {
  const scenario = {
    grid: [
      [{ type: 'empty', intensity: 1 }, { type: 'wall', intensity: 1 }],
      [{ type: 'risk', intensity: 3 }, { type: 'crowd', intensity: 1 }],
    ],
    start: [0, 0],
    exits: [[1, 1]],
    metadata: {},
  };

  const next = applyVisionCrowdToScenario(scenario, {
    cameraId: 'cam-1',
    coverageCells: [[0, 0], [0, 1], [1, 0], [1, 1]],
    intensity: 2,
  });

  assert.deepEqual(next.grid[0][0], { type: 'crowd', intensity: 2, source: 'vision', camera_id: 'cam-1' });
  assert.deepEqual(next.grid[0][1], { type: 'wall', intensity: 1 });
  assert.deepEqual(next.grid[1][0], { type: 'risk', intensity: 3 });
  assert.deepEqual(next.grid[1][1], { type: 'crowd', intensity: 2, source: 'vision', camera_id: 'cam-1' });
});
