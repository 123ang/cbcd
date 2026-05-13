import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { api } from './api/navigationApi';
import './styles.css';

const tools = ['empty','wall','start','exit','risk','crowd','blocked'];
const toolLabels = {empty:'Empty',wall:'Wall',start:'Start',exit:'Exit',risk:'Risk',crowd:'Crowd',blocked:'Blocked'};
const algorithms = ['dijkstra','astar','weighted_astar','qlearning'];
const presets = {
  Default: { alpha: 1, beta: 3, gamma: 5, delta: 10, epsilon: 2, heuristic_weight: 1 },
  'Distance-heavy': { alpha: 3, beta: 1, gamma: 2, delta: 10, epsilon: 1, heuristic_weight: 1 },
  'Safety-heavy': { alpha: 1, beta: 5, gamma: 8, delta: 12, epsilon: 2, heuristic_weight: 1 }
};
const pathColors = { dijkstra:'#2563eb', astar:'#7c3aed', weighted_astar:'#16a34a', qlearning:'#f59e0b' };
const metricCols = ['distance','risk_score','crowd_score','exit_access_score','train_steps','nodes_expanded','time_ms','total_cost'];
const metricLabels = {distance:'Distance',risk_score:'Risk',crowd_score:'Crowd',exit_access_score:'Exit access',train_steps:'Train steps',nodes_expanded:'Search nodes',time_ms:'Time ms',total_cost:'Total cost'};
const speedMs = { Slow: 180, Normal: 80, Fast: 25, Instant: 0 };

function makeGrid(rows=20, cols=30) { return Array.from({length:rows},()=>Array.from({length:cols},()=>({type:'empty', intensity:1}))); }
function clone(x){ return JSON.parse(JSON.stringify(x)); }
function defaultScenario(){ return { name:'Custom Scenario', grid: makeGrid(), start:[10,3], exits:[[10,26]], weights: presets.Default, metadata:{} }; }
function key(pos){ return `${pos[0]},${pos[1]}`; }
function isDirtyScenario(s){ return s.grid.some(row=>row.some(cell=>cell.type!=='empty')) || s.exits.length!==1 || s.start[0]!==10 || s.start[1]!==3; }


