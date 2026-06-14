import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { Camera, Eraser, Image as ImageIcon, Plus, Trash2, Video } from 'lucide-react';
import { api } from './api/navigationApi';
import { buildResultsCsv } from './resultsCsv.js';
import {
  applyVisionCrowdToScenario,
  coveragePercent,
  coverageAreaM2,
  densityFromPeopleCount,
  densityToCrowdLevel,
  toggleCoverageCell,
} from './visionMapping.js';
import './styles.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const tools = ['empty','wall','start','exit','risk','crowd','blocked'];
const toolLabels = {empty:'Empty',wall:'Wall',start:'Start',exit:'Exit',risk:'Risk',crowd:'Crowd',blocked:'Blocked'};
const algorithms = ['dijkstra','astar','weighted_astar','qlearning'];
const presets = {
  Default: { alpha: 1, beta: 3, gamma: 5, delta: 10, epsilon: 2, heuristic_weight: 1 },
  'Distance-heavy': { alpha: 3, beta: 1, gamma: 2, delta: 10, epsilon: 1, heuristic_weight: 1 },
  'Safety-heavy': { alpha: 1, beta: 5, gamma: 8, delta: 12, epsilon: 2, heuristic_weight: 1 }
};
const pathColors = { dijkstra:'#2563eb', astar:'#7c3aed', weighted_astar:'#16a34a', qlearning:'#f59e0b' };
const metricCols = [
  'distance','delta_distance_vs_dijkstra','risk_score','delta_risk_vs_dijkstra',
  'risk_reduction_pct','crowd_score','crowd_reduction_pct','exit_access_score',
  'train_steps','nodes_expanded','time_ms','total_cost'
];
const metricLabels = {
  distance:'Distance',
  delta_distance_vs_dijkstra:'Δ distance',
  risk_score:'Risk',
  delta_risk_vs_dijkstra:'Δ risk',
  risk_reduction_pct:'Risk reduction',
  crowd_score:'Crowd',
  crowd_reduction_pct:'Crowd reduction',
  exit_access_score:'Exit access',
  train_steps:'Train steps',
  nodes_expanded:'Search nodes',
  time_ms:'Time ms',
  total_cost:'Total cost'
};
const higherIsBetter = new Set(['risk_reduction_pct','crowd_reduction_pct']);
const speedMs = { Slow: 180, Normal: 80, Fast: 25, Instant: 0 };
const cellSize = 24;
const cellGap = 2;
const sampleFloorPlanUrl = '/sample_floorplan_wikimedia.jpg';
const sampleFloorPlanSource = 'https://commons.wikimedia.org/wiki/File:Sample_Floorplan.jpg';
const cameraSourceLabels = { iphone: 'iPhone', cctv: 'CCTV/IP camera', upload: 'Uploaded media' };
const sampleVisionMedia = [
  {
    label: 'Sample photo',
    fileName: 'ultralytics_bus_people.jpg',
    url: '/vision_samples/ultralytics_bus_people.jpg',
    mime: 'image/jpeg',
    kind: 'image',
    note: 'street scene with visible people'
  },
  {
    label: 'Sample video',
    fileName: 'big_city_life_people.webm',
    url: '/vision_samples/big_city_life_people.webm',
    mime: 'video/webm',
    kind: 'video',
    note: 'short public walking scene'
  }
];

function makeGrid(rows=20, cols=30) { return Array.from({length:rows},()=>Array.from({length:cols},()=>({type:'empty', intensity:1}))); }
function clone(x){ return JSON.parse(JSON.stringify(x)); }
function defaultScenario(){ return { name:'Custom Scenario', grid: makeGrid(), start:[10,3], exits:[[10,26]], weights: presets.Default, metadata:{} }; }
function key(pos){ return `${pos[0]},${pos[1]}`; }
function isDirtyScenario(s){ return s.grid.some(row=>row.some(cell=>cell.type!=='empty')) || s.exits.length!==1 || s.start[0]!==10 || s.start[1]!==3; }
function floorPlanOf(s){ return s.metadata?.floor_plan || null; }
function visionOf(s){ return s.metadata?.vision_input || { cameras: [] }; }
function isPassableCell(cell){ return !['wall','blocked'].includes(cell?.type); }
function tabForScenario(s){ return s.metadata?.vision_input?.cameras?.length ? 'vision' : (s.metadata?.floor_plan ? 'floor' : 'builder'); }

function defaultCoverageCells(rows, cols){
  const top = Math.max(0, Math.floor(rows / 2) - 2);
  const left = Math.max(0, Math.floor(cols / 2) - 3);
  const out = [];
  for(let r=top; r<Math.min(rows, top + 4); r++) for(let c=left; c<Math.min(cols, left + 6); c++) out.push([r,c]);
  return out;
}

function cameraMarkerCell(camera){
  const cells = camera?.coverage_cells || [];
  if(camera?.marker_cell) return camera.marker_cell;
  if(!cells.length) return null;
  const mid = cells[Math.floor(cells.length / 2)];
  return mid || null;
}

