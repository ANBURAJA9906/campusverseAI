import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Activity, PieChart, RefreshCw } from 'lucide-react';
import { useCampus } from '../context/CampusContext';

export default function AnalyticsPanel() {
  const { backendUrl } = useCampus();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/analytics`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || `Request failed with status ${response.status}`);
      }
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics.');
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Activity className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-gray-400 text-xs font-semibold">Aggregating database analytics...</p>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3 text-center px-6">
        <Activity className="w-10 h-10 text-rose-400" />
        <p className="text-white text-sm font-semibold">Couldn't load analytics</p>
        <p className="text-gray-400 text-xs max-w-sm">{error || 'No data returned from the server.'}</p>
        <button
          onClick={fetchAnalytics}
          className="p-2 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center space-x-1.5 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { metrics, clubPopularity = [], eventParticipation = [], agentUsage = [] } = analyticsData;

  // Custom SVG render parameters for Bar Chart
  const maxMembers = Math.max(...clubPopularity.map(c => c.members)) || 50;
  const barChartWidth = 320;
  const barChartHeight = 180;

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="text-cyan-400 w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold text-white">System Analytics & Platform Metrics</h2>
            <p className="text-xs text-gray-400">Campus registration logs, popular societies, and AI specialized agent load performance metrics.</p>
          </div>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center space-x-1 text-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Active Students</p>
            <p className="text-xl font-black text-white">{metrics.totalStudents}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Society Registrations</p>
            <p className="text-xl font-black text-white">{metrics.activeRegistrations}</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Student Engagement</p>
            <p className="text-xl font-black text-white">{metrics.studentEngagementRate}%</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Average CGPA</p>
            <p className="text-xl font-black text-white">{metrics.averageCgpa} / 10</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Club Popularity SVG Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
            <Users className="text-cyan-400 w-4.5 h-4.5" />
            <span>Popular Student Clubs</span>
          </h3>
          <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 flex items-center justify-center">
            <svg width="100%" height={barChartHeight} viewBox={`0 0 ${barChartWidth} ${barChartHeight}`}>
              {/* Draw bars */}
              {clubPopularity.map((club, idx) => {
                const barHeight = (club.members / maxMembers) * 110;
                const x = 40 + idx * 85;
                const y = barChartHeight - 40 - barHeight;
                return (
                  <g key={idx}>
                    {/* Bar under-glow */}
                    <rect 
                      x={x} 
                      y={y} 
                      width="40" 
                      height={barHeight} 
                      fill="rgba(34, 211, 238, 0.15)" 
                      rx="4"
                    />
                    {/* Main Bar */}
                    <rect 
                      x={x} 
                      y={y} 
                      width="40" 
                      height={barHeight} 
                      fill="url(#barGradient)" 
                      rx="4"
                    />
                    {/* Value */}
                    <text 
                      x={x + 20} 
                      y={y - 8} 
                      fill="#cbd5e1" 
                      fontSize="10" 
                      textAnchor="middle" 
                      fontWeight="bold"
                    >
                      {club.members}
                    </text>
                    {/* Label */}
                    <text 
                      x={x + 20} 
                      y={barChartHeight - 15} 
                      fill="#94a3b8" 
                      fontSize="9" 
                      textAnchor="middle"
                    >
                      {club.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
              
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#4facfe" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Event Participation Chart — real registration counts, computed
            from the actual eventParticipation data returned by the backend
            rather than fixed demo dots. */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
            <Activity className="text-purple-400 w-4.5 h-4.5" />
            <span>Event Registration Leads</span>
          </h3>
          <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 flex items-center justify-center">
            {eventParticipation.length === 0 ? (
              <p className="text-[11px] text-gray-500 py-10">No events registered yet.</p>
            ) : (() => {
              const maxAttendees = Math.max(...eventParticipation.map(e => e.attendees), 1);
              const chartTop = 20;
              const chartBottom = barChartHeight - 40;
              const usableHeight = chartBottom - chartTop;
              const stepX = eventParticipation.length > 1
                ? (barChartWidth - 80) / (eventParticipation.length - 1)
                : 0;
              const points = eventParticipation.map((e, idx) => ({
                x: 40 + idx * stepX,
                y: chartBottom - (e.attendees / maxAttendees) * usableHeight,
                label: e.name,
                val: e.attendees
              }));
              const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
              const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartBottom} L ${points[0].x} ${chartBottom} Z`;

              return (
                <svg width="100%" height={barChartHeight} viewBox={`0 0 ${barChartWidth} ${barChartHeight}`}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(139, 92, 246, 0.4)" />
                      <stop offset="100%" stopColor="rgba(139, 92, 246, 0.0)" />
                    </linearGradient>
                  </defs>

                  <path d={linePath} fill="none" stroke="#8b5cf6" strokeWidth="3" />
                  <path d={areaPath} fill="url(#areaGradient)" />

                  {points.map((dot, idx) => (
                    <g key={idx}>
                      <circle cx={dot.x} cy={dot.y} r="5" fill="#8b5cf6" stroke="#fff" strokeWidth="1.5" />
                      <text x={dot.x} y={dot.y - 8} fill="#cbd5e1" fontSize="9" textAnchor="middle" fontWeight="bold">
                        {dot.val}
                      </text>
                      <text x={dot.x} y={barChartHeight - 15} fill="#94a3b8" fontSize="8" textAnchor="middle">
                        {dot.label.length > 10 ? `${dot.label.slice(0, 9)}…` : dot.label}
                      </text>
                    </g>
                  ))}
                </svg>
              );
            })()}
          </div>
        </div>

        {/* AI Agent Load Circle Donut */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
            <PieChart className="text-emerald-400 w-4.5 h-4.5" />
            <span>AI Specialized Agent Usage</span>
          </h3>
          <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 space-y-3 max-h-[180px] overflow-y-auto pr-1">
            {agentUsage.length === 0 && (
              <p className="text-[11px] text-gray-500 py-6 text-center">No queries logged yet — try the chat console.</p>
            )}
            {agentUsage.map((agent, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: idx % 3 === 0 ? '#22d3ee' : idx % 3 === 1 ? '#8b5cf6' : '#34d399' }}></span>
                  <span className="text-gray-300 font-semibold">{agent.name}</span>
                </div>
                <span className="font-mono text-cyan-400">{agent.queries} requests</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
