import React from 'react';
import { Users, User, MapPin, CheckCircle, ArrowRight, Share2 } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';

export default function AIClubWidget({ data }) {
  const { student, sendChatMessage } = useCampus();

  if (!data) return null;

  const { clubName, clubDescription, whatsappGroup, facultyCoordinator, studentCoordinator, upcomingEvents, similarClubs } = data;

  return (
    <div className="club-widget-container animate-fade-in">
      {/* Header */}
      <div className="widget-title-row">
        <div>
          <span className="widget-type-badge font-mono" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
            Technical Club
          </span>
          <h3 className="widget-heading" style={{ fontSize: '16px', marginTop: '0.25rem' }}>{clubName}</h3>
        </div>
        <div>
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.35rem', 
            background: 'rgba(52, 211, 153,0.08)', 
            color: 'var(--accent-emerald)', 
            border: '1px solid rgba(52, 211, 153,0.15)', 
            padding: '0.3rem 0.65rem', 
            borderRadius: '20px', 
            fontSize: '9.5px',
            fontWeight: 'bold' 
          }}>
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Registered</span>
          </span>
        </div>
      </div>

      <p className="text-muted" style={{ fontSize: '11.5px', lineHeight: '1.45' }}>{clubDescription}</p>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
        <a 
          href={whatsappGroup} 
          target="_blank" 
          rel="noreferrer"
          className="action-card-btn whatsapp"
          style={{ flex: 1, padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', borderRadius: '12px' }}
        >
          <Share2 className="w-4 h-4" />
          <span>Join WhatsApp group</span>
        </a>
        <button 
          onClick={() => sendChatMessage("Navigate to Programming Lab from Main Gate")}
          className="action-card-btn navigate"
          style={{ flex: 1, padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', borderRadius: '12px' }}
        >
          <MapPin className="w-4 h-4" />
          <span>Navigate to Room</span>
        </button>
      </div>

      {/* Leaders & Profile */}
      <div className="coordinators-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.85rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <h4 className="font-mono text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>SOCIETY LEADERSHIP</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '10.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User className="w-4 h-4 text-purple" />
              <div>
                <p className="text-white" style={{ fontWeight: 'bold', fontSize: '10.5px' }}>{facultyCoordinator.split(' ')[0]} {facultyCoordinator.split(' ')[1]}</p>
                <p className="text-muted" style={{ fontSize: '8px' }}>Faculty Advisor</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User className="w-4 h-4 text-cyan" />
              <div>
                <p className="text-white" style={{ fontWeight: 'bold', fontSize: '10.5px' }}>{studentCoordinator.split(' ')[0]} {studentCoordinator.split(' ')[1]}</p>
                <p className="text-muted" style={{ fontSize: '8px' }}>Student Coordinator</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <h4 className="font-mono text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>ENROLLMENT LOG</h4>
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '0.5rem 0.65rem', borderRadius: '10px', fontSize: '9.5px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Student:</span>
              <span className="text-white" style={{ fontWeight: 'bold' }}>{student?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Dept:</span>
              <span className="text-white" style={{ fontWeight: 'bold', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student?.department}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Events */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.85rem' }}>
          <h4 className="font-mono text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>UPCOMING CLUB ACTIVITIES</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {upcomingEvents.map((evt, idx) => (
              <div key={idx} className="book-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="font-display text-white" style={{ fontWeight: 'bold', fontSize: '11.5px' }}>{evt.name}</p>
                  <p className="text-muted" style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.1rem' }}>
                    <MapPin className="w-3 h-3 text-muted" /> {evt.location}
                  </p>
                </div>
                <span className="font-mono text-cyan" style={{ fontSize: '8.5px', fontWeight: 'bold', background: 'rgba(34, 211, 238,0.06)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  {evt.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Clubs */}
      {similarClubs && similarClubs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.85rem' }}>
          <h4 className="font-mono text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>SIMILAR COMMUNITIES RECOMMENDED</h4>
          <div className="coordinators-grid" style={{ gap: '0.75rem' }}>
            {similarClubs.slice(0, 2).map((club, idx) => (
              <div 
                key={idx} 
                onClick={() => sendChatMessage(`Join me to the ${club.name}`)}
                className="book-card"
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left', transition: 'all 0.2s ease' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-display text-white" style={{ fontWeight: 'bold', fontSize: '11px' }}>{club.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted" />
                </div>
                <p className="text-muted" style={{ fontSize: '9.5px', lineClamp: 2 }}>{club.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
