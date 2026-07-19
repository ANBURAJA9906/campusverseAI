import React, { useState } from 'react';
import { ImagePlus, Loader2, AlertCircle, Download, Sparkles } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';

// Freshers' Welcome Poster Generator (Nano Banana) — student-facing
// counterpart to the staff-only version in the Admin/Faculty console.
// Explicitly required by the submitted problem statement ("create a
// Freshers' Welcome Party poster using Nano Banana"), so it's reachable
// without a staff login — hits the public POST /api/poster endpoint
// (rate-limited server-side, see server.js).
export default function PosterGeneratorTab() {
  const { backendUrl } = useCampus();
  const [eventName, setEventName] = useState("Freshers' Welcome Party");
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [poster, setPoster] = useState(null); // { dataUrl, mimeType }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPoster(null);
    try {
      const response = await fetch(`${backendUrl}/poster`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, date, venue, theme })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Poster generation failed.');
      }
      setPoster(result);
    } catch (err) {
      setError(err.message || 'Poster generation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <h4 className="font-mono text-muted" style={{ fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <ImagePlus className="w-3.5 h-3.5 text-cyan" />
        <span>WELCOME POSTER GENERATOR &middot; NANO BANANA</span>
      </h4>

      {error && (
        <div className="info-card" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
          <AlertCircle className="w-4 h-4" style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
          <span style={{ fontSize: '11px', color: '#fecaca' }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="info-card poster-form">
        <div className="input-label-group">
          <span>EVENT NAME</span>
          <input className="admin-input-field" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. Freshers' Welcome Party" />
        </div>
        <div className="input-label-group">
          <span>DATE</span>
          <input className="admin-input-field" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="input-label-group">
          <span>VENUE</span>
          <input className="admin-input-field" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Main Auditorium" />
        </div>
        <div className="input-label-group">
          <span>THEME / VIBE</span>
          <input className="admin-input-field" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="e.g. neon retro, pastel garden..." />
        </div>
        <button type="submit" disabled={loading} className="community-submit-btn">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin-slow" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{loading ? 'Generating poster...' : 'Generate Poster'}</span>
        </button>
      </form>

      <div className="info-card poster-preview">
        {poster?.dataUrl ? (
          <img src={poster.dataUrl} alt={`${eventName} poster`} style={{ width: '100%', borderRadius: 'var(--radius-md)', display: 'block' }} />
        ) : (
          <p className="text-muted" style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '11px', padding: '2rem 0' }}>
            {loading ? 'Generating your poster...' : 'Your generated poster will appear here.'}
          </p>
        )}
        {poster?.dataUrl && (
          <a
            href={poster.dataUrl}
            download={`${eventName.replace(/\s+/g, '-').toLowerCase() || 'poster'}.png`}
            className="community-submit-btn"
            style={{ marginTop: '0.75rem', textDecoration: 'none' }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Poster</span>
          </a>
        )}
      </div>
    </div>
  );
}
