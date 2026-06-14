const fields = [
  'timestamp',
  'scenario',
  'algorithm',
  'success',
  'distance',
  'risk_score',
  'crowd_score',
  'total_cost',
  'time_ms',
  'nodes_expanded',
  'train_steps',
  'reached_exit',
  'exit_access_score',
  'delta_distance_vs_dijkstra',
  'delta_risk_vs_dijkstra',
  'risk_reduction_pct',
  'crowd_reduction_pct',
  'alpha',
  'beta',
  'gamma',
  'delta',
  'epsilon',
  'heuristic_weight',
];


function csvCell(value) {
  if (value === null || value === undefined) return '';
  let text = Array.isArray(value) ? JSON.stringify(value) : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) text = `"${text.replaceAll('"', '""')}"`;
  return text;
}


export function buildResultsCsv(scenario, results, timestamp = new Date().toISOString()) {
  const rows = results.map(result => {
    const weights = result.weights || {};
    const values = {
      timestamp,
      scenario: scenario.name || 'Untitled',
      ...result,
      alpha: weights.alpha,
      beta: weights.beta,
      gamma: weights.gamma,
      delta: weights.delta,
      epsilon: weights.epsilon,
      heuristic_weight: weights.heuristic_weight,
    };
    return fields.map(field => csvCell(values[field])).join(',');
  });
  return [fields.join(','), ...rows].join('\n') + '\n';
}

