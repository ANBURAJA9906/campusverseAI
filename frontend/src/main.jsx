import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminRoot from './admin/AdminRoot.jsx'

// ── Theme: apply BEFORE paint to avoid FOUC ──────────────────────────────────
;(function () {
  const saved = localStorage.getItem('campusverse-theme') || 'dark';
  let active = saved;
  if (saved === 'system') {
    active = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', active);
})();

// Route separation: the staff console lives at /admin, entirely separate
// from the student SPA. No router dependency needed for a single split
// like this — Vite's dev/preview server already falls back to index.html
// for unmatched paths, so this pathname check is all that's required.
const isAdminRoute = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminRoute ? <AdminRoot /> : <App />}
  </StrictMode>,
)