function makeCamera(rows, cols, index=1){
  const coverage = defaultCoverageCells(rows, cols);
  return {
    id: `cam-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
    name: `Camera ${index}`,
    source_type: 'iphone',
    marker_cell: coverage[Math.floor(coverage.length / 2)] || [0, 0],
    coverage_cells: coverage,
    cell_area_m2: 1,
    notes: 'Prototype camera coverage; click cells to adjust.',
  };
}

function nearestEmpty(grid, r, c, exits=[]){
  const exitKeys = new Set(exits.map(key));
  const q=[[r,c]], seen=new Set([`${r},${c}`]);
  while(q.length){
    const [cr,cc]=q.shift();
    if(grid[cr]?.[cc] && grid[cr][cc].type==='empty' && !exitKeys.has(`${cr},${cc}`)) return [cr,cc];
    for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
      const nr=cr+dr,nc=cc+dc, k=`${nr},${nc}`;
      if(nr>=0&&nr<grid.length&&nc>=0&&nc<grid[0].length&&!seen.has(k)){ seen.add(k); q.push([nr,nc]); }
    }
  }
  return null;
}

function validateScenario(s){
  if(!s.grid?.length || !s.grid[0]?.length) return 'Grid is empty.';
  const rows=s.grid.length, cols=s.grid[0].length;
  const inBounds=([r,c])=>r>=0&&r<rows&&c>=0&&c<cols;
  if(!Array.isArray(s.start)||!inBounds(s.start)) return 'Start is missing or outside the grid.';
  if(!isPassableCell(s.grid[s.start[0]][s.start[1]])) return 'Start must be on a passable empty cell.';
  if(!Array.isArray(s.exits)||!s.exits.length) return 'Please add at least one exit before running algorithms.';
  const badExit=s.exits.find(e=>!Array.isArray(e)||!inBounds(e)||!isPassableCell(s.grid[e[0]][e[1]]));
  if(badExit) return `Exit ${JSON.stringify(badExit)} is invalid or blocked.`;
  return '';
}

function readFileAsDataUrl(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function imageDimensions(dataUrl){
  return new Promise((resolve)=>{
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({});
    img.src = dataUrl;
  });
}

function formatCell(v){ return Array.isArray(v)?`(${v[0]},${v[1]})`:''; }
function formatNumber(value){
  const n = Number(value);
  if(!Number.isFinite(n)) return '—';
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}
function formatMetric(metric, value){
  if(value === undefined || value === null || value === '') return '—';
  const text = formatNumber(value);
  if(text === '—') return text;
  if(metric.endsWith('_pct')) return `${text}%`;
  if(metric.startsWith('delta_') && Number(value) > 0) return `+${text}`;
  return text;
}

function App(){
  const [scenario,setScenario]=useState(defaultScenario());
  const [rows,setRows]=useState(20);
  const [cols,setCols]=useState(30);
  const [tool,setTool]=useState('wall');
  const [intensity,setIntensity]=useState(2);
  const [results,setResults]=useState([]);
  const [scenarios,setScenarios]=useState([]);
  const [selected,setSelected]=useState(Object.fromEntries(algorithms.map(a=>[a,true])));
  const [visible,setVisible]=useState(Object.fromEntries(algorithms.map(a=>[a,true])));
  const [routeFilter,setRouteFilter]=useState('all');
  const [sort,setSort]=useState({key:'total_cost', dir:'asc'});
  const [speed,setSpeed]=useState('Instant');
  const [wallDensity,setWallDensity]=useState(0.22);
  const [pathProgress,setPathProgress]=useState(Infinity);
  const [replayKey,setReplayKey]=useState(0);
  const [history,setHistory]=useState([]);
  const [future,setFuture]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [mouseDown,setMouseDown]=useState(false);
  const [lastPainted,setLastPainted]=useState(null);
  const [activeDrag,setActiveDrag]=useState(null);
  const [activeTab,setActiveTab]=useState('builder');
  const [floorBusy,setFloorBusy]=useState(false);
  const [activePdf,setActivePdf]=useState(null);
  const [visionBusy,setVisionBusy]=useState(false);
  const [activeCameraId,setActiveCameraId]=useState(null);
  const mainRef = useRef(null);

  useEffect(()=>{ api.loadScenarios().then(setScenarios).catch(()=>{}); },[]);
  useEffect(()=>{
    const onKey=(e)=>{
      if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return;
      const n=Number(e.key);
      if(n>=1&&n<=tools.length) setTool(tools[n-1]);
      if(e.key.toLowerCase()==='r') runSelected();
      if(e.key.toLowerCase()==='c') clearResults();
      if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='z' && !e.shiftKey){ e.preventDefault(); undo(); }
      if(((e.metaKey||e.ctrlKey) && e.shiftKey && e.key.toLowerCase()==='z') || ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='y')){ e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown',onKey); return()=>window.removeEventListener('keydown',onKey);
  });
  useEffect(()=>{
    if(!results.length || speed==='Instant'){ setPathProgress(Infinity); return; }
    setPathProgress(0);
    const maxLen = Math.max(...results.map(r=>r.path?.length||0));
    const id = setInterval(()=>setPathProgress(p=>p>=maxLen?(clearInterval(id),p):p+1), speedMs[speed]);
    return()=>clearInterval(id);
  },[results, speed, replayKey]);

  const floorPlan = floorPlanOf(scenario);
  const visionInput = visionOf(scenario);
  const cameras = visionInput.cameras || [];
  const activeCamera = cameras.find(camera=>camera.id===activeCameraId) || cameras[0] || null;
  useEffect(()=>{
    if(cameras.length && !cameras.some(camera=>camera.id===activeCameraId)) setActiveCameraId(cameras[0].id);
    if(!cameras.length && activeCameraId) setActiveCameraId(null);
  }, [cameras, activeCameraId]);
  useEffect(()=>{
    if(activeTab === 'floor' && mainRef.current) mainRef.current.scrollTop = 0;
  }, [activeTab, floorPlan?.rendered_image_data_url]);
  const visibleResults = useMemo(()=>results.filter(r=>visible[r.algorithm] && (routeFilter==='all' || r.algorithm===routeFilter)), [results, visible, routeFilter]);
  const pathMap = useMemo(()=>{
    const m={}; visibleResults.forEach(r=>r.path?.forEach((p,i)=>{ if(i>0 && i<r.path.length-1 && i<=pathProgress) (m[key(p)] ||= []).push(r.algorithm); })); return m;
  },[visibleResults, pathProgress]);
  const winner = useMemo(()=>results.filter(r=>r.success).sort((a,b)=>a.total_cost-b.total_cost)[0], [results]);
  const bestByMetric = useMemo(()=>{
    const out={};
    metricCols.forEach(metric=>{
      const vals=results.filter(r=>r.success && r[metric] !== undefined && r[metric] !== null).map(r=>Number(r[metric])).filter(Number.isFinite);
      out[metric]=vals.length ? (higherIsBetter.has(metric) ? Math.max(...vals) : Math.min(...vals)) : null;
    });
    return out;
  },[results]);
  const sortedResults = useMemo(()=>{
    const dir = sort.dir==='asc'?1:-1;
    return [...results].sort((a,b)=>{
      if(String(sort.key)==='algorithm') return label(a.algorithm).localeCompare(label(b.algorithm))*dir;
      const av = a[sort.key] === null || a[sort.key] === undefined ? Infinity : Number(a[sort.key]);
      const bv = b[sort.key] === null || b[sort.key] === undefined ? Infinity : Number(b[sort.key]);
      return (av-bv)*dir;
    });
  },[results, sort]);

  function pushHistory(prev){ setHistory(h=>[...h.slice(-49), clone(prev)]); setFuture([]); }
  function commit(updater, clear=true){
    setScenario(prev=>{
      pushHistory(prev);
      const next=updater(clone(prev));
      setRows(next.grid.length);
      setCols(next.grid[0].length);
      return next;
    });
    if(clear) setResults([]);
  }
  function patchFloorPlan(patch, { clear=false, record=false } = {}){
    setScenario(prev=>{
      if(record) pushHistory(prev);
      const next=clone(prev);
      next.metadata = {...(next.metadata || {})};
      next.metadata.floor_plan = {...(next.metadata.floor_plan || {}), ...patch};
      return next;
    });
    if(clear) setResults([]);
  }
  function updateCamera(cameraId, patch, { clear=false, record=false } = {}){
    setScenario(prev=>{
      if(record) pushHistory(prev);
      const next=clone(prev);
      next.metadata = {...(next.metadata || {})};
      const current = next.metadata.vision_input || {};
      const updatedCameras = (current.cameras || []).map(camera=>camera.id===cameraId ? {...camera, ...patch} : camera);
      next.metadata.vision_input = {...current, cameras: updatedCameras};
      return next;
    });
    if(clear) setResults([]);
  }
  function undo(){ setHistory(h=>{ if(!h.length) return h; const prev=h[h.length-1]; setFuture(f=>[clone(scenario),...f]); setScenario(prev); setRows(prev.grid.length); setCols(prev.grid[0].length); setResults([]); return h.slice(0,-1); }); }
  function redo(){ setFuture(f=>{ if(!f.length) return f; const next=f[0]; pushHistory(scenario); setScenario(next); setRows(next.grid.length); setCols(next.grid[0].length); setResults([]); return f.slice(1); }); }
  function beginCell(r,c){
    const isStart=scenario.start[0]===r&&scenario.start[1]===c;
    const isExit=scenario.exits.some(e=>e[0]===r&&e[1]===c);
    setMouseDown(true);
    if(isStart){ setActiveDrag({type:'start', origin:[r,c]}); return; }
    if(isExit){ setActiveDrag({type:'exit', origin:[r,c]}); return; }
    paint(r,c);
  }
  function enterCell(r,c){
    if(!mouseDown) return;
    if(activeDrag){ moveSpecialCell(r,c); return; }
    paint(r,c);
  }
  function endDrag(){ setMouseDown(false); setLastPainted(null); setActiveDrag(null); }
  function moveSpecialCell(r,c){
    const stamp = `${activeDrag.type},${r},${c}`;
    if(stamp===lastPainted) return;
    setLastPainted(stamp);
    commit(prev=>{
      if(activeDrag.type==='start') prev.start=[r,c];
      if(activeDrag.type==='exit'){
        prev.exits=prev.exits.filter(e=>!(e[0]===activeDrag.origin[0]&&e[1]===activeDrag.origin[1]));
        if(!prev.exits.some(e=>e[0]===r&&e[1]===c)) prev.exits.push([r,c]);
        setActiveDrag({type:'exit', origin:[r,c]});
      }
      prev.grid[r][c]={type:'empty',intensity:1};
      return prev;
    });
  }
  function paint(r,c, forcedTool){
    const selectedTool = forcedTool || tool;
    const stamp = `${r},${c},${selectedTool},${intensity}`;
    if(mouseDown && stamp===lastPainted) return;
    setLastPainted(stamp);
    commit(prev=>applyPaint(prev,r,c,selectedTool,intensity));
  }
  function applyPaint(prev,r,c,selectedTool,intensityValue){
    const cell={type:selectedTool, intensity: selectedTool==='risk'||selectedTool==='crowd'? Number(intensityValue):1};
    if(selectedTool==='start'){ prev.start=[r,c]; prev.grid[r][c]={type:'empty',intensity:1}; }
    else if(selectedTool==='exit'){
      const exists=prev.exits.some(e=>e[0]===r&&e[1]===c); if(!exists) prev.exits.push([r,c]);
      prev.grid[r][c]={type:'empty',intensity:1};
    } else {
      prev.exits=prev.exits.filter(e=>!(e[0]===r&&e[1]===c));
      if(prev.start[0]===r&&prev.start[1]===c){
        const replacement = nearestEmpty(prev.grid, r, c, prev.exits);
        if(!replacement) return prev;
        prev.start=replacement;
      }
      prev.grid[r][c]=cell;
    }
    return prev;
  }
  function resizeGrid(){ const r=Math.min(80,Math.max(5,Number(rows)||20)); const c=Math.min(80,Math.max(5,Number(cols)||30)); if(isDirtyScenario(scenario) && !confirm('Resize grid and clear current map?')) return; commit(()=>({...defaultScenario(), grid: makeGrid(r,c), start:[Math.floor(r/2),2], exits:[[Math.floor(r/2),c-3]], name:`${r}×${c} scenario`, metadata: scenario.metadata || {}})); }
  function resizePreset(r,c){ setRows(r); setCols(c); if(!isDirtyScenario(scenario) || confirm('Resize grid and clear current map?')) commit(()=>({...defaultScenario(), grid: makeGrid(r,c), start:[Math.floor(r/2),2], exits:[[Math.floor(r/2),c-3]], name:`${r}×${c} scenario`, metadata: scenario.metadata || {}})); }
  function clearResults(){ setResults([]); }
  function clearWalls(){ commit(prev=>{ prev.grid=prev.grid.map(row=>row.map(cell=>cell.type==='wall'||cell.type==='blocked'?{type:'empty',intensity:1}:cell)); return prev; }); }
  function clearBoard(){ commit(()=>defaultScenario()); setRows(20); setCols(30); setActivePdf(null); }
  function generateRandom(){ commit(prev=>{ const r=prev.grid.length,c=prev.grid[0].length; prev.grid=makeGrid(r,c); for(let i=0;i<r;i++) for(let j=0;j<c;j++){ if(Math.random()<wallDensity && !(i===prev.start[0]&&j===prev.start[1]) && !prev.exits.some(e=>e[0]===i&&e[1]===j)) prev.grid[i][j]={type:'wall',intensity:1}; } return prev; }); }
  function generateCorridor(){ commit(prev=>{ const r=prev.grid.length,c=prev.grid[0].length; prev.grid=makeGrid(r,c); const mid=Math.floor(r/2); for(let i=2;i<r-2;i++){ if(i!==mid) prev.grid[i][Math.floor(c/2)]={type:'wall',intensity:1}; } for(let j=Math.floor(c/3);j<Math.floor(c*2/3);j++) prev.grid[mid][j]={type:'risk',intensity:3}; return prev; }); }
  function generateRecursive(skew='balanced'){
    commit(prev=>{
      const r=prev.grid.length,c=prev.grid[0].length; prev.grid=makeGrid(r,c);
      for(let i=0;i<r;i++){ prev.grid[i][0]={type:'wall',intensity:1}; prev.grid[i][c-1]={type:'wall',intensity:1}; }
      for(let j=0;j<c;j++){ prev.grid[0][j]={type:'wall',intensity:1}; prev.grid[r-1][j]={type:'wall',intensity:1}; }
      const carve=(r1,c1,r2,c2,orientation)=>{
        if(r2-r1<4 || c2-c1<4) return;
        const horizontal = orientation==='h' || (orientation==='balanced' && (r2-r1)>(c2-c1));
        if(horizontal){
          const wall = r1 + 2 + Math.floor(Math.random()*Math.max(1,r2-r1-3));
          const gap = c1 + 1 + Math.floor(Math.random()*Math.max(1,c2-c1-1));
          for(let j=c1+1;j<c2;j++) if(j!==gap) prev.grid[wall][j]={type:'wall',intensity:1};
          carve(r1,c1,wall,c2,skew==='vertical'?'v':skew==='horizontal'?'h':'balanced'); carve(wall,c1,r2,c2,skew==='vertical'?'v':skew==='horizontal'?'h':'balanced');
        } else {
          const wall = c1 + 2 + Math.floor(Math.random()*Math.max(1,c2-c1-3));
          const gap = r1 + 1 + Math.floor(Math.random()*Math.max(1,r2-r1-1));
          for(let i=r1+1;i<r2;i++) if(i!==gap) prev.grid[i][wall]={type:'wall',intensity:1};
          carve(r1,c1,r2,wall,skew==='vertical'?'v':skew==='horizontal'?'h':'balanced'); carve(r1,wall,r2,c2,skew==='vertical'?'v':skew==='horizontal'?'h':'balanced');
        }
      };
      carve(0,0,r-1,c-1,skew==='vertical'?'v':skew==='horizontal'?'h':'balanced');
      prev.grid[prev.start[0]][prev.start[1]]={type:'empty',intensity:1}; prev.exits.forEach(([er,ec])=>prev.grid[er][ec]={type:'empty',intensity:1});
      return prev;
    });
  }
  function addHotspots(){ commit(prev=>{ const r=prev.grid.length,c=prev.grid[0].length; for(let i=Math.floor(r*.35);i<Math.floor(r*.65);i++) for(let j=Math.floor(c*.42);j<Math.floor(c*.58);j++) if(prev.grid[i][j].type==='empty') prev.grid[i][j]={type: Math.random()>.5?'risk':'crowd', intensity: 2+Math.floor(Math.random()*2)}; return prev; }); }

  function addCamera(){
    const camera = makeCamera(scenario.grid.length, scenario.grid[0].length, cameras.length + 1);
    commit(prev=>{
      prev.metadata = {...(prev.metadata || {})};
      const current = prev.metadata.vision_input || {};
      prev.metadata.vision_input = {...current, cameras: [...(current.cameras || []), camera]};
      return prev;
    }, false);
    setActiveCameraId(camera.id);
    setActiveTab('vision');
    setNotice(`${camera.name} added. Click grid cells to edit coverage.`);
  }

  function removeCamera(cameraId){
    const camera = cameras.find(item=>item.id===cameraId);
    commit(prev=>{
      let next = applyVisionCrowdToScenario(prev, {
        cameraId,
        coverageCells: camera?.coverage_cells || [],
        intensity: 0,
      });
      next.metadata = {...(next.metadata || {})};
      const current = next.metadata.vision_input || {};
      const remaining = (current.cameras || []).filter(item=>item.id!==cameraId);
      next.metadata.vision_input = {...current, cameras: remaining};
      return next;
    }, true);
    const remaining = cameras.filter(item=>item.id!==cameraId);
    setActiveCameraId(remaining[0]?.id || null);
  }

  function toggleCameraCoverage(r,c){
    if(!activeCamera) return;
    updateCamera(activeCamera.id, {
      coverage_cells: toggleCoverageCell(activeCamera.coverage_cells || [], r, c)
    }, { record: true });
  }

  function clearCameraCoverage(){
    if(!activeCamera) return;
    updateCamera(activeCamera.id, { coverage_cells: [] }, { record: true });
  }

  function clearVisionCrowd(){
    if(!activeCamera) return;
    commit(prev=>applyVisionCrowdToScenario(prev, {
      cameraId: activeCamera.id,
      coverageCells: activeCamera.coverage_cells || [],
      intensity: 0,
    }), true);
    setNotice(`${activeCamera.name} vision crowd cells cleared.`);
  }

  async function analyzeVisionFile(file){
    if(!activeCamera){
      setError('Add a camera coverage label before uploading media.');
      return;
    }
    const coverageCells = activeCamera.coverage_cells || [];
    const coverageArea = coverageAreaM2(coverageCells, activeCamera.cell_area_m2);
    if(!coverageCells.length || !coverageArea){
      setError('Select at least one coverage cell and set a positive cell area before detection.');
      return;
    }
    setVisionBusy(true); setError(''); setNotice('');
    try{
      const detectorResult = await api.detectCrowd(file);
      const density = densityFromPeopleCount(detectorResult.people_count, coverageCells, activeCamera.cell_area_m2);
      const crowd = densityToCrowdLevel(density);
      const affectedCells = coverageCells.filter(([r,c])=>!['wall','blocked','risk'].includes(scenario.grid[r]?.[c]?.type)).length;
      const analysis = {
        ...detectorResult,
        camera_id: activeCamera.id,
        camera_name: activeCamera.name,
        source_type: activeCamera.source_type,
        coverage_cell_count: coverageCells.length,
        affected_cell_count: affectedCells,
        coverage_area_m2: coverageArea,
        coverage_percent: coveragePercent(coverageCells, scenario.grid),
        density,
        crowd_level: crowd.level,
        crowd_intensity: crowd.intensity,
        analyzed_at: new Date().toISOString(),
      };
      setScenario(prev=>{
        pushHistory(prev);
        let next = applyVisionCrowdToScenario(prev, {
          cameraId: activeCamera.id,
          coverageCells,
          intensity: crowd.intensity,
        });
        next.metadata = {...(next.metadata || {})};
        const current = next.metadata.vision_input || {};
        next.metadata.vision_input = {
          ...current,
          last_analysis: analysis,
          cameras: (current.cameras || []).map(camera=>camera.id===activeCamera.id ? {...camera, last_analysis: analysis} : camera),
        };
        return next;
      });
      setResults([]);
      setNotice(`${detectorResult.people_count} person(s) detected. ${activeCamera.name} marked ${crowd.level} crowd (${density} persons/m²).`);
    } catch(err){
      setError(`Crowd detection failed: ${err.message || err}`);
    } finally {
      setVisionBusy(false);
    }
  }

  async function handleVisionUpload(e){
    const file = e.target.files?.[0];
    e.target.value = '';
    if(!file) return;
    await analyzeVisionFile(file);
  }

  async function handleVisionSample(sample){
    try{
      setVisionBusy(true); setError(''); setNotice(`Loading ${sample.label.toLowerCase()}...`);
      const res = await fetch(sample.url);
      if(!res.ok) throw new Error(`Could not load sample media (${res.status})`);
      const blob = await res.blob();
      const file = new File([blob], sample.fileName, { type: sample.mime });
      setVisionBusy(false);
      await analyzeVisionFile(file);
    } catch(err){
      setVisionBusy(false);
      setError(`Sample media failed: ${err.message || err}`);
    }
  }

  async function renderPdfBytes(fileName, bytes, pageNumber=1){
    setFloorBusy(true); setError(''); setNotice('');
    try{
      const task = pdfjsLib.getDocument({ data: new Uint8Array(bytes.slice(0)) });
      const pdf = await task.promise;
      const safePage = Math.min(Math.max(Number(pageNumber)||1, 1), pdf.numPages);
      const page = await pdf.getPage(safePage);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(2, Math.max(1, 1200 / baseViewport.width));
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvasContext: context, viewport }).promise;
      const dataUrl = canvas.toDataURL('image/png');
      const dims = await imageDimensions(dataUrl);
      patchFloorPlan({
        source_type: 'pdf',
        name: fileName,
        rendered_image_data_url: dataUrl,
        pdf_page: safePage,
        pdf_page_count: pdf.numPages,
        opacity: floorPlan?.opacity ?? 0.55,
        fit_mode: floorPlan?.fit_mode ?? 'contain',
        rendered_width: dims.width,
        rendered_height: dims.height
      }, { clear: true, record: true });
      await pdf.destroy();
      setActiveTab('floor');
      setNotice(`Rendered ${fileName}, page ${safePage} of ${pdf.numPages}.`);
    } catch(err){
      setError(`PDF render failed: ${err.message || err}`);
    } finally {
      setFloorBusy(false);
    }
  }

  async function loadFloorImage(name, dataUrl, extra={}){
    const dims = await imageDimensions(dataUrl);
    patchFloorPlan({
      source_type: extra.source_type || 'image',
      name,
      rendered_image_data_url: dataUrl,
      pdf_page: extra.pdf_page,
      pdf_page_count: extra.pdf_page_count,
      source_url: extra.source_url,
      opacity: floorPlan?.opacity ?? 0.55,
      fit_mode: floorPlan?.fit_mode ?? 'contain',
      rendered_width: dims.width,
      rendered_height: dims.height
    }, { clear: true, record: true });
    setActiveTab('floor');
    setNotice(`Loaded floor plan: ${name}.`);
  }

  async function handleFloorPlanUpload(e){
    const file = e.target.files?.[0];
    e.target.value = '';
    if(!file) return;
    setError(''); setNotice('');
    if(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')){
      const bytes = await file.arrayBuffer();
      setActivePdf({ name: file.name, bytes });
      await renderPdfBytes(file.name, bytes, 1);
      return;
    }
    if(!file.type.startsWith('image/')){
      setError('Please upload a PNG, JPG, or PDF floor plan.');
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setActivePdf(null);
    await loadFloorImage(file.name, dataUrl);
  }

  async function loadSampleFloorPlan(){
    setFloorBusy(true); setError(''); setNotice('');
    try{
      const res = await fetch(sampleFloorPlanUrl);
      if(!res.ok) throw new Error(`Could not load sample (${res.status})`);
      const dataUrl = await blobToDataUrl(await res.blob());
      setActivePdf(null);
      await loadFloorImage('sample_floorplan_wikimedia.jpg', dataUrl, { source_url: sampleFloorPlanSource });
    } catch(err) {
      setError(`Sample floor plan failed to load: ${err.message || err}`);
    } finally {
      setFloorBusy(false);
    }
  }

  async function changePdfPage(pageNumber){
    if(!activePdf?.bytes){
      setError('Re-upload the PDF to render another page.');
      return;
    }
    await renderPdfBytes(activePdf.name, activePdf.bytes, pageNumber);
  }

  function resetFloorPlanFit(){
    if(!floorPlan) return;
    patchFloorPlan({ opacity: 0.55, fit_mode: 'contain' }, { clear: false, record: false });
  }

  function clearFloorPlan(){
    commit(prev=>{
      prev.metadata = {...(prev.metadata || {})};
      delete prev.metadata.floor_plan;
      return prev;
    }, false);
    setActivePdf(null);
    setNotice('Floor plan overlay cleared; traced grid cells remain.');
  }

  async function runSelected(){ const names=algorithms.filter(a=>selected[a]); if(!names.length) return; const validation=validateScenario(scenario); if(validation){ setError(validation); return; } setLoading(true); setError(''); setNotice(''); try{ const out=await api.compareSelected(scenario,names); setResults(out); setVisible(v=>({...v,...Object.fromEntries(out.map(r=>[r.algorithm,true]))})); } catch(e){ setError(String(e.message||e)); } finally{ setLoading(false); } }
  async function runAll(){ const validation=validateScenario(scenario); if(validation){ setError(validation); return; } setSelected(Object.fromEntries(algorithms.map(a=>[a,true]))); setLoading(true); setError(''); setNotice(''); try{ setResults(await api.compare(scenario)); } catch(e){ setError(String(e.message||e)); } finally{ setLoading(false); } }
  function exportResults(){ try{ const csv=buildResultsCsv(scenario,results); const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${scenario.name.replaceAll(' ','_')}_results.csv`; a.click(); URL.revokeObjectURL(url); setNotice('Results CSV downloaded.'); } catch(e){ setError(String(e.message||e)); } }
  function loadScenario(idx){ const s=scenarios[idx]; if(s){ pushHistory(scenario); setScenario(s); setRows(s.grid.length); setCols(s.grid[0].length); setResults([]); setActiveTab(tabForScenario(s)); setActivePdf(null); setActiveCameraId(s.metadata?.vision_input?.cameras?.[0]?.id || null); } }
  function exportScenario(){ const blob=new Blob([JSON.stringify(scenario,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${scenario.name.replaceAll(' ','_')}.json`; a.click(); }
  function importScenario(e){ const f=e.target.files[0]; if(!f) return; f.text().then(t=>{ try{ const s=JSON.parse(t); if(!s.grid||!s.start||!s.exits) throw new Error('Scenario JSON is missing grid/start/exits.'); pushHistory(scenario); setScenario(s); setRows(s.grid.length); setCols(s.grid[0].length); setResults([]); setActiveTab(tabForScenario(s)); setActivePdf(null); setActiveCameraId(s.metadata?.vision_input?.cameras?.[0]?.id || null); setError(''); setNotice('Scenario JSON imported.'); } catch(err){ setError(`Import failed: ${err.message}`); } }); }
  function toggleSort(k){ setSort(s=>s.key===k?{key:k,dir:s.dir==='asc'?'desc':'asc'}:{key:k,dir:higherIsBetter.has(k)?'desc':'asc'}); }

  return <div className="app">
    <aside>
      <h1>CBCD Phase 1</h1><p>Risk-aware indoor navigation dashboard</p>
      <button className="primary" onClick={runSelected} disabled={loading}>{loading?'Running...':'Run selected'}</button><button onClick={runAll} disabled={loading}>Run all</button><button onClick={()=>setReplayKey(k=>k+1)}>Replay paths</button>
      {error && <div className="error" role="alert">{error}</div>}
      {notice && <div className="notice" role="status">{notice}</div>}
      <section><h2>Algorithms</h2>{algorithms.map(a=><label className="check" key={a}><input type="checkbox" checked={selected[a]} onChange={e=>setSelected({...selected,[a]:e.target.checked})}/>{label(a)}</label>)}</section>
      <section><h2>Route overlays</h2><div className="routeFilters"><button className={routeFilter==='all'?'active':''} onClick={()=>setRouteFilter('all')}>All</button>{algorithms.map(a=><button key={a} className={routeFilter===a?'active':''} onClick={()=>setRouteFilter(a)}><span className="routeKey" style={{background:pathColors[a]}}></span>{label(a)}</button>)}</div><p className="hint">Use these filters when many methods overlap; route cells are highlighted instead of drawing dots inside the box.</p>{algorithms.map(a=><label className="check" key={a}><input type="checkbox" checked={visible[a]} onChange={e=>setVisible({...visible,[a]:e.target.checked})}/><span className="routeKey" style={{background:pathColors[a]}}></span>{label(a)}</label>)}<label>Animation speed <select aria-label="Animation speed" value={speed} onChange={e=>setSpeed(e.target.value)}>{Object.keys(speedMs).map(s=><option key={s}>{s}</option>)}</select></label></section>
      <section><h2>Built-in scenarios</h2><select aria-label="Load built-in scenario" onChange={e=>loadScenario(e.target.value)} defaultValue=""><option value="" disabled>Load scenario</option>{scenarios.map((s,i)=><option key={s.name} value={i}>{s.name}</option>)}</select></section>
      <section><h2>Grid size</h2><div className="inline"><input aria-label="Grid rows" type="number" min="5" max="80" value={rows} onChange={e=>setRows(e.target.value)}/><input aria-label="Grid columns" type="number" min="5" max="80" value={cols} onChange={e=>setCols(e.target.value)}/><button onClick={resizeGrid}>Resize grid</button></div><div className="presetBtns">{[[20,20],[20,30],[30,30],[40,40],[50,50]].map(([r,c])=><button key={`${r}x${c}`} onClick={()=>resizePreset(r,c)}>{r}×{c}</button>)}</div></section>
      <section><h2>Palette</h2><div className="tools">{tools.map((t,i)=><button key={t} className={tool===t?'active':''} onClick={()=>setTool(t)}><span className={`swatch ${t}`}></span>{i+1}. {toolLabels[t]}</button>)}</div>{(tool==='risk'||tool==='crowd') && <label>Intensity <input type="range" min="1" max="3" value={intensity} onChange={e=>setIntensity(e.target.value)}/> {intensity}</label>}</section>
      <section><h2>Map generators</h2><label>Wall density {Math.round(wallDensity*100)}%<input type="range" min="0.05" max="0.4" step="0.01" value={wallDensity} onChange={e=>setWallDensity(Number(e.target.value))}/></label><button onClick={generateRandom}>Random walls</button><button onClick={()=>generateRecursive('balanced')}>Recursive Division</button><button onClick={()=>generateRecursive('vertical')}>Recursive Vertical</button><button onClick={()=>generateRecursive('horizontal')}>Recursive Horizontal</button><button onClick={generateCorridor}>Risk corridor</button><button onClick={addHotspots}>Add risk/crowd hotspots</button></section>
      <section><h2>Weights</h2>{Object.entries(presets).map(([name,w])=><button key={name} onClick={()=>{commit(prev=>({...prev, weights:w}));}}>{name}</button>)}{Object.keys(scenario.weights).map(k=><label key={k}>{k}: {scenario.weights[k]}<input type="range" min="0" max="12" step="0.5" value={scenario.weights[k]} onChange={e=>commit(prev=>({...prev, weights:{...prev.weights,[k]:Number(e.target.value)}}))}/></label>)}</section>
      <section><h2>Scenario I/O</h2><button onClick={exportScenario}>Export JSON</button><label className="fileLabel">Import JSON <input aria-label="Import scenario JSON" type="file" accept="application/json" onChange={importScenario}/></label><button onClick={clearBoard}>Clear board</button><button onClick={clearWalls}>Clear walls/blocked</button><button onClick={clearResults}>Clear results</button><button onClick={undo} disabled={!history.length}>Undo</button><button onClick={redo} disabled={!future.length}>Redo</button>{results.length>0&&<button onClick={exportResults}>Download results CSV</button>}</section>
      <p className="hint">Shortcuts: 1–7 tools, R run selected, C clear results, Cmd/Ctrl+Z undo, Shift+Cmd/Ctrl+Z redo.</p>
    </aside>
    <main ref={mainRef}>
      <header className="topHeader"><h2>{scenario.name}</h2></header>
      <nav className="tabs" aria-label="Prototype workspace tabs">
        <button className={activeTab==='builder'?'active':''} onClick={()=>setActiveTab('builder')}>Scenario Builder</button>
        <button className={activeTab==='floor'?'active':''} onClick={()=>setActiveTab('floor')}>Floor Plan Planning</button>
        <button className={activeTab==='vision'?'active':''} onClick={()=>setActiveTab('vision')}>Camera Vision</button>
      </nav>
      {activeTab === 'builder' ? (
        <ScenarioWorkspace scenario={scenario} paint={paint} beginCell={beginCell} enterCell={enterCell} endDrag={endDrag} pathMap={pathMap} mouseDown={mouseDown}/>
      ) : activeTab === 'floor' ? (
        <FloorPlanWorkspace
          scenario={scenario}
          floorPlan={floorPlan}
          paint={paint}
          beginCell={beginCell}
          enterCell={enterCell}
          endDrag={endDrag}
          pathMap={pathMap}
          mouseDown={mouseDown}
          onUpload={handleFloorPlanUpload}
          onLoadSample={loadSampleFloorPlan}
          onClear={clearFloorPlan}
          onReset={resetFloorPlanFit}
          onPatch={patchFloorPlan}
          activePdf={activePdf}
          onPdfPage={changePdfPage}
          floorBusy={floorBusy}
          runSelected={runSelected}
          runAll={runAll}
          loading={loading}
        />
      ) : (
        <VisionWorkspace
          scenario={scenario}
          floorPlan={floorPlan}
          cameras={cameras}
          activeCamera={activeCamera}
          activeCameraId={activeCameraId}
          setActiveCameraId={setActiveCameraId}
          addCamera={addCamera}
          removeCamera={removeCamera}
          updateCamera={updateCamera}
          toggleCoverage={toggleCameraCoverage}
          clearCoverage={clearCameraCoverage}
          clearVisionCrowd={clearVisionCrowd}
          onUpload={handleVisionUpload}
          onSample={handleVisionSample}
          visionBusy={visionBusy}
          runSelected={runSelected}
          runAll={runAll}
          loading={loading}
        />
      )}
      <Comparison results={sortedResults} winner={winner} bestByMetric={bestByMetric} weights={scenario.weights} sort={sort} toggleSort={toggleSort}/>
    </main>
  </div>
}

function ScenarioWorkspace(props){
  return <>
    <Legend />
    <Grid {...props} />
  </>;
}

function FloorPlanWorkspace({scenario, floorPlan, paint, beginCell, enterCell, endDrag, pathMap, mouseDown, onUpload, onLoadSample, onClear, onReset, onPatch, activePdf, onPdfPage, floorBusy, runSelected, runAll, loading}){
  return <section className="floorPlanPanel">
    <div className="floorControls">
      <div>
        <h2>Floor Plan Planning</h2>
        <p>Upload a plan, align the grid visually, trace walls and risk/crowd zones manually, then run the same route algorithms.</p>
      </div>
      <div className="floorActions">
        <label className="uploadButton">Upload floor plan
          <input type="file" accept="image/png,image/jpeg,application/pdf,.pdf" onChange={onUpload} />
        </label>
        <button onClick={onLoadSample} disabled={floorBusy}>Load sample plan</button>
        <button onClick={onReset} disabled={!floorPlan}>Reset fit</button>
        <button onClick={onClear} disabled={!floorPlan}>Clear floor plan</button>
        <button className="primaryLight" onClick={runSelected} disabled={loading}>Run selected</button>
        <button onClick={runAll} disabled={loading}>Run all</button>
      </div>
    </div>
    {floorPlan ? <div className="floorMeta">
      <span><b>Source:</b> {floorPlan.name}</span>
      <span><b>Type:</b> {floorPlan.source_type}</span>
      {floorPlan.rendered_width && <span><b>Rendered:</b> {floorPlan.rendered_width}×{floorPlan.rendered_height}</span>}
      {floorPlan.source_url && <a href={floorPlan.source_url} target="_blank" rel="noreferrer">Wikimedia source</a>}
    </div> : <div className="emptyPanel compact">No floor plan loaded yet. Use Upload floor plan or Load sample plan, then trace the navigable grid on top.</div>}
    {floorPlan && <div className="floorSettings">
      <label>Overlay opacity {Math.round((floorPlan.opacity ?? 0.55) * 100)}%
        <input type="range" min="0.1" max="1" step="0.05" value={floorPlan.opacity ?? 0.55} onChange={e=>onPatch({opacity:Number(e.target.value)}, {clear:false, record:false})}/>
      </label>
      <label>Fit mode
        <select value={floorPlan.fit_mode || 'contain'} onChange={e=>onPatch({fit_mode:e.target.value}, {clear:false, record:false})}>
          <option value="contain">Contain</option>
          <option value="cover">Cover</option>
          <option value="fill">Stretch</option>
        </select>
      </label>
      {floorPlan.source_type === 'pdf' && <label>PDF page
        <input type="number" min="1" max={floorPlan.pdf_page_count || 1} value={floorPlan.pdf_page || 1} onChange={e=>onPdfPage(Number(e.target.value))} disabled={!activePdf?.bytes || floorBusy}/>
        <span className="hint"> of {floorPlan.pdf_page_count || 1}</span>
      </label>}
    </div>}
    <Legend />
    <Grid scenario={scenario} paint={paint} beginCell={beginCell} enterCell={enterCell} endDrag={endDrag} pathMap={pathMap} mouseDown={mouseDown} floorPlan={floorPlan} />
  </section>;
}

function VisionWorkspace({scenario, floorPlan, cameras, activeCamera, activeCameraId, setActiveCameraId, addCamera, removeCamera, updateCamera, toggleCoverage, clearCoverage, clearVisionCrowd, onUpload, onSample, visionBusy, runSelected, runAll, loading}){
  const coverageArea = activeCamera ? coverageAreaM2(activeCamera.coverage_cells || [], activeCamera.cell_area_m2) : 0;
  const coveragePct = activeCamera ? coveragePercent(activeCamera.coverage_cells || [], scenario.grid) : 0;
  const last = activeCamera?.last_analysis;
  return <section className="visionPanel">
    <div className="floorControls">
      <div>
        <h2>Camera Vision Input</h2>
        <p>Label camera coverage on the map, upload an iPhone/CCTV image or short video, then convert detected people into crowd cells for route planning.</p>
      </div>
      <div className="floorActions">
        <button onClick={addCamera}><Plus size={16}/>Add camera</button>
        <button className="primaryLight" onClick={runSelected} disabled={loading}>Run selected</button>
        <button onClick={runAll} disabled={loading}>Run all</button>
      </div>
    </div>
    {!cameras.length && <div className="emptyPanel compact">No camera labels yet. Add a camera, then click grid cells to show the area it covers.</div>}
    <div className="visionLayout">
      <div className="visionSidebar">
        <h3>Cameras</h3>
        <div className="cameraList">
          {cameras.map(camera=><button key={camera.id} className={camera.id===activeCameraId?'active':''} onClick={()=>setActiveCameraId(camera.id)}>
            <span>{camera.name}</span>
            <small>{cameraSourceLabels[camera.source_type] || camera.source_type} • {(camera.coverage_cells || []).length} cells</small>
          </button>)}
        </div>
        {activeCamera && <>
          <label>Camera name
            <input value={activeCamera.name} onChange={e=>updateCamera(activeCamera.id, {name:e.target.value})}/>
          </label>
          <label>Input type
            <select value={activeCamera.source_type} onChange={e=>updateCamera(activeCamera.id, {source_type:e.target.value})}>
              {Object.entries(cameraSourceLabels).map(([value,text])=><option value={value} key={value}>{text}</option>)}
            </select>
          </label>
          <label>Real-world area per grid cell (m²)
            <input type="number" min="0.1" step="0.1" value={activeCamera.cell_area_m2 ?? 1} onChange={e=>updateCamera(activeCamera.id, {cell_area_m2:Number(e.target.value) || 1}, {clear:true})}/>
          </label>
          <div className="visionStats">
            <span><b>Coverage:</b> {(activeCamera.coverage_cells || []).length} cells</span>
            <span><b>Coverage %:</b> {formatNumber(coveragePct)}%</span>
            <span><b>Area:</b> {formatNumber(coverageArea)} m²</span>
            {last && <span><b>Density:</b> {formatNumber(last.density)} people/m²</span>}
            {last && <span><b>Crowd:</b> {last.crowd_level} / intensity {last.crowd_intensity}</span>}
            {last && <span><b>Affected:</b> {last.affected_cell_count} cells</span>}
          </div>
          <div className="sampleMedia">
            {sampleVisionMedia.map(sample=><button key={sample.fileName} onClick={()=>onSample(sample)} disabled={visionBusy}>
              {sample.kind === 'image' ? <ImageIcon size={16}/> : <Video size={16}/>}
              <span>{sample.label}</span>
              <small>{sample.note}</small>
            </button>)}
          </div>
          <label className="uploadButton">Upload iPhone/CCTV photo or video
            <input type="file" accept="image/*,video/*" capture="environment" onChange={onUpload} disabled={visionBusy}/>
          </label>
          <div className="inline">
            <button onClick={clearCoverage}><Eraser size={16}/>Clear coverage</button>
            <button onClick={clearVisionCrowd}><Eraser size={16}/>Clear vision crowd</button>
            <button onClick={()=>removeCamera(activeCamera.id)}><Trash2 size={16}/>Remove camera</button>
          </div>
          {visionBusy && <div className="notice">Running person detector...</div>}
        </>}
      </div>
      <div className="visionMap">
        <h3>Coverage Map</h3>
        <p className="hint">Click cells to define what this camera can see. The detector count is divided by this mapped area to estimate crowd density.</p>
        <CameraCoverageGrid scenario={scenario} floorPlan={floorPlan} activeCamera={activeCamera} onToggle={toggleCoverage}/>
      </div>
    </div>
    {last && <DetectionSummary analysis={last}/>}
  </section>;
}

function CameraCoverageGrid({scenario, floorPlan, activeCamera, onToggle}){
  const rows = scenario.grid.length;
  const cols = scenario.grid[0].length;
  const width = cols * cellSize + Math.max(cols - 1, 0) * cellGap;
  const height = rows * cellSize + Math.max(rows - 1, 0) * cellGap;
  const covered = new Set((activeCamera?.coverage_cells || []).map(key));
  const marker = cameraMarkerCell(activeCamera);
  const markerKey = marker ? key(marker) : '';
  const grid = <div className={`grid coverageGrid ${floorPlan ? 'floorGrid' : ''}`} style={{gridTemplateColumns:`repeat(${cols}, ${cellSize}px)`}}>{scenario.grid.map((row,r)=>row.map((cell,c)=>{
    const isStart=scenario.start[0]===r&&scenario.start[1]===c;
    const isExit=scenario.exits.some(e=>e[0]===r&&e[1]===c);
    const cls = isStart?'start':isExit?'exit':`${cell.type} i${cell.intensity}`;
    const isCovered = covered.has(`${r},${c}`);
    const isMarker = markerKey === `${r},${c}`;
    const label = `${activeCamera?.name || 'Camera'} ${isCovered ? 'covers' : 'does not cover'} row ${r} column ${c}`;
    return <button key={`${r}-${c}`} aria-label={label} title={label} className={`cell ${cls} ${isCovered?'cameraCovered':''} ${isMarker?'cameraPinCell':''} ${cell.source==='vision'?'visionCrowd':''}`} disabled={!activeCamera} onClick={()=>onToggle(r,c)}>{isCovered && <span className="coverageMark"></span>}{isMarker && <span className="cameraPin"><Camera size={12}/></span>}</button>
  }))}</div>;
  if(floorPlan?.rendered_image_data_url){
    return <div className="gridWrap floorGridWrap">
      <div className="floorCanvas" style={{width, height}}>
        <img src={floorPlan.rendered_image_data_url} alt={`${floorPlan.name || 'Uploaded floor plan'} underlay`} style={{opacity: floorPlan.opacity ?? 0.55, objectFit: floorPlan.fit_mode || 'contain'}} />
        {grid}
      </div>
    </div>;
  }
  return <div className="gridWrap">{grid}</div>;
}

function DetectionSummary({analysis}){
  return <div className="detectionSummary">
    <div>
      <h3>Detector Result</h3>
      <div className="visionStats">
        <span><b>File:</b> {analysis.file_name || 'uploaded media'}</span>
        <span><b>Media:</b> {analysis.media_type}</span>
        <span><b>Model:</b> {analysis.model}</span>
        <span><b>People:</b> {analysis.people_count}</span>
        <span><b>Avg confidence:</b> {formatNumber(analysis.confidence_avg)}</span>
        <span><b>Frames:</b> {analysis.frames_analyzed}</span>
        <span><b>Peak frame:</b> {analysis.peak_frame_index ?? '—'}</span>
      </div>
    </div>
    <DetectionPreview analysis={analysis}/>
  </div>;
}

function DetectionPreview({analysis}){
  if(!analysis.preview_image_data_url) return <div className="emptyPanel compact">No preview frame returned by detector.</div>;
  const width = Number(analysis.image_width) || 1;
  const height = Number(analysis.image_height) || 1;
  return <div className="detectionPreview">
    <img src={analysis.preview_image_data_url} alt="Detected people preview"/>
    {(analysis.detections || []).map((det, idx)=><span key={idx} className="detBox" style={{
      left: `${(det.x / width) * 100}%`,
      top: `${(det.y / height) * 100}%`,
      width: `${(det.width / width) * 100}%`,
      height: `${(det.height / height) * 100}%`,
    }}><b>{idx + 1}</b>{formatNumber(det.confidence)}</span>)}
  </div>;
}

function Legend(){ return <div className="legend">{tools.map(t=><span key={t}><span className={`swatch ${t}`}></span>{toolLabels[t]}</span>)}{algorithms.map(a=><span key={a}><span className="routeKey" style={{background:pathColors[a]}}></span>{label(a)}</span>)}</div>; }

function Grid({scenario, paint, beginCell, enterCell, endDrag, pathMap, mouseDown, floorPlan}){
  const rows = scenario.grid.length;
  const cols = scenario.grid[0].length;
  const width = cols * cellSize + Math.max(cols - 1, 0) * cellGap;
  const height = rows * cellSize + Math.max(rows - 1, 0) * cellGap;
  const grid = <div className={`grid ${floorPlan ? 'floorGrid' : ''}`} style={{gridTemplateColumns:`repeat(${cols}, ${cellSize}px)`}}>{scenario.grid.map((row,r)=>row.map((cell,c)=>{
    const isStart=scenario.start[0]===r&&scenario.start[1]===c; const isExit=scenario.exits.some(e=>e[0]===r&&e[1]===c); const paths=pathMap[key([r,c])]||[];
    const cls = isStart?'start':isExit?'exit':`${cell.type} i${cell.intensity}`;
    const routeStyle = paths.length ? {'--route-color': pathColors[paths[0]], '--route-color-2': pathColors[paths[1]||paths[0]]} : undefined;
    return <button key={`${r}-${c}`} aria-label={`Cell row ${r} column ${c} ${isStart?'start':isExit?'exit':cell.type}${paths.length?` route ${paths.map(label).join(', ')}`:''}`} title={`${r},${c} ${isStart?'start':isExit?'exit':cell.type} intensity ${cell.intensity}${paths.length?` • route: ${paths.map(label).join(', ')}`:''}`} style={routeStyle} className={`cell ${cls} ${paths.length?'hasRoute':''} ${paths.length>1?'multiRoute':''}`} onContextMenu={e=>{e.preventDefault();paint(r,c,'empty')}} onMouseDown={()=>beginCell(r,c)} onMouseEnter={()=>mouseDown&&enterCell(r,c)} onMouseUp={endDrag}>{paths.length>1 && <span className="routeBadge">{paths.length}</span>}</button>
  }))}</div>;

  if(floorPlan?.rendered_image_data_url){
    return <div className="gridWrap floorGridWrap" onMouseLeave={endDrag}>
      <div className="floorCanvas" style={{width, height}}>
        <img src={floorPlan.rendered_image_data_url} alt={`${floorPlan.name || 'Uploaded floor plan'} underlay`} style={{opacity: floorPlan.opacity ?? 0.55, objectFit: floorPlan.fit_mode || 'contain'}} />
        {grid}
      </div>
    </div>;
  }
  return <div className="gridWrap" onMouseLeave={endDrag}>{grid}</div>;
}

function Comparison({results,winner,bestByMetric,weights,sort,toggleSort}){
  if(!results.length) return <div className="emptyPanel">No run yet. Use “Run selected” to generate the Phase 1 comparison table.</div>;
  const dijkstra = results.find(r=>r.algorithm==='dijkstra');
  const shortest = results.filter(r=>r.success).sort((a,b)=>a.distance-b.distance)[0];
  const weighted = results.find(r=>r.algorithm==='weighted_astar' && r.success);
  const safer = weighted || winner;
  const contribution = winner ? contributors(winner, weights).filter(([,v])=>v>0) : [];
  const sortMark=k=>sort.key===k?(sort.dir==='asc'?' ↑':' ↓'):'';
  const riskReduction = safer?.risk_reduction_pct;
  return <section className="results"><h2>Algorithm comparison</h2><div className="weightsLine">Weights: α={weights.alpha}, β={weights.beta}, γ={weights.gamma}, δ={weights.delta}, ε={weights.epsilon}; Weighted A* heuristic w={weights.heuristic_weight ?? 1}</div>{winner && <div className="recommend"><b>Recommended:</b> {label(winner.algorithm)} — lowest total cost ({winner.total_cost}), reached exit {formatCell(winner.reached_exit)}.<br/>{shortest && <>Shortest route selected by {label(shortest.algorithm)} at {shortest.distance} steps. </>}{safer && <>Safer route selected by {label(safer.algorithm)} with risk {formatNumber(safer.risk_score)}. </>}{riskReduction !== null && riskReduction !== undefined && <>Risk reduced by {formatMetric('risk_reduction_pct', riskReduction)} vs Dijkstra. </>}<br/>Why: {contribution.length?`top contributors are ${contribution.map(([k,v])=>`${k} ${v.toFixed(1)}`).join(', ')}.`:'route avoided modeled risk/crowd exposure.'}{dijkstra && winner.algorithm !== 'dijkstra' ? ` Baseline Dijkstra total cost was ${dijkstra.total_cost}.` : ''}</div>}<table><thead><tr><th><button className="sortBtn" onClick={()=>toggleSort('algorithm')}>Algorithm{sortMark('algorithm')}</button></th><th>Success</th><th>Reached exit</th>{metricCols.map(m=><th key={m} className="num" aria-sort={sort.key===m?(sort.dir==='asc'?'ascending':'descending'):'none'}><button className="sortBtn" onClick={()=>toggleSort(m)}>{metricLabels[m]}{sortMark(m)}</button></th>)}</tr></thead><tbody>{results.map(r=><tr key={r.algorithm} className={winner?.algorithm===r.algorithm?'win':''} title={r.explanation||''}><td><span className="routeKey" style={{background:pathColors[r.algorithm]}}></span>{label(r.algorithm)}</td><td>{r.success?'✓':'×'}</td><td>{formatCell(r.reached_exit)}</td>{metricCols.map(m=><td key={m} className={`num ${r.success&&Number(r[m])===bestByMetric[m]?'best':''}`}>{formatMetric(m, r[m])}</td>)}</tr>)}</tbody></table></section>
}

function label(a){ return ({dijkstra:'Dijkstra', astar:'A*', weighted_astar:'Weighted A*', qlearning:'Q-learning'})[a]||a; }
function contributors(r,w){ return Object.entries({distance:r.distance*w.alpha,risk:r.risk_score*w.gamma,crowd:r.crowd_score*w.beta}).sort((a,b)=>b[1]-a[1]).slice(0,3); }

class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state={error:null}; }
  static getDerivedStateFromError(error){ return {error}; }
  render(){
    if(this.state.error) return <div className="emptyPanel"><h1>CBCD Phase 1</h1><p>Something went wrong in the dashboard.</p><pre>{String(this.state.error)}</pre></div>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(<ErrorBoundary><App/></ErrorBoundary>);
