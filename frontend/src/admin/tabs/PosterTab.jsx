import React, { useState } from 'react';
import { ImagePlus, Loader2, AlertCircle, Download, Sparkles } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function PosterTab() {
  const { fetchAdmin } = useAdmin();
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
      const result = await fetchAdmin('/admin/poster', {
        method: 'POST',
        body: JSON.stringify({ eventName, date, venue, theme })
      });
      setPoster(result);
    } catch (err) {
      setError(err.message || 'Poster generation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Poster Generator</h2>
          <p className="admin-page-subtitle">Nano Banana — generates a Freshers&apos; Welcome poster from event details</p>
        </div>
      </div>

      <div className="admin-poster-grid">
        <div className="admin-card">
          <h3 className="admin-form-title">
            <ImagePlus size={15} color="var(--a-gold)" />
            <span>Event Details</span>
          </h3>

          {error && (
            <div className="admin-alert admin-alert-error">
              <AlertCircle size={13} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-row">
              <label>Event Name</label>
              <input className="admin-input" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. Freshers' Welcome Party" />
            </div>
            <div className="admin-form-row">
              <label>Date</label>
              <input className="admin-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="admin-form-row">
              <label>Venue</label>
              <input className="admin-input" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Main Auditorium" />
            </div>
            <div className="admin-form-row">
              <label>Theme / Vibe</label>
              <input className="admin-input" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="e.g. neon retro, pastel garden..." />
            </div>
            <div className="admin-form-actions">
              <button type="submit" disabled={loading} className="admin-btn-primary">
                {loading ? <Loader2 size={14} className="admin-spin" /> : <Sparkles size={13} />}
                <span>{loading ? 'Generating poster...' : 'Generate Poster'}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="admin-card">
          <h3 className="admin-form-title">Preview</h3>
          <div className="admin-poster-preview">
            {poster?.dataUrl ? (
              <img src={poster.dataUrl} alt={`${eventName} poster`} />
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--a-text-faint)' }}>
                {loading ? 'Generating your poster...' : 'Your generated poster will appear here.'}
              </p>
            )}
          </div>
          {poster?.dataUrl && (
            <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'center' }}>
              <a
                href={poster.dataUrl}
                download={`${eventName.replace(/\s+/g, '-').toLowerCase() || 'poster'}.png`}
                className="admin-btn-primary"
              >
                <Download size={14} />
                <span>Download Poster</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
