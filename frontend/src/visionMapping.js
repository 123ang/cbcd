export function densityToCrowdLevel(density) {
  const value = Math.max(Number(density) || 0, 0);
  if (value < 0.5) return { level: 'none', intensity: 0 };
  if (value < 1.5) return { level: 'low', intensity: 1 };
  if (value < 3) return { level: 'medium', intensity: 2 };
  if (value < 4) return { level: 'high', intensity: 3 };
  return { level: 'critical', intensity: 3 };
}

export function coverageAreaM2(coverageCells, cellAreaM2) {
  const cellCount = Array.isArray(coverageCells) ? coverageCells.length : 0;
  const area = Number(cellAreaM2) || 0;
  return Math.round(cellCount * area * 1000) / 1000;
}

export function walkableCellCount(grid) {
  return (grid || []).reduce((count, row) => count + row.filter(cell => !['wall', 'blocked'].includes(cell.type)).length, 0);
}

export function coveragePercent(coverageCells, grid) {
  const walkable = walkableCellCount(grid);
  if (!walkable) return 0;
  const selected = new Set((coverageCells || []).map(([r, c]) => `${r},${c}`));
  const coveredWalkable = (grid || []).reduce((count, row, r) => count + row.filter((cell, c) => selected.has(`${r},${c}`) && !['wall', 'blocked'].includes(cell.type)).length, 0);
  return Math.round((coveredWalkable / walkable) * 1000) / 10;
}

export function densityFromPeopleCount(peopleCount, coverageCells, cellAreaM2) {
  const area = coverageAreaM2(coverageCells, cellAreaM2);
  if (!area) return 0;
  return Math.round((Number(peopleCount || 0) / area) * 1000) / 1000;
}

export function applyVisionCrowdToScenario(scenario, { cameraId, coverageCells, intensity }) {
  const next = JSON.parse(JSON.stringify(scenario));
  const selected = new Set((coverageCells || []).map(([r, c]) => `${r},${c}`));
  next.grid = next.grid.map((row, r) => row.map((cell, c) => {
    if (!selected.has(`${r},${c}`)) return cell;
    if (['wall', 'blocked', 'risk'].includes(cell.type)) return cell;
    if (Number(intensity) <= 0) {
      return cell.source === 'vision' && cell.camera_id === cameraId
        ? { type: 'empty', intensity: 1 }
        : cell;
    }
    return {
      type: 'crowd',
      intensity: Number(intensity),
      source: 'vision',
      camera_id: cameraId,
    };
  }));
  return next;
}

export function toggleCoverageCell(coverageCells, row, col) {
  const key = `${row},${col}`;
  const existing = new Set((coverageCells || []).map(([r, c]) => `${r},${c}`));
  if (existing.has(key)) existing.delete(key);
  else existing.add(key);
  return [...existing].map(item => item.split(',').map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}
