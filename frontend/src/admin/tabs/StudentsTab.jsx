import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function StudentsTab() {
  const { fetchAdmin } = useAdmin();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdmin('/admin/students');
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [fetchAdmin]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Students</h2>
          <p className="admin-page-subtitle">Read-only oversight — {students.length} record{students.length === 1 ? '' : 's'}</p>
        </div>
        <button onClick={load} className="admin-btn-icon" title="Refresh">
          <RefreshCw size={14} className={loading ? 'admin-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Year</th>
                <th>CGPA</th>
                <th>Clubs Joined</th>
                <th>Events Registered</th>
                <th>Study Plans</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.department}</td>
                  <td>{s.year}</td>
                  <td>{s.cgpa}</td>
                  <td>{s.clubsJoined}</td>
                  <td>{s.eventsRegistered}</td>
                  <td>{s.activeStudyPlans}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && students.length === 0 && !error && (
            <div className="admin-empty-state">No students found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
