import test from 'node:test';
import assert from 'node:assert/strict';

import { buildResultsCsv } from './resultsCsv.js';


test('buildResultsCsv creates a downloadable table without spreadsheet formulas', () => {
  const csv = buildResultsCsv(
    { name: '=Unsafe scenario' },
    [
      {
        algorithm: '+unsafe',
        success: true,
        distance: 12,
        risk_score: 3,
        crowd_score: 2,
        total_cost: 20,
        time_ms: 4.5,
        nodes_expanded: 18,
        weights: { alpha: 1, beta: 3 },
      },
    ],
    '2026-06-05T10:00:00.000Z',
  );

  const lines = csv.trim().split('\n');
  assert.match(lines[0], /^timestamp,scenario,algorithm,success/);
  assert.match(lines[1], /,'=Unsafe scenario,'\+unsafe,true,12,3,2,20,4.5,18/);
});

