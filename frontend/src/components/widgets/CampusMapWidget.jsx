import React, { useState } from 'react';
import { Navigation, Clock, MapPin, Landmark, Coffee, HelpCircle, Layers, ZoomIn, ZoomOut, Info, LocateFixed } from 'lucide-react';

export default function CampusMapWidget({ data }) {
  const [filter, setFilter] = useState('all'); // 'all', 'washroom', 'library', 'cafeteria'
  const [zoom, setZoom] = useState(1);
  const [hoverNode, setHoverNode] = useState(null);
  
  if (!data) return null;

  const { source, destination, routePath, distance, duration, steps, nearbyFacilities } = data;

  // Coordinates mapping with building descriptions for the hover tooltips
  const nodes = [
    { name: 'Hostel Block', x: 100, y: 100, icon: Landmark, color: '#4facfe', desc: 'Student accommodation complex housing 420+ graduates.' },
    { name: 'Central Library', x: 400, y: 200, icon: Layers, color: '#8b5cf6', desc: 'Main University library with 50,000+ reference volumes and quiet zones.' },
    { name: 'Main Cafeteria', x: 300, y: 350, icon: Coffee, color: '#f59e0b', desc: 'Central food court with multiple local vendor stalls.' },
    { name: 'CSE Block Entrance', x: 500, y: 180, icon: Landmark, color: '#22d3ee', desc: 'Entrance to the Computer Science & Engineering department.' },
    { name: 'Programming Lab (302)', x: 600, y: 120, icon: MapPin, color: '#34d399', desc: 'CSE 3rd floor lab equipped with high-end GPU workstations.' },
    { name: 'Main Gate Entrance', x: 50, y: 450, icon: Landmark, color: '#3b82f6', desc: 'Primary university portal on Avenue 1.' }
  ];

  const filteredFacilities = nearbyFacilities.filter(f => 
    filter === 'all' || f.type === filter
  );

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 1));

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 animate-fade-in relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Navigation className="text-cyan-400 w-6 h-6 animate-pulse" />
          <h3 className="text-sm font-black text-white font-mono tracking-wider uppercase">Campus Vector Routing</h3>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-3 py-1 text-[10px] font-bold rounded-xl border transition-all ${filter === 'all' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'border-white/5 text-gray-400 hover:text-white'}`}
          >
            All Areas
          </button>
          <button 
            onClick={() => setFilter('washroom')} 
            className={`px-3 py-1 text-[10px] font-bold rounded-xl border transition-all ${filter === 'washroom' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' : 'border-white/5 text-gray-400 hover:text-white'}`}
          >
            Restrooms
          </button>
          <button 
            onClick={() => setFilter('cafeteria')} 
            className={`px-3 py-1 text-[10px] font-bold rounded-xl border transition-all ${filter === 'cafeteria' ? 'bg-amber-500/20 border-amber-400 text-amber-200' : 'border-white/5 text-gray-400 hover:text-white'}`}
          >
            Cafeteria
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full aspect-[8/5] bg-slate-950/95 rounded-2xl overflow-hidden border border-white/5">
        
        {/* Zoom + Recenter Controls */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-col bg-slate-900/90 border border-white/10 p-1.5 rounded-xl space-y-1 backdrop-blur shadow">
          <button onClick={handleZoomIn} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px bg-white/10 mx-0.5" />
          <button onClick={() => setZoom(1)} className="p-1.5 hover:bg-white/10 rounded-lg text-cyan-400 hover:text-cyan-300 transition-colors" title="Recenter">
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>

        {/* Hover Information Overlay */}
        {hoverNode && (
          <div className="absolute top-4 right-4 z-10 bg-slate-900/95 border border-cyan-500/20 px-3.5 py-2.5 rounded-xl max-w-[240px] backdrop-blur shadow-lg animate-fade-in text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-cyan-300">
              <Info className="w-3.5 h-3.5" />
              <span>{hoverNode.name}</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 leading-normal">{hoverNode.desc}</p>
          </div>
        )}

        <svg viewBox="0 0 800 500" className="w-full h-full">
          {/* Grid Background */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#grid)" />

          {/* Group wrapper supporting center-zoom transformation */}
          <g 
            transform={`translate(${400 - 400 * zoom}, ${250 - 250 * zoom}) scale(${zoom})`} 
            style={{ transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {/* Paths connecting roads */}
            <path d="M 50 450 L 300 350 L 400 200 L 100 100" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" strokeLinecap="round" />
            <path d="M 300 350 L 500 180 L 600 120" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" strokeLinecap="round" />

            {/* Glowing Walkway Route */}
            {routePath && (
              <>
                {/* Under-glow blur path */}
                <path 
                  d={routePath} 
                  fill="none" 
                  stroke="rgba(34, 211, 238, 0.3)" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  className="blur-sm"
                />
                {/* Dynamic animated dash line */}
                <path 
                  d={routePath} 
                  fill="none" 
                  stroke="#22d3ee" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                  strokeDasharray="6 6"
                  className="animate-route-flow"
                />
              </>
            )}

            {/* Render Buildings / Nodes */}
            {nodes.map((node, idx) => {
              const isSource = node.name.toLowerCase().includes(source.toLowerCase());
              const isDest = node.name.toLowerCase().includes(destination.toLowerCase());
              
              return (
                <g 
                  key={idx} 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverNode(node)}
                  onMouseLeave={() => setHoverNode(null)}
                >
                  <circle 
                    cx={node.x} 
                    cy={node.y} 
                    r={isSource || isDest ? 12 : 8} 
                    fill={isSource ? '#2563eb' : isDest ? '#34d399' : '#0f172a'} 
                    stroke={node.color} 
                    strokeWidth="2.5"
                    className={isSource || isDest ? "animate-pulse" : ""}
                  />
                  {/* Outer spinning ring for active endpoints */}
                  {(isSource || isDest) && (
                    <circle 
                      cx={node.x} 
                      cy={node.y} 
                      r="18" 
                      fill="none" 
                      stroke={node.color} 
                      strokeWidth="1" 
                      strokeDasharray="3 3"
                      className="animate-spin-slow opacity-80"
                    />
                  )}
                  <text 
                    x={node.x} 
                    y={node.y - (isSource || isDest ? 24 : 18)} 
                    fill={isSource || isDest ? '#fff' : '#94a3b8'} 
                    fontSize="10" 
                    fontWeight={isSource || isDest ? "900" : "bold"}
                    textAnchor="middle"
                    className="drop-shadow transition-colors"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}

            {/* Render Filtered Amenities */}
            {filteredFacilities.map((fac, idx) => (
              <g key={idx} className="animate-fade-in">
                <circle 
                  cx={fac.coords[0]} 
                  cy={fac.coords[1]} 
                  r="6" 
                  fill={fac.type === 'washroom' ? '#34d399' : fac.type === 'cafeteria' ? '#fbbf24' : '#8b5cf6'} 
                  className="animate-pulse"
                />
                <text 
                  x={fac.coords[0]} 
                  y={fac.coords[1] + 16} 
                  fill="#94a3b8" 
                  fontSize="8" 
                  textAnchor="middle"
                  fontWeight="semibold"
                >
                  {fac.name} ({fac.distance})
                </text>
              </g>
            ))}
          </g>
        </svg>

        {/* Floating route indicators */}
        <div className="absolute top-4 left-4 bg-slate-900/90 border border-white/5 px-4 py-3 rounded-xl flex items-center space-x-6 backdrop-blur">
          <div className="flex items-center space-x-2">
            <Clock className="text-cyan-400 w-4 h-4" />
            <div>
              <p className="text-[8px] text-gray-500 uppercase tracking-widest font-mono">Walk Time</p>
              <p className="text-xs font-black text-[#f8fafc]">{duration} Mins</p>
            </div>
          </div>
          <div className="h-6 w-px bg-white/10"></div>
          <div>
            <p className="text-[8px] text-gray-500 uppercase tracking-widest font-mono">Distance</p>
            <p className="text-xs font-black text-[#f8fafc]">{distance} meters</p>
          </div>
        </div>
      </div>

      {/* Directions Card */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2.5">
        <h4 className="text-xs font-bold text-cyan-200 uppercase tracking-wider font-mono">Route Navigation Steps</h4>
        <ol className="space-y-2 text-xs text-gray-300">
          {steps.map((step, idx) => (
            <li key={idx} className="flex items-start space-x-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px] font-mono">
                {idx + 1}
              </span>
              <p className="mt-0.5 leading-relaxed text-[11px] text-gray-200">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
