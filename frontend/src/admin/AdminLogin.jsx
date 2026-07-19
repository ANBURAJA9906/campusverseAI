import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import ThemeToggle from '../components/ThemeToggle';

export default function AdminLogin() {
  const { login } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ position: 'fixed', top: '1rem', right: '1.25rem', zIndex: 60 }}>
        <ThemeToggle />
      </div>
      <div className="admin-login-wrap">
        <a href="/" className="admin-login-back">
          <ArrowLeft size={14} />
          <span>Back to student portal</span>
        </a>

        <div className="admin-login-card">
          <div className="admin-login-badge">
            <ShieldCheck size={22} />
          </div>
          <h1 className="admin-login-title">CampusVerse Staff Console</h1>
          <p className="admin-login-subtitle">Office Admin &amp; Faculty access only</p>

          <form onSubmit={handleSubmit} className="admin-login-form">
            {error && (
              <div className="admin-alert admin-alert-error">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <label className="admin-field-label">Staff Email</label>
            <div className="admin-input-wrap">
              <Mail size={14} className="admin-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campusverse.edu"
                autoComplete="username"
                className="admin-input"
                required
              />
            </div>

            <label className="admin-field-label">Password</label>
            <div className="admin-input-wrap">
              <Lock size={14} className="admin-input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="admin-input"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="admin-btn-primary admin-login-submit">
              {loading ? (
                <>
                  <Loader2 size={15} className="admin-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Sign in to Console</span>
              )}
            </button>
          </form>

          <div className="admin-login-footnote">
            Seeded demo accounts: <code>admin@campusverse.edu</code> / <code>anita.sen@campusverse.edu</code>
          </div>
        </div>
      </div>
    </>
  );
}
