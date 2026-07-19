import React from 'react';
import { Cpu, Network, CheckCircle } from 'lucide-react';

export default function AgentCollaborationWeb({ collaborations = [], activeAgent = '' }) {
  // Fixed coordinates for each agent node in our SVGs
  const agents = {
    IntentAgent: { x: 50, y: 150, label: 'Intent Detector', color: '#fb7185' },
    PlannerAgent: { x: 180, y: 150, label: 'Central Planner', color: '#8b5cf6' },
    CampusInfoAgent: { x: 330, y: 50, label: 'Campus Info', color: '#8b5cf6' },
    NavigationAgent: { x: 330, y: 110, label: 'Navigation', color: '#22d3ee' },
    AcademicAgent: { x: 330, y: 170, label: 'Academic Agent', color: '#fbbf24' },
    PlacementAgent: { x: 330, y: 230, label: 'Placement & Career Coach', color: '#34d399' },
    CommunityAgent: { x: 330, y: 290, label: 'Community Agent', color: '#34d399' },
    EventIntelligenceAgent: { x: 480, y: 110, label: 'Event Intelligence', color: '#8b5cf6' },
    NotificationAgent: { x: 480, y: 170, label: 'Notification Agent', color: '#fbbf24' }
  };

  // Helper to check if a link is active in the current collaborations list
  const isLinkActive = (from, to) => {
    return collaborations.some(c => 
      (c.from === from && c.to === to) || (c.from === to && c.to === from)
    );
  };

  // Define lines connecting agents
  const connections = [
    { from: 'IntentAgent', to: 'PlannerAgent' },
    { from: 'PlannerAgent', to: 'CampusInfoAgent' },
    { from: 'PlannerAgent', to: 'NavigationAgent' },
    { from: 'PlannerAgent', to: 'AcademicAgent' },
    { from: 'PlannerAgent', to: 'PlacementAgent' },
    { from: 'PlannerAgent', to: 'CommunityAgent' },
    { from: 'CampusInfoAgent', to: 'EventIntelligenceAgent' },
    { from: 'AcademicAgent', to: 'NotificationAgent' },
    { from: 'CommunityAgent', to: 'NotificationAgent' },
    { from: 'PlacementAgent', to: 'NotificationAgent' }
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Network className="text-purple-400 w-5 h-5 animate-pulse" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Agent Collaboration Mesh</h3>
        </div>
        <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-semibold animate-pulse">
          Agent Registry Active
        </span>
      </div>

      <div className="relative w-full aspect-[5/3] bg-slate-950/90 rounded-xl overflow-hidden border border-white/5">
        <svg viewBox="0 0 550 330" className="w-full h-full">
          {/* Grid background */}
          <rect width="550" height="330" fill="none" />
          
          {/* Draw Connection Links */}
          {connections.map((conn, idx) => {
            const start = agents[conn.from];
            const end = agents[conn.to];
            const active = isLinkActive(conn.from, conn.to);
            
            return (
              <g key={idx}>
                {/* Back static line */}
                <line 
                  x1={start.x} 
                  y1={start.y} 
                  x2={end.x} 
                  y2={end.y} 
                  stroke={active ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)'} 
                  strokeWidth={active ? 3 : 1}
                />
                {/* Glowing flowing lines for active collaborations */}
                {active && (
                  <line 
                    x1={start.x} 
                    y1={start.y} 
                    x2={end.x} 
                    y2={end.y} 
                    stroke="#22d3ee" 
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    className="animate-route-flow"
                  />
                )}
              </g>
            );
          })}

          {/* Draw Agent Nodes */}
          {Object.entries(agents).map(([key, node]) => {
            const isActive = activeAgent === key;
            const isCollated = collaborations.some(c => c.from === key || c.to === key);
            
            return (
              <g key={key}>
                {isActive && (
                  <circle 
                    cx={node.x} 
                    cy={node.y} 
                    r="16" 
                    fill="none" 
                    stroke="#34d399" 
                    strokeWidth="2" 
                    className="animate-ping opacity-75"
                  />
                )}
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r="10" 
                  fill={isActive ? '#34d399' : isCollated ? '#8b5cf6' : '#1e293b'} 
                  stroke={isActive ? '#34d399' : isCollated ? '#c084fc' : 'rgba(255,255,255,0.2)'} 
                  strokeWidth="2"
                  className={isActive ? "animate-pulse" : ""}
                />
                <text 
                  x={node.x} 
                  y={node.y - 15} 
                  fill={isActive ? '#34d399' : isCollated ? '#cbd5e1' : '#94a3b8'} 
                  fontSize="8" 
                  fontWeight={isActive || isCollated ? "bold" : "normal"}
                  textAnchor="middle"
                  className="drop-shadow"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
