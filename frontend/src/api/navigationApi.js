const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8001';

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function postFile(path, file) {
  const body = new FormData();
  body.append('media', file);
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', body });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
const endpoint = { dijkstra: 'dijkstra', astar: 'astar', weighted_astar: 'weighted-astar', qlearning: 'qlearning' };
export const api = {
  compare: (scenario) => post('/compare-algorithms', scenario),
  compareSelected: (scenario, algorithms) => post('/compare-selected', { scenario, algorithms }),
  run: (algorithm, scenario) => post(`/run-${endpoint[algorithm]}`, scenario),
  detectCrowd: (file) => postFile('/camera/crowd', file),
  loadScenarios: async () => {
    const res = await fetch(`${API_BASE}/load-scenario`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
