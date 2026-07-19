import React, { useState, useEffect } from 'react';
import { Building2, BookOpen, Phone, Clock, MapPin, User as UserIcon } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';

// Smart Library & Hostel Information — submitted-feature #9. Read-only
// listings backed by /api/hostels and /api/library (server.js), managed
// by staff in the Admin/Faculty portal (see src/admin/resourceConfigs.js).
export default function CampusResourcesTab() {
  const { hostels, libraryBooks, campusResourcesLoading, loadCampusResources } = useCampus();
  const [subTab, setSubTab] = useState('hostels');

  useEffect(() => {
    loadCampusResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 className="font-mono text-muted" style={{ fontSize: '10px', fontWeight: 'bold' }}>CAMPUS RESOURCES</h4>
        <div className="resource-subtab-toggle">
          <button
            type="button"
            className={`resource-subtab-btn ${subTab === 'hostels' ? 'active' : ''}`}
            onClick={() => setSubTab('hostels')}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hostels</span>
          </button>
          <button
            type="button"
            className={`resource-subtab-btn ${subTab === 'library' ? 'active' : ''}`}
            onClick={() => setSubTab('library')}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>
        </div>
      </div>

      {campusResourcesLoading && (
        <p className="text-muted" style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '11px', padding: '2rem 0' }}>Loading campus resources...</p>
      )}

      {!campusResourcesLoading && subTab === 'hostels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {hostels.map((h) => {
            const facilities = (h.facilities || '').split(',').map(f => f.trim()).filter(Boolean);
            return (
              <div key={h.id} className="info-card resource-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p className="font-display text-white" style={{ fontWeight: 'bold', fontSize: '12.5px' }}>{h.name}</p>
                    <p className="text-muted" style={{ fontSize: '9px', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin className="w-2.5 h-2.5" /> {h.location}
                    </p>
                  </div>
                  <span className="widget-type-badge font-mono" style={{
                    background: 'rgba(139, 92, 246,0.1)', color: 'var(--accent-purple)', border: '1px solid rgba(139, 92, 246,0.15)'
                  }}>
                    {h.type}
                  </span>
                </div>
                <div className="resource-detail-row">
                  <UserIcon className="w-3 h-3 text-cyan" />
                  <span>Warden: {h.warden}</span>
                </div>
                <div className="resource-detail-row">
                  <Phone className="w-3 h-3 text-cyan" />
                  <span>{h.contact}</span>
                </div>
                <div className="resource-detail-row">
                  <Clock className="w-3 h-3 text-amber" />
                  <span>{h.messTimings}</span>
                </div>
                {facilities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                    {facilities.map((f, i) => (
                      <span key={i} className="community-tag-badge">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {hostels.length === 0 && (
            <p className="text-muted" style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '11px', padding: '2rem 0' }}>No hostel records available yet.</p>
          )}
        </div>
      )}

      {!campusResourcesLoading && subTab === 'library' && (
        <div className="info-grid">
          {libraryBooks.map((b) => (
            <div key={b.id} className="info-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p className="font-display text-white" style={{ fontWeight: 'bold', fontSize: '11.5px' }}>{b.title}</p>
                <span className="widget-type-badge font-mono" style={{
                  background: 'rgba(34, 211, 238,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(34, 211, 238,0.15)'
                }}>
                  {b.category}
                </span>
              </div>
              <p className="text-muted" style={{ fontSize: '9.5px' }}>{b.author}</p>
              <p className="text-muted" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}>Call No. {b.callNumber}</p>
              <span className={`font-mono ${b.availableCopies > 0 ? 'text-emerald' : 'text-amber'}`} style={{ fontSize: '9.5px', fontWeight: 'bold' }}>
                {b.availableCopies}/{b.totalCopies} copies available
              </span>
            </div>
          ))}
          {libraryBooks.length === 0 && (
            <p className="text-muted" style={{ gridColumn: 'span 2', textAlign: 'center', fontStyle: 'italic', fontSize: '11px', padding: '2rem 0' }}>No library records available yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
