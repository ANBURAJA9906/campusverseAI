import React, { useState, useEffect, useCallback } from 'react';
import { Users, Building2, CalendarDays, Megaphone, ClipboardList, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function OverviewTab() {
  const { fetchAdmin, staff } = useAdmin();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchAdmin('/admin/overview');
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load overview.');
    } finally {
      setLoading(false);
    }
  }, [fetchAdmin]);

  useEffect(() => { load(); }, [load]);

  const stats = data?.stats || {};

  const cards = [
    { label: 'Students', value: stats.studentCount, icon: Users },
    { label: 'Clubs', value: stats.clubCount, icon: Building2 },
    { label: 'Events', value: stats.eventCount, icon: CalendarDays },
    { label: 'Announcements', value: stats.announcementCount, icon: Megaphone },
    { label: 'Registrations', value: stats.registrationCount, icon: ClipboardList }
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Overview</h2>
          <p className="admin-page-subtitle">
            Signed in as <strong>{staff?.name}</strong> ({staff?.role}){staff?.department ? ` · ${staff.department}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {data && (
            <span className={`admin-badge ${data.geminiEnabled ? 'admin-badge-green' : 'admin-badge-amber'}`}>
              <Sparkles size={11} />
              <span>
                {data.geminiEnabled
                  ? `Gemini Live · ${data.geminiProvider?.provider === 'vertex' ? 'Vertex AI (Cloud credits)' : 'AI Studio'}`
                  : 'Gemini Fallback'}
              </span>
            </span>
          )}
          <button onClick={load} className="admin-btn-icon" title="Refresh">
            <RefreshCw size={14} className={loading ? 'admin-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-stat-grid">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div className="admin-stat-card" key={c.label}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p className="admin-stat-label">{c.label}</p>
                <Icon size={14} color="var(--a-text-faint)" />
              </div>
              <p className="admin-stat-value">{loading ? '—' : (c.value ?? 0)}</p>
            </div>
          );
        })}
      </div>

      <div className="admin-card">
        <p style={{ fontSize: '12.5px', color: 'var(--a-text-dim)', lineHeight: 1.6 }}>
          This console manages campus data for the student-facing CampusVerse AI experience.
          Use the sidebar to publish announcements, manage clubs/events/hostels/library records,
          review student registrations, or generate a Freshers&apos; Welcome poster.
        </p>
      </div>
    </div>
  );
}