function isPassableCell(cell){ return !['wall','blocked'].includes(cell?.type); }
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
function formatCell(v){ return Array.isArray(v)?`(${v[0]},${v[1]})`:''; }
function formatMetric(value){ return value === undefined || value === null || value === '' ? '—' : value; }

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
  const [mouseDown,setMouseDown]=useState(false);
  const [lastPainted,setLastPainted]=useState(null);
  const [activeDrag,setActiveDrag]=useState(null);
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

  const visibleResults = useMemo(()=>results.filter(r=>visible[r.algorithm] && (routeFilter==='all' || r.algorithm===routeFilter)), [results, visible, routeFilter]);
  const pathMap = useMemo(()=>{
    const m={}; visibleResults.forEach(r=>r.path?.forEach((p,i)=>{ if(i>0 && i<r.path.length-1 && i<=pathProgress) (m[key(p)] ||= []).push(r.algorithm); })); return m;
  },[visibleResults, pathProgress]);
  const winner = useMemo(()=>results.filter(r=>r.success).sort((a,b)=>a.total_cost-b.total_cost)[0], [results]);
  const bestByMetric = useMemo(()=>{
    const out={}; metricCols.forEach(metric=>{ const vals=results.filter(r=>r.success).map(r=>Number(r[metric])); out[metric]=vals.length?Math.min(...vals):null; }); return out;
  },[results]);
  const sortedResults = useMemo(()=>{
    const dir = sort.dir==='asc'?1:-1;
    return [...results].sort((a,b)=>String(sort.key)==='algorithm'?label(a.algorithm).localeCompare(label(b.algorithm))*dir:(Number(a[sort.key])-Number(b[sort.key]))*dir);
  },[results, sort]);

  function pushHistory(prev){ setHistory(h=>[...h.slice(-49), clone(prev)]); setFuture([]); }
  function commit(updater){ setScenario(prev=>{ pushHistory(prev); const next=updater(clone(prev)); setRows(next.grid.length); setCols(next.grid[0].length); return next; }); setResults([]); }
  function undo(){ setHistory(h=>{ if(!h.length) return h; const prev=h[h.length-1]; setFuture(f=>[clone(scenario),...f]); setScenario(prev); setResults([]); return h.slice(0,-1); }); }
  function redo(){ setFuture(f=>{ if(!f.length) return f; const next=f[0]; pushHistory(scenario); setScenario(next); setResults([]); return f.slice(1); }); }
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
  function resizeGrid(){ const r=Math.min(80,Math.max(5,Number(rows)||20)); const c=Math.min(80,Math.max(5,Number(cols)||30)); if(isDirtyScenario(scenario) && !confirm('Resize grid and clear current map?')) return; commit(()=>({...defaultScenario(), grid: makeGrid(r,c), start:[Math.floor(r/2),2], exits:[[Math.floor(r/2),c-3]], name:`${r}×${c} scenario`})); }
  function resizePreset(r,c){ setRows(r); setCols(c); if(!isDirtyScenario(scenario) || confirm('Resize grid and clear current map?')) commit(()=>({...defaultScenario(), grid: makeGrid(r,c), start:[Math.floor(r/2),2], exits:[[Math.floor(r/2),c-3]], name:`${r}×${c} scenario`})); }
  function clearResults(){ setResults([]); }
  function clearWalls(){ commit(prev=>{ prev.grid=prev.grid.map(row=>row.map(cell=>cell.type==='wall'||cell.type==='blocked'?{type:'empty',intensity:1}:cell)); return prev; }); }
  function clearBoard(){ commit(()=>defaultScenario()); setRows(20); setCols(30); }
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
  async function runSelected(){ const names=algorithms.filter(a=>selected[a]); if(!names.length) return; const validation=validateScenario(scenario); if(validation){ setError(validation); return; } setLoading(true); setError(''); try{ const out=await api.compareSelected(scenario,names); setResults(out); setVisible(v=>({...v,...Object.fromEntries(out.map(r=>[r.algorithm,true]))})); } catch(e){ setError(String(e.message||e)); } finally{ setLoading(false); } }
  async function runAll(){ const validation=validateScenario(scenario); if(validation){ setError(validation); return; } setSelected(Object.fromEntries(algorithms.map(a=>[a,true]))); setLoading(true); setError(''); try{ setResults(await api.compare(scenario)); } catch(e){ setError(String(e.message||e)); } finally{ setLoading(false); } }
  async function exportResults(){ try{ await api.exportResults(scenario, results); alert('Results appended to backend/data/experiment_logs.csv'); } catch(e){ setError(String(e.message||e)); } }
  function loadScenario(idx){ const s=scenarios[idx]; if(s){ pushHistory(scenario); setScenario(s); setRows(s.grid.length); setCols(s.grid[0].length); setResults([]); } }
  function exportScenario(){ const blob=new Blob([JSON.stringify(scenario,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${scenario.name.replaceAll(' ','_')}.json`; a.click(); }
  function importScenario(e){ const f=e.target.files[0]; if(!f) return; f.text().then(t=>{ try{ const s=JSON.parse(t); if(!s.grid||!s.start||!s.exits) throw new Error('Scenario JSON is missing grid/start/exits.'); pushHistory(scenario); setScenario(s); setRows(s.grid.length); setCols(s.grid[0].length); setResults([]); setError(''); } catch(err){ setError(`Import failed: ${err.message}`); } }); }
  function toggleSort(k){ setSort(s=>s.key===k?{key:k,dir:s.dir==='asc'?'desc':'asc'}:{key:k,dir:'asc'}); }

  return <div className="app">
    <aside>
      <h1>CBCD Phase 1</h1><p>Risk-aware indoor navigation dashboard</p>
      <button className="primary" onClick={runSelected} disabled={loading}>{loading?'Running...':'Run selected'}</button><button onClick={runAll} disabled={loading}>Run all</button><button onClick={()=>setReplayKey(k=>k+1)}>Replay paths</button>
      {error && <div className="error" role="alert">{error}</div>}
      <section><h2>Algorithms</h2>{algorithms.map(a=><label className="check" key={a}><input type="checkbox" checked={selected[a]} onChange={e=>setSelected({...selected,[a]:e.target.checked})}/>{label(a)}</label>)}</section>
      <section><h2>Route overlays</h2><div className="routeFilters"><button className={routeFilter==='all'?'active':''} onClick={()=>setRouteFilter('all')}>All</button>{algorithms.map(a=><button key={a} className={routeFilter===a?'active':''} onClick={()=>setRouteFilter(a)}><span className="routeKey" style={{background:pathColors[a]}}></span>{label(a)}</button>)}</div><p className="hint">Use these filters when many methods overlap; route cells are highlighted instead of drawing dots inside the box.</p>{algorithms.map(a=><label className="check" key={a}><input type="checkbox" checked={visible[a]} onChange={e=>setVisible({...visible,[a]:e.target.checked})}/><span className="routeKey" style={{background:pathColors[a]}}></span>{label(a)}</label>)}<label>Animation speed <select aria-label="Animation speed" value={speed} onChange={e=>setSpeed(e.target.value)}>{Object.keys(speedMs).map(s=><option key={s}>{s}</option>)}</select></label></section>
      <section><h2>Built-in scenarios</h2><select aria-label="Load built-in scenario" onChange={e=>loadScenario(e.target.value)} defaultValue=""><option value="" disabled>Load scenario</option>{scenarios.map((s,i)=><option key={s.name} value={i}>{s.name}</option>)}</select></section>
      <section><h2>Grid size</h2><div className="inline"><input aria-label="Grid rows" type="number" min="5" max="80" value={rows} onChange={e=>setRows(e.target.value)}/><input aria-label="Grid columns" type="number" min="5" max="80" value={cols} onChange={e=>setCols(e.target.value)}/><button onClick={resizeGrid}>Resize grid</button></div><div className="presetBtns">{[[20,20],[20,30],[30,30],[40,40],[50,50]].map(([r,c])=><button key={`${r}x${c}`} onClick={()=>resizePreset(r,c)}>{r}×{c}</button>)}</div></section>
      <section><h2>Palette</h2><div className="tools">{tools.map((t,i)=><button key={t} className={tool===t?'active':''} onClick={()=>setTool(t)}><span className={`swatch ${t}`}></span>{i+1}. {toolLabels[t]}</button>)}</div>{(tool==='risk'||tool==='crowd') && <label>Intensity <input type="range" min="1" max="3" value={intensity} onChange={e=>setIntensity(e.target.value)}/> {intensity}</label>}</section>
      <section><h2>Map generators</h2><label>Wall density {Math.round(wallDensity*100)}%<input type="range" min="0.05" max="0.4" step="0.01" value={wallDensity} onChange={e=>setWallDensity(Number(e.target.value))}/></label><button onClick={generateRandom}>Random walls</button><button onClick={()=>generateRecursive('balanced')}>Recursive Division</button><button onClick={()=>generateRecursive('vertical')}>Recursive Vertical</button><button onClick={()=>generateRecursive('horizontal')}>Recursive Horizontal</button><button onClick={generateCorridor}>Risk corridor</button><button onClick={addHotspots}>Add risk/crowd hotspots</button></section>
      <section><h2>Weights</h2>{Object.entries(presets).map(([name,w])=><button key={name} onClick={()=>{commit(prev=>({...prev, weights:w}));}}>{name}</button>)}{Object.keys(scenario.weights).map(k=><label key={k}>{k}: {scenario.weights[k]}<input type="range" min="0" max="12" step="0.5" value={scenario.weights[k]} onChange={e=>commit(prev=>({...prev, weights:{...prev.weights,[k]:Number(e.target.value)}}))}/></label>)}</section>
      <section><h2>Scenario I/O</h2><button onClick={exportScenario}>Export JSON</button><label className="fileLabel">Import JSON <input aria-label="Import scenario JSON" type="file" accept="application/json" onChange={importScenario}/></label><button onClick={clearBoard}>Clear board</button><button onClick={clearWalls}>Clear walls/blocked</button><button onClick={clearResults}>Clear results</button><button onClick={undo} disabled={!history.length}>Undo</button><button onClick={redo} disabled={!future.length}>Redo</button>{results.length>0&&<button onClick={exportResults}>Append results CSV</button>}</section>
      <p className="hint">Shortcuts: 1–7 tools, R run selected, C clear results, Cmd/Ctrl+Z undo, Shift+Cmd/Ctrl+Z redo.</p>
    </aside>
    <main>
      <header><h2>{scenario.name}</h2><p>Paint cells, then run comparison. Start is green; exits are red. Right-click erases. Grid cap: 80×80.</p></header>
      <Legend />
      <Grid scenario={scenario} paint={paint} beginCell={beginCell} enterCell={enterCell} endDrag={endDrag} pathMap={pathMap} mouseDown={mouseDown}/>
      <Comparison results={sortedResults} winner={winner} bestByMetric={bestByMetric} weights={scenario.weights} sort={sort} toggleSort={toggleSort}/>
    </main>
  </div>
}

function Legend(){ return <div className="legend">{tools.map(t=><span key={t}><span className={`swatch ${t}`}></span>{toolLabels[t]}</span>)}{algorithms.map(a=><span key={a}><span className="routeKey" style={{background:pathColors[a]}}></span>{label(a)}</span>)}</div>; }
function Grid({scenario, paint, beginCell, enterCell, endDrag, pathMap, mouseDown}){
  return <div className="gridWrap" onMouseLeave={endDrag}><div className="grid" style={{gridTemplateColumns:`repeat(${scenario.grid[0].length}, 22px)`}}>{scenario.grid.map((row,r)=>row.map((cell,c)=>{
    const isStart=scenario.start[0]===r&&scenario.start[1]===c; const isExit=scenario.exits.some(e=>e[0]===r&&e[1]===c); const paths=pathMap[key([r,c])]||[];
    const cls = isStart?'start':isExit?'exit':`${cell.type} i${cell.intensity}`;
    const routeStyle = paths.length ? {'--route-color': pathColors[paths[0]], '--route-color-2': pathColors[paths[1]||paths[0]]} : undefined;
    return <button key={`${r}-${c}`} aria-label={`Cell row ${r} column ${c} ${isStart?'start':isExit?'exit':cell.type}${paths.length?` route ${paths.map(label).join(', ')}`:''}`} title={`${r},${c} ${isStart?'start':isExit?'exit':cell.type} intensity ${cell.intensity}${paths.length?` • route: ${paths.map(label).join(', ')}`:''}`} style={routeStyle} className={`cell ${cls} ${paths.length?'hasRoute':''} ${paths.length>1?'multiRoute':''}`} onContextMenu={e=>{e.preventDefault();paint(r,c,'empty')}} onMouseDown={()=>beginCell(r,c)} onMouseEnter={()=>mouseDown&&enterCell(r,c)} onMouseUp={endDrag}>{paths.length>1 && <span className="routeBadge">{paths.length}</span>}</button>
  }))}</div></div>
}
function Comparison({results,winner,bestByMetric,weights,sort,toggleSort}){
  if(!results.length) return <div className="emptyPanel">No run yet. Use “Run selected” to generate the Phase 1 comparison table.</div>;
  const contribution = winner ? contributors(winner, weights).filter(([,v])=>v>0) : [];
  const sortMark=k=>sort.key===k?(sort.dir==='asc'?' ↑':' ↓'):'';
  return <section className="results"><h2>Algorithm comparison</h2><div className="weightsLine">Weights: α={weights.alpha}, β={weights.beta}, γ={weights.gamma}, δ={weights.delta}, ε={weights.epsilon}; Weighted A* heuristic w={weights.heuristic_weight ?? 1}</div>{winner && <div className="recommend"><b>Recommended:</b> {label(winner.algorithm)} — lowest total cost ({winner.total_cost}), reached exit {formatCell(winner.reached_exit)}.<br/>Why: {contribution.length?`top contributors are ${contribution.map(([k,v])=>`${k} ${v.toFixed(1)}`).join(', ')}.`:'route avoided modeled risk/crowd exposure.'}</div>}<table><thead><tr><th><button className="sortBtn" onClick={()=>toggleSort('algorithm')}>Algorithm{sortMark('algorithm')}</button></th><th>Success</th><th>Reached exit</th>{metricCols.map(m=><th key={m} className="num"><button className="sortBtn" onClick={()=>toggleSort(m)}>{metricLabels[m]}{sortMark(m)}</button></th>)}</tr></thead><tbody>{results.map(r=><tr key={r.algorithm} className={winner?.algorithm===r.algorithm?'win':''} title={r.explanation||''}><td><span className="routeKey" style={{background:pathColors[r.algorithm]}}></span>{label(r.algorithm)}</td><td>{r.success?'✓':'×'}</td><td>{formatCell(r.reached_exit)}</td>{metricCols.map(m=><td key={m} className={`num ${r.success&&Number(r[m])===bestByMetric[m]?'best':''}`}>{formatMetric(r[m])}</td>)}</tr>)}</tbody></table></section>
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
