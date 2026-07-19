import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Trash2, RefreshCw, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const CATEGORIES = [
  { value: 'general', label: 'General Notice' },
  { value: 'academic', label: 'Academic & Exams' },
  { value: 'placement', label: 'Placement Cell' }
];

export default function AnnouncementsTab() {
  const { fetchAdmin } = useAdmin();
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadItems = useCallback(async () => {
    setListLoading(true);
    setListError('');
    try {
      const data = await fetchAdmin('/admin/announcements');
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setListError(err.message || 'Failed to load announcements.');
    } finally {
      setListLoading(false);
    }
  }, [fetchAdmin]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    setSaving(true);
    setFormError('');
    try {
      await fetchAdmin('/admin/announcements', {
        method: 'POST',
        body: JSON.stringify({ title, content, category })
      });
      setTitle('');
      setContent('');
      setCategory('general');
      loadItems();
    } catch (err) {
      setFormError(err.message || 'Failed to publish announcement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await fetchAdmin(`/admin/announcements/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      window.alert(err.message || 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-section-grid">
      <div className="admin-card">
        <h3 className="admin-form-title">
          <PlusCircle size={15} color="var(--a-gold)" />
          <span>Publish Notice (Gemini-Summarized)</span>
        </h3>

        {formError && (
          <div className="admin-alert admin-alert-error">
            <AlertCircle size={13} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-row">
            <label>Notice Title *</label>
            <input
              className="admin-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DBMS Lab Assessment Schedule"
              required
            />
          </div>
          <div className="admin-form-row">
            <label>Category *</label>
            <select className="admin-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option value={c.value} key={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="admin-form-row">
            <label>Notice Description *</label>
            <textarea
              className="admin-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full notice details — Gemini will auto-summarize this for the student digest..."
              required
            />
          </div>
          <div className="admin-form-actions">
            <button type="submit" disabled={saving} className="admin-btn-primary">
              {saving ? <Loader2 size={14} className="admin-spin" /> : <Sparkles size={13} />}
              <span>{saving ? 'Summarizing & Publishing...' : 'Publish Notice'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <h3 className="admin-form-title" style={{ marginBottom: 0 }}>Announcements ({items.length})</h3>
          <button onClick={loadItems} className="admin-btn-icon" title="Refresh">
            <RefreshCw size={14} className={listLoading ? 'admin-spin' : ''} />
          </button>
        </div>

        {listError && (
          <div className="admin-alert admin-alert-error">
            <AlertCircle size={13} />
            <span>{listError}</span>
          </div>
        )}

        <div className="admin-list">
          {!listLoading && items.length === 0 && !listError && (
            <div className="admin-empty-state">No announcements yet. Publish the first one.</div>
          )}
          {items.map((notice) => (
            <div className="admin-list-item" key={notice.id}>
              <div className="admin-list-item-top">
                <div>
                  <p className="admin-list-item-title">{notice.title}</p>
                  <p className="admin-list-item-meta">
                    {notice.category} · {notice.createdBy?.name ? `by ${notice.createdBy.name}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(notice.id)}
                  className="admin-btn-icon"
                  title="Delete"
                  disabled={deletingId === notice.id}
                >
                  {deletingId === notice.id ? <Loader2 size={13} className="admin-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
              <p className="admin-list-item-body">{notice.content}</p>
              {notice.summarized && (
                <div style={{
                  fontSize: '10.5px', background: '#090b0f', border: '1px solid var(--a-border)',
                  padding: '0.5rem 0.65rem', borderRadius: '8px', color: 'var(--a-gold)', fontStyle: 'italic'
                }}>
                  <strong>Gemini Summary:</strong> {notice.summarized}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
