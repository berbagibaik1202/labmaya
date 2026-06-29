import { useState, useEffect, useRef } from 'react';
import { SimConfig, DataLogEntry, User } from '../types';
import { Play, Pause, RotateCcw, Save, Trash2, Download, Table, LineChart, Cpu, Compass } from 'lucide-react';

interface SimulationEngineProps {
  config: SimConfig;
  onDataRecorded: (logs: DataLogEntry[]) => void;
  currentUser: User;
}

export default function SimulationEngine({ 
  config, 
  onDataRecorded,
  currentUser
}: SimulationEngineProps) {
  // 1. Parameter State (mapped to config parameters)
  const [params, setParams] = useState<{ [key: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    config.parameters.forEach(p => {
      initial[p.id] = p.defaultValue;
    });
    return initial;
  });

  // 2. Playback / Engine State
  const [isPlaying, setIsPlaying] = useState(false);
  const [simTime, setSimTime] = useState(0); // in-sim elapsed seconds
  const [recordedLogs, setRecordedLogs] = useState<DataLogEntry[]>([]);
  const [chartMode, setChartMode] = useState<'x' | 'v' | 'a'>('x');

  // 3. Canvas & Frame Sync references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Reset simulation when config changes
  useEffect(() => {
    const initial: { [key: string]: number } = {};
    config.parameters.forEach(p => {
      initial[p.id] = p.defaultValue;
    });
    setParams(initial);
    setIsPlaying(false);
    setSimTime(0);
    setRecordedLogs([]);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [config]);

  // Handle derived formulas & parameters (Formula Engine)
  const getDerivedOutputs = (time: number) => {
    const outputs: { [key: string]: number } = { t: time };
    
    if (config.id === 'glb') {
      const v = params.v0;
      const x0 = params.x0;
      outputs.v = v;
      outputs.x = x0 + v * time;
      outputs.a = 0;
    } else if (config.id === 'glbb') {
      const v0 = params.v0;
      const a = params.a;
      const x0 = params.x0;
      outputs.v = Math.max(0, v0 + a * time); // don't go backwards
      outputs.x = x0 + v0 * time + 0.5 * a * time * time;
      outputs.a = a;
    } else if (config.id === 'parabola') {
      const v0 = params.v0;
      const thetaRad = (params.angle * Math.PI) / 180;
      const g = params.g;
      const h0 = params.h0;

      const v0x = v0 * Math.cos(thetaRad);
      const v0y = v0 * Math.sin(thetaRad);

      outputs.vx = v0x;
      outputs.vy = v0y - g * time;
      outputs.x = v0x * time;
      outputs.y = Math.max(0, h0 + v0y * time - 0.5 * g * time * time);
    } else if (config.id === 'newton2') {
      const F = params.F;
      const m = params.m;
      const mu = params.mu;
      const g = 9.8;

      const NormalForce = m * g;
      const fk = mu * NormalForce;
      
      let netForce = F - fk;
      if (netForce < 0) netForce = 0; // cannot pull backwards via friction

      const a = netForce / m;
      outputs.fk = fk;
      outputs.Fnet = netForce;
      outputs.a = a;
      outputs.v = a * time;
      outputs.x = 0.5 * a * time * time;
    }

    return outputs;
  };

  const currentOutputs = getDerivedOutputs(simTime);

  // 4. Record current state to the data uploader table
  const handleRecordData = () => {
    const newEntry: DataLogEntry = {
      id: `log_${Date.now()}`,
      timestamp: Number(simTime.toFixed(2)),
      values: {}
    };

    config.outputs.forEach(out => {
      newEntry.values[out.id] = Number(currentOutputs[out.id].toFixed(2));
    });

    const updated = [...recordedLogs, newEntry];
    setRecordedLogs(updated);
    onDataRecorded(updated);
  };

  const handleClearLogs = () => {
    setRecordedLogs([]);
    onDataRecorded([]);
  };

  // Export Recorded Logs to CSV
  const handleExportCSV = () => {
    if (recordedLogs.length === 0) return;
    
    // Header
    const headers = config.outputs.map(o => o.label).join(',');
    // Rows
    const rows = recordedLogs.map(log => {
      return config.outputs.map(o => log.values[o.id]).join(',');
    }).join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_lab_maya_${config.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 5. Canvas Animation ticks loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localSimTime = simTime;

    const render = () => {
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Grid Background - Sleek holographic dark grid
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Floor Ground - cyber floor with cyan neon laser line
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
      
      // Laser line
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 40);
      ctx.lineTo(canvas.width, canvas.height - 40);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset glow

      // Custom Drawings based on simulation
      if (config.id === 'glb' || config.id === 'glbb') {
        const outputs = getDerivedOutputs(localSimTime);
        const scale = 8; // pixels per meter
        const carX = 50 + (outputs.x * scale) % (canvas.width - 100);
        const carY = canvas.height - 65;

        // Draw Road markings
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, canvas.height - 45, canvas.width, 5);

        // Scale ticks
        ctx.fillStyle = '#64748b';
        ctx.font = '9px monospace';
        for (let i = 0; i < canvas.width; i += 80) {
          const meters = Math.round((i / scale));
          ctx.fillRect(i, canvas.height - 40, 2, 8);
          ctx.fillText(`${meters}m`, i + 4, canvas.height - 25);
        }

        // Render Sports Car Model - Neon glowing futuristic car
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#06b6d4'; // Glowing cyan sports car
        ctx.fillRect(carX, carY, 50, 18); // main body
        ctx.fillStyle = '#0891b2';
        ctx.fillRect(carX + 12, carY - 8, 22, 8); // cabin
        ctx.shadowBlur = 0; // reset
        
        ctx.fillStyle = '#1e293b'; // wheels outer
        ctx.strokeStyle = '#22d3ee'; // wheels glowing rim
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(carX + 12, carY + 18, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(carX + 38, carY + 18, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Arrow force indicator
        if (config.id === 'glbb' && params.a !== 0) {
          ctx.strokeStyle = params.a > 0 ? '#06b6d4' : '#ef4444';
          ctx.shadowColor = params.a > 0 ? '#06b6d4' : '#ef4444';
          ctx.shadowBlur = 6;
          ctx.lineWidth = 3;
          ctx.beginPath();
          const arrowLength = params.a * 15;
          ctx.moveTo(carX + 25, carY - 18);
          ctx.lineTo(carX + 25 + arrowLength, carY - 18);
          ctx.stroke();
          ctx.shadowBlur = 0; // reset
        }
      } 
      else if (config.id === 'parabola') {
        const scale = 15; // pixels per meter
        const h0 = params.h0;
        const angle = params.angle;
        
        // Cannon position
        const cannonX = 40;
        const cannonY = canvas.height - 40 - (h0 * scale);

        // Draw Pedestal - Cyber pillar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cannonX - 12, cannonY, 24, (h0 * scale) + 40);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cannonX - 12, cannonY, 24, (h0 * scale) + 40);

        // Draw Cannon barrel (rotatable)
        ctx.save();
        ctx.translate(cannonX, cannonY);
        ctx.rotate((-angle * Math.PI) / 180);
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.fillRect(0, -7, 42, 14);
        ctx.strokeRect(0, -7, 42, 14);
        ctx.restore();

        // Tracing parabola trail from t=0 up to active localSimTime
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cannonX, cannonY);

        let traceFoundGround = false;
        for (let t = 0; t <= localSimTime; t += 0.05) {
          const out = getDerivedOutputs(t);
          const px = cannonX + out.x * scale;
          const py = canvas.height - 40 - out.y * scale;
          if (py <= canvas.height - 40) {
            ctx.lineTo(px, py);
          } else {
            traceFoundGround = true;
          }
        }
        ctx.stroke();
        ctx.setLineDash([]); // reset

        // Draw Projectile Core
        const activeOut = getDerivedOutputs(localSimTime);
        const projX = cannonX + activeOut.x * scale;
        const projY = canvas.height - 40 - activeOut.y * scale;

        if (projY <= canvas.height - 40) {
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#22d3ee'; // glowing cyan projectile
          ctx.beginPath();
          ctx.arc(projX, projY, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        } else {
          // Cannon ball hit the ground - Draw dynamic impact circle
          ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
          ctx.beginPath();
          ctx.arc(projX, canvas.height - 40, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.arc(projX, canvas.height - 40, 4, 0, Math.PI * 2);
          ctx.fill();

          // Stop playing when ground hit
          setIsPlaying(false);
        }
      }
      else if (config.id === 'newton2') {
        const outputs = getDerivedOutputs(localSimTime);
        const scale = 8;
        const boxSize = 50;
        const boxX = 150 + (outputs.x * scale) % (canvas.width - 250);
        const boxY = canvas.height - 40 - boxSize;

        // Cyber Crate - metallic grey with glowing neon edges
        ctx.fillStyle = '#1e293b'; 
        ctx.fillRect(boxX, boxY, boxSize, boxSize);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(boxX, boxY, boxSize, boxSize);
        
        // Crate details (X lines inside)
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(boxX, boxY);
        ctx.lineTo(boxX + boxSize, boxY + boxSize);
        ctx.moveTo(boxX + boxSize, boxY);
        ctx.lineTo(boxX, boxY + boxSize);
        ctx.stroke();

        // Stickman Pushing Character on Left - Sleek Light Cyan Vector
        const charX = boxX - 35;
        const charY = canvas.height - 40;
        
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 3;
        // Body Line
        ctx.beginPath();
        ctx.moveTo(charX, charY - 20);
        ctx.lineTo(charX - 10, charY - 40);
        ctx.stroke();
        // Head
        ctx.beginPath();
        ctx.arc(charX - 10, charY - 47, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#22d3ee';
        ctx.fill();
        // Legs (Push stance)
        ctx.beginPath();
        ctx.moveTo(charX, charY - 20);
        ctx.lineTo(charX + 5, charY); // front leg
        ctx.moveTo(charX, charY - 20);
        ctx.lineTo(charX - 15, charY); // back leg extension
        ctx.stroke();
        // Arms pushing against box
        ctx.beginPath();
        ctx.moveTo(charX - 7, charY - 35);
        ctx.lineTo(boxX, charY - 30);
        ctx.stroke();

        // Dynamic Force Arrows
        const F = params.F;
        const fk = outputs.fk;

        if (F > 0) {
          // Push Force Arrow (Cyan, points right)
          ctx.strokeStyle = '#06b6d4';
          ctx.fillStyle = '#06b6d4';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 6;
          ctx.lineWidth = 4;
          const arrowLength = Math.min(80, F * 1.5);
          ctx.beginPath();
          ctx.moveTo(boxX + boxSize / 2, boxY - 15);
          ctx.lineTo(boxX + boxSize / 2 + arrowLength, boxY - 15);
          ctx.stroke();
          // Arrow tip
          ctx.beginPath();
          ctx.moveTo(boxX + boxSize / 2 + arrowLength, boxY - 15);
          ctx.lineTo(boxX + boxSize / 2 + arrowLength - 8, boxY - 20);
          ctx.lineTo(boxX + boxSize / 2 + arrowLength - 8, boxY - 10);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
          
          ctx.fillStyle = '#22d3ee';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(`F = ${F}N`, boxX + boxSize / 2 + 5, boxY - 25);
        }

        if (fk > 0 && outputs.x > 0.01) {
          // Friction Force Arrow (Red, points left)
          ctx.strokeStyle = '#f43f5e';
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 6;
          ctx.lineWidth = 3;
          const frictionLength = Math.min(60, fk * 1.5);
          ctx.beginPath();
          ctx.moveTo(boxX + boxSize / 2, boxY + boxSize + 10);
          ctx.lineTo(boxX + boxSize / 2 - frictionLength, boxY + boxSize + 10);
          ctx.stroke();
          // Arrow tip
          ctx.beginPath();
          ctx.moveTo(boxX + boxSize / 2 - frictionLength, boxY + boxSize + 10);
          ctx.lineTo(boxX + boxSize / 2 - frictionLength + 6, boxY + boxSize + 6);
          ctx.lineTo(boxX + boxSize / 2 - frictionLength + 6, boxY + boxSize + 14);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
          
          ctx.fillStyle = '#f43f5e';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(`fk = ${fk.toFixed(1)}N`, boxX + boxSize / 2 - frictionLength - 35, boxY + boxSize + 25);
        }
      }
    };

    // Frame Sync Loop
    const tick = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const elapsedSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        localSimTime += elapsedSec;
        setSimTime(localSimTime);
      }

      render();
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, params, config]);

  // Restart / Reset Engine function
  const handleResetSim = () => {
    setIsPlaying(false);
    setSimTime(0);
    lastTimeRef.current = null;
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      lastTimeRef.current = null;
    }
    setIsPlaying(!isPlaying);
  };

  // Pre-calculate line chart coordinate arrays from recorded uploader logs
  const getSgCoordinates = () => {
    if (recordedLogs.length < 2) return '';
    const chartYVar = chartMode; // 'x', 'v' or 'a'

    // Width & height of internal SVG viewport: 360 x 140
    const svgW = 400;
    const svgH = 150;
    const pad = 25;

    const xMax = Math.max(...recordedLogs.map(l => l.timestamp), 1);
    const yMax = Math.max(...recordedLogs.map(l => l.values[chartYVar]), 1);

    return recordedLogs.map((log) => {
      const cx = pad + (log.timestamp / xMax) * (svgW - pad * 2);
      const cy = (svgH - pad) - (log.values[chartYVar] / yMax) * (svgH - pad * 2);
      return `${cx},${cy}`;
    }).join(' ');
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 backdrop-blur-xl" id="sim_engine_container">
      {/* Simulation Screen / Stage Area */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2 text-white font-sans font-bold text-sm">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Virtual Sandbox (2D Canvas)</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="font-mono text-xs font-bold bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
              WAKTU SIM: {simTime.toFixed(2)}s
            </span>
          </div>
        </div>

        {/* 2D Canvas Viewport */}
        <div className="bg-slate-950 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center relative shadow-2xl">
          <canvas 
            ref={canvasRef} 
            width={650} 
            height={220}
            className="max-w-full block aspect-[65/22]"
          />
          
          {/* Controls overlay buttons inside stage */}
          <div className="absolute bottom-3 right-3 flex items-center space-x-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <button 
              id="sim_play_pause_btn"
              onClick={handleTogglePlay}
              className={`p-1.5 rounded-lg text-black cursor-pointer transition-all ${
                isPlaying 
                  ? 'bg-amber-400 hover:bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.4)]' 
                  : 'bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.4)]'
              }`}
              title={isPlaying ? 'Pause' : 'Mulai'}
            >
              {isPlaying ? <Pause className="w-4 h-4 font-bold" /> : <Play className="w-4 h-4 font-bold" />}
            </button>
            <button 
              id="sim_reset_btn"
              onClick={handleResetSim}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white cursor-pointer transition-colors border border-white/5"
              title="Reset Posisi"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Left - Sliders Control, Right - Formula Logger & Outputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sliders panel */}
        <div className="bg-white/[0.01] rounded-2xl p-5 border border-white/5">
          <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">
            Panel Kontrol Parameter
          </h4>

          <div className="space-y-4">
            {config.parameters.map(param => (
              <div key={param.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-sans font-bold text-slate-200">{param.label}</span>
                  <span className="font-mono font-bold bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-md text-cyan-400">
                    {params[param.id]} {param.unit}
                  </span>
                </div>
                <input 
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={params[param.id]}
                  onChange={(e) => setParams({ ...params, [param.id]: Number(e.target.value) })}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="block font-sans text-[10px] text-slate-500">{param.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Outputs & Formula Engine Calculator */}
        <div className="bg-white/[0.01] rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
          <div>
            <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">
              Derived Outputs (Formula Engine)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {config.outputs.map(out => (
                <div key={out.id} className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="block font-sans text-[10px] text-slate-400 leading-none">{out.label}</span>
                    <span className="block font-mono font-bold text-sm text-slate-100 mt-1.5">
                      {currentOutputs[out.id] !== undefined ? currentOutputs[out.id].toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <span className="font-sans text-[10px] font-bold text-cyan-400 uppercase">{out.unit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-white/5 pt-3">
            <span className="block font-sans text-[10px] font-bold tracking-wide uppercase text-slate-400">Rumus Aktif:</span>
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 mt-1.5 text-[10px] font-mono text-slate-300 space-y-1">
              {Object.entries(config.formulas).map(([name, f]) => (
                <div key={name} className="flex justify-between">
                  <span className="font-sans text-slate-500">{name}:</span>
                  <span className="font-semibold text-cyan-400">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Real-Time Data Logger Board & Chart Engine Split */}
      <div className="border-t border-white/5 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
          <div>
            <h3 className="font-sans font-bold text-sm text-white flex items-center gap-1.5">
              <Table className="w-4 h-4 text-cyan-400" /> Data Logger & Grafik Pengamatan
            </h3>
            <span className="font-sans text-[10px] text-slate-400">Catat koordinat numerik dari simulasi untuk dianalisis dalam LKS Digital.</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button 
              id="sim_record_data_btn"
              onClick={handleRecordData}
              className="flex-1 sm:flex-none bg-cyan-500 hover:bg-cyan-400 text-black font-sans text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center justify-center space-x-1 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Rekam Baris Data</span>
            </button>
            <button 
              onClick={handleClearLogs}
              disabled={recordedLogs.length === 0}
              className="p-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-30"
              title="Bersihkan Tabel"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {recordedLogs.length === 0 ? (
          <div className="bg-white/[0.01] border border-white/5 border-dashed rounded-2xl p-8 text-center text-xs text-slate-400 font-sans italic">
            Belum ada baris data direkam. Jalankan simulasi lalu klik "Rekam Baris Data" untuk mengisi tabel.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Table (Left 3 spans) */}
            <div className="lg:col-span-3 border border-white/5 rounded-2xl overflow-hidden max-h-56 overflow-y-auto bg-black/10">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead className="bg-white/5 border-b border-white/10 sticky top-0">
                  <tr>
                    <th className="p-3 font-bold text-slate-400">Percobaan</th>
                    {config.outputs.map(out => (
                      <th key={out.id} className="p-3 font-bold text-slate-400 uppercase">{out.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recordedLogs.map((log, index) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-bold text-cyan-400">#{index + 1}</td>
                      {config.outputs.map(out => (
                        <td key={out.id} className="p-3 font-mono font-medium text-slate-200">
                          {log.values[out.id]?.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SVG Interactive Chart (Right 2 spans) */}
            <div className="lg:col-span-2 bg-white/[0.01] p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-sans font-bold text-[10px] uppercase text-slate-400 flex items-center gap-1">
                    <LineChart className="w-3.5 h-3.5 text-cyan-400" /> Kurva Real-time
                  </span>
                  
                  {/* Select variable to plot vs Time */}
                  <div className="flex space-x-1.5 bg-black/40 p-0.5 rounded-lg border border-white/10">
                    {['x', 'v', 'a'].map(m => (
                      <button
                        key={m}
                        onClick={() => setChartMode(m as 'x' | 'v' | 'a')}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${
                          chartMode === m 
                            ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.4)]' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plot SVG Container */}
                <div className="bg-black/30 border border-white/10 rounded-xl overflow-hidden h-36 flex items-center justify-center">
                  {recordedLogs.length < 2 ? (
                    <span className="font-sans text-[10px] text-slate-500 italic">Butuh minimal 2 baris data untuk menggambar grafik.</span>
                  ) : (
                    <svg className="w-full h-full p-2" viewBox="0 0 400 150">
                      {/* Grid Horizontal axis */}
                      <line x1="25" y1="125" x2="375" y2="125" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
                      {/* Grid Vertical axis */}
                      <line x1="25" y1="125" x2="25" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />

                      {/* Render Plot Line */}
                      <polyline
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                        points={getSgCoordinates()}
                      />

                      {/* Render dots for each point */}
                      {recordedLogs.map((log, i) => {
                        const xMax = Math.max(...recordedLogs.map(l => l.timestamp), 1);
                        const yMax = Math.max(...recordedLogs.map(l => l.values[chartMode]), 1);
                        const cx = 25 + (log.timestamp / xMax) * 350;
                        const cy = 125 - (log.values[chartMode] / yMax) * 100;
                        return (
                          <circle
                            key={log.id}
                            cx={cx}
                            cy={cy}
                            r="4.5"
                            fill="#06b6d4"
                            stroke="#05070a"
                            strokeWidth="1.5"
                          />
                        );
                      })}

                      {/* Text markings */}
                      <text x="350" y="140" fill="#64748b" fontSize="8" fontFamily="monospace">WAKTU (t)</text>
                      <text x="5" y="20" fill="#64748b" fontSize="8" fontFamily="monospace" transform="rotate(-90 5 20)">
                        {chartMode === 'x' ? 'POSISI (x)' : chartMode === 'v' ? 'KECEPATAN (v)' : 'PERCEPATAN (a)'}
                      </text>
                    </svg>
                  )}
                </div>
              </div>

              {/* Action downloads */}
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleExportCSV}
                  className="flex-1 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-sans text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor CSV</span>
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
