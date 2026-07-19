import React, { useState } from 'react';
import { Calendar, BookOpen, Video, Clock, ExternalLink } from 'lucide-react';

export default function StudyPlanWidget({ data }) {
  const [tasksState, setTasksState] = useState(
    data ? data.tasks.map(t => ({ ...t, completed: false })) : []
  );

  if (!data) return null;

  const { subject, examDate, daysRemaining, recommendedBooks, onlineResources } = data;

  const toggleTask = (day) => {
    setTasksState(prev => 
      prev.map(t => t.day === day ? { ...t, completed: !t.completed } : t)
    );
  };

  const completedCount = tasksState.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasksState.length) * 100) || 0;

  return (
    <div className="study-widget-container animate-fade-in">
      {/* Header */}
      <div className="widget-title-row">
        <div>
          <span className="widget-type-badge font-mono" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239,68,68,0.15)' }}>
            Academics Agent
          </span>
          <h3 className="widget-heading" style={{ fontSize: '16px', marginTop: '0.25rem' }}>{subject} Exam Preparation</h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="font-display text-amber" style={{ fontSize: '20px', fontWeight: '900' }}>{daysRemaining} Days</p>
          <p className="text-muted" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}>Prep Countdown</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold' }}>
          <span className="text-muted">Study Guide Completion</span>
          <span className="text-cyan">{progressPercent}%</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* 7-Day Study Calendar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Calendar className="text-cyan w-4 h-4" />
          <h4 className="font-mono text-muted" style={{ fontSize: '10px', fontWeight: 'bold' }}>7-DAY REVISION TIMELINE</h4>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
          {tasksState.map((task) => (
            <div 
              key={task.day} 
              onClick={() => toggleTask(task.day)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0.65rem 0.85rem', 
                borderRadius: '10px', 
                border: `1px solid ${task.completed ? 'rgba(52, 211, 153,0.3)' : 'var(--glass-border)'}`, 
                background: task.completed ? 'rgba(52, 211, 153,0.02)' : 'rgba(255,255,255,0.01)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '4px', 
                  border: `1.5px solid ${task.completed ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.2)'}`, 
                  background: task.completed ? 'var(--accent-emerald)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#05070c',
                  fontWeight: 'bold',
                  fontSize: '9px'
                }}>
                  {task.completed && '✓'}
                </div>
                <div>
                  <p className="font-display" style={{ fontSize: '11.5px', fontWeight: '600', color: task.completed ? 'var(--text-secondary)' : '#fff', textDecoration: task.completed ? 'line-through' : 'none' }}>
                    Day {task.day}: {task.topic}
                  </p>
                  <p className="text-muted" style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.1rem' }}>
                    <Clock className="w-3 h-3" /> Target duration: {task.hours} hours
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Books and Curated links */}
      <div className="books-grid">
        {/* Recommended Books */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <BookOpen className="text-purple w-4 h-4" />
            <h4 className="font-mono text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>STACK TEXTBOOKS</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {recommendedBooks.map((book, idx) => (
              <div key={idx} className="book-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p className="font-display text-white" style={{ fontWeight: 'bold', fontSize: '10.5px', lineHeight: '1.3' }}>{book.title}</p>
                <p className="text-muted" style={{ fontSize: '8.5px' }}>{book.authors}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.15rem' }}>
                  <span className="font-mono" style={{ fontSize: '8px', background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: '3px' }}>{book.callNumber}</span>
                  <span className="font-display text-emerald" style={{ fontSize: '8.5px', fontWeight: 'bold' }}>{book.status.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Curated Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Video className="text-purple w-4 h-4" />
            <h4 className="font-mono text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>STUDY VIDEO PLAYLISTS</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {onlineResources.map((res, idx) => (
              <a 
                key={idx} 
                href={res.link} 
                target="_blank" 
                rel="noreferrer"
                className="book-card" 
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
              >
                <p className="font-display text-white" style={{ fontWeight: 'bold', fontSize: '10.5px', lineHeight: '1.3' }}>{res.title}</p>
                <p className="text-muted" style={{ fontSize: '8.5px' }}>Channel: {res.channel}</p>
                <span className="font-mono text-cyan" style={{ alignSelf: 'flex-start', fontSize: '8px', background: 'rgba(34, 211, 238,0.06)', padding: '1px 4px', borderRadius: '3px', marginTop: '0.15rem' }}>
                  {res.duration}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
