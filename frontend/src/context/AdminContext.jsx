import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Separate auth context for the Admin/Faculty console. Deliberately isolated
// from CampusContext (student side) — different backend routes
// (/api/auth, /api/admin/*), different token, different login flow.

const AdminContext = createContext();
export const useAdmin = () => useContext(AdminContext);

const ADMIN_BACKEND_URL = 'http://localhost:5000/api';
// This is a real Vite/browser app (not a claude.ai artifact), so localStorage
// is fine here — it's how the staff session survives a page refresh.
const STORAGE_KEY = 'campusverse_staff_token';

export const AdminProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || null);
  const [staff, setStaff] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setStaff(null);
  }, []);

  // Attaches `Authorization: Bearer <token>` to every admin API call.
  const fetchAdmin = useCallback(async (path, options = {}) => {
    const res = await fetch(`${ADMIN_BACKEND_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      // No JSON body (e.g. a network-level failure) — leave data as null.
    }

    if (!res.ok) {
      if (res.status === 401) logout(); // expired/invalid session — bounce to login
      throw new Error((data && data.error) || `Request failed (${res.status})`);
    }

    return data;
  }, [token, logout]);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${ADMIN_BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Login failed. Please check your credentials.');
    }
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    setStaff(data.staff);
    return data.staff;
  }, []);

  // On mount (or whenever the token changes), verify it's still valid via
  // GET /api/auth/me rather than trusting whatever is sitting in storage.
  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!token) {
        setAuthChecked(true);
        return;
      }
      try {
        const res = await fetch(`${ADMIN_BACKEND_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.staff) {
          setStaff(data.staff);
        } else {
          logout();
        }
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    }

    verify();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AdminContext.Provider value={{
      token,
      staff,
      authChecked,
      login,
      logout,
      fetchAdmin,
      backendUrl: ADMIN_BACKEND_URL
    }}>
      {children}
    </AdminContext.Provider>
  );
};
