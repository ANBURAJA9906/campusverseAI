import React from 'react';
import { Target, Code, Award, Calendar, ArrowRight } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';

export default function PlacementRoadmapWidget({ data }) {
  const { sendChatMessage } = useCampus();

  if (!data) return null;

  const { department, year, roadmapSteps, dsaPlan, suggestedProjects, upcomingDrives } = data;

  return (
    <div className="placement-widget-container animate-fade-in">
      {/* Header */}
      <div className="widget-title-row">
        <div>
          <span className="widget-type-badge font-mono" style={{ background: 'rgba(52, 211, 153,0.1)', color: 'var(--accent-emerald)', border: '1px solid rgba(52, 211, 153,0.15)' }}>
            Placement Agent
          </span>
          <h3 className="widget-heading" style={{ fontSize: '16px', marginTop: '0.25rem' }}>SDE Placement Roadmap</h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="font-display text-white" style={{ fontSize: '13px', fontWeight: 'bold' }}>{department.split(' ')[0]}</p>
          <p className="text-muted" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}>Target: Year {year}</p>
        </div>
      </div>

      {/* Visual Roadmap Flowchart */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Target className="text-cyan w-4 h-4" />
          <h4 className="font-mono text-muted" style={{ fontSize: '10px', fontWeight: 'bold' }}>CAREER MILESTONE TIMELINE</h4>
        </div>
        <div className="milestone-timeline" style={{ borderLeft: '2px solid rgba(255,255,255,0.05)', marginLeft: '0.65rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {roadmapSteps.map((step) => (
            <div key={step.step} style={{ position: 'relative' }}>
              {/* Node indicator */}
              <span style={{ 
                position: 'absolute', 
                left: '-26px', 
                top: '2px', 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: '#05070c', 
                border: '2px solid var(--accent-cyan)', 
                boxShadow: '0 0 6px var(--accent-cyan)' 
              }}></span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p className="font-display text-white" style={{ fontWeight: 'bold', fontSize: '11.5px' }}>{step.title}</p>
                  <span className="font-mono text-cyan" style={{ fontSize: '8px', background: 'rgba(34, 211, 238,0.06)', padding: '1px 4px', borderRadius: '3px' }}>{step.period}</span>
                </div>
                <p className="text-muted" style={{ fontSize: '10px', lineHeight: '1.3' }}>{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DSA & Projects Grid */}
      <div className="coordinators-grid">
        {/* DSA Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Code className="text-purple w-4 h-4" />
            <h4 className="font-mono text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>DSA PRACTICE CHECKLIST</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {dsaPlan.map((dsa, idx) => {
              const pct = Math.round((dsa.completedCount / dsa.targetCount) * 100);
              return (
                <div key={idx} className="book-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '9.5px' }}>
                    <span className="text-white">{dsa.topic}</span>
                    <span className="text-muted">{dsa.completedCount}/{dsa.targetCount}</span>
                  </div>
                  <div className="progress-bar-container" style={{ height: '4px' }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Suggested Resume Projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Target className="text-emerald w-4 h-4" />
            <h4 className="font-mono text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>AI RECOMMENDED PROJECTS</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {suggestedProjects.map((proj, idx) => (
              <div key={idx} className="book-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p className="font-display text-white" style={{ fontWeight: 'bold', fontSize: '10.5px' }}>{proj.title}</p>
                  <span className="font-mono text-amber" style={{ fontSize: '7.5px', background: 'rgba(245,158,11,0.06)', padding: '1px 3px', borderRadius: '3px', fontWeight: 'bold' }}>{proj.difficulty}</span>
                </div>
                <p className="text-muted" style={{ fontSize: '9px', lineHeight: '1.3' }}>{proj.description}</p>
                <span className="font-mono text-cyan" style={{ alignSelf: 'flex-start', fontSize: '7.5px', background: 'rgba(34, 211, 238,0.05)', padding: '1px 3px', borderRadius: '3px' }}>{proj.techStack}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drives list */}
      {upcomingDrives && upcomingDrives.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar className="text-amber w-4 h-4" />
            <h4 className="font-mono text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>RECRUITMENT DRIVES ON-CAMPUS</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {upcomingDrives.map((drive, idx) => (
              <div key={idx} className="book-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="font-display text-white" style={{ fontWeight: 'bold', fontSize: '11.5px' }}>{drive.name}</p>
                  <p className="text-muted" style={{ fontSize: '9px', marginTop: '0.1rem' }}>Location: {drive.location} | Apply by: {drive.deadline.split('T')[0] || drive.deadline}</p>
                </div>
                <button 
                  onClick={() => sendChatMessage(`Register me for the ${drive.name}`)}
                  className="recs-action-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.3rem 0.6rem', fontSize: '9.5px', fontWeight: 'bold' }}
                >
                  <span>Apply</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
