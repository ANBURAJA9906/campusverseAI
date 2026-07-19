import React from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { AdminProvider, useAdmin } from '../context/AdminContext';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import './admin.css';

function AdminGate() {
  const { staff, authChecked } = useAdmin();

  if (!authChecked) {
    return (
      <div className="admin-root">
        <div className="admin-fullscreen-loading">
          <ShieldCheck size={28} color="var(--a-gold)" />
          <Loader2 size={18} className="admin-spin" />
          <span>Verifying staff session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      {staff ? <AdminDashboard /> : <AdminLogin />}
    </div>
  );
}

export default function AdminRoot() {
  return (
    <AdminProvider>
      <AdminGate />
    </AdminProvider>
  );
}
