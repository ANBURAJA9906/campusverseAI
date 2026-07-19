import React from 'react';
import { Newspaper, Bell, Calendar } from 'lucide-react';

export default function DailyDigestWidget({ data }) {
  if (!data) return null;

  const { announcements, todayEvents } = data;

  return (
    <div className="digest-widget-container animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Newspaper className="text-cyan w-6 h-6 animate-pulse" />
        <h3 className="widget-heading">Daily Campus Digest</h3>
      </div>

      {/* Announcements */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 className="font-mono text-muted" style={{ fontSize: '10px', fontWeight: 'bold' }}>OFFICIAL NOTICES & DIGESTS</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {announcements.map((ann, idx) => (
            <div key={idx} className="notice-item" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="widget-type-badge font-mono" style={{ 
                  background: ann.category === 'exam' ? 'rgba(239,68,68,0.1)' : ann.category === 'placement' ? 'rgba(52, 211, 153,0.1)' : 'rgba(34, 211, 238,0.1)',
                  color: ann.category === 'exam' ? 'var(--accent-red)' : ann.category === 'placement' ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                  border: `1px solid ${ann.category === 'exam' ? 'rgba(239,68,68,0.15)' : ann.category === 'placement' ? 'rgba(52, 211, 153,0.15)' : 'rgba(34, 211, 238,0.15)'}`
                }}>
                  {ann.category}
                </span>
                <span className="text-muted" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}>Live</span>
              </div>
              <p className="font-display text-white" style={{ fontWeight: 'bold', fontSize: '12.5px' }}>{ann.title}</p>
              <div className="summary-box" style={{ background: 'rgba(5,7,12,0.6)', border: '1px solid var(--glass-border)', padding: '0.55rem', borderRadius: '8px', fontSize: '11px', color: '#cbd5e1', fontStyle: 'italic' }}>
                {ann.summarized}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extracted Deadlines */}
      {todayEvents && todayEvents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.85rem' }}>
          <h4 className="font-mono text-amber" style={{ fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Bell className="w-4 h-4 animate-bounce" />
            <span>EXTRACTED SCHEDULE ALERTS</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {todayEvents.map((evt, idx) => {
              const deadlineDate = new Date(evt.deadline);
              const deadlineText = isNaN(deadlineDate.getTime())
                ? evt.deadline
                : deadlineDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
              return (
                <div key={idx} style={{ background: evt.closingSoon ? 'rgba(245,158,11,0.02)' : 'rgba(255,255,255,0.02)', border: evt.closingSoon ? '1px solid rgba(245,158,11,0.1)' : '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p className="font-display text-white" style={{ fontWeight: 'bold', fontSize: '12px' }}>{evt.name}</p>
                      <p className="text-muted" style={{ fontSize: '9px', marginTop: '0.1rem' }}>{evt.type} &middot; {evt.location}</p>
                    </div>
                    <span className="font-mono text-amber" style={{ fontSize: '9.5px', fontWeight: 'bold', background: 'rgba(245,158,11,0.08)', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.15)', whiteSpace: 'nowrap' }}>
                      {evt.closingSoon ? 'Closing Soon — ' : 'Deadline '}{deadlineText}
                    </span>
                  </div>
                  {evt.highlight && (
                    <p style={{ fontSize: '10px', color: '#cbd5e1', fontStyle: 'italic' }}>{evt.highlight}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
