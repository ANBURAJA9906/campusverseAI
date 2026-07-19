import React, { useState } from 'react';
import {
  ShieldCheck, LayoutDashboard, Megaphone, Users2, Building2,
  CalendarDays, BookMarked, Users, ImagePlus, LogOut
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { resourceConfigs } from './resourceConfigs';
import ResourceTab from './ResourceTab';
import OverviewTab from './tabs/OverviewTab';
import AnnouncementsTab from './tabs/AnnouncementsTab';
import StudentsTab from './tabs/StudentsTab';
import PosterTab from './tabs/PosterTab';
import ThemeToggle from '../components/ThemeToggle';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'clubs', label: 'Clubs', icon: Users2 },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'hostels', label: 'Hostels', icon: Building2 },
  { id: 'library', label: 'Library', icon: BookMarked },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'poster', label: 'Poster Generator', icon: ImagePlus }
];

export default function AdminDashboard() {
  const { staff, logout } = useAdmin();
  const [tab, setTab] = useState('overview');

  const initials = (staff?.name || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const renderTab = () => {
    switch (tab) {
      case 'overview': return <OverviewTab />;
      case 'announcements': return <AnnouncementsTab />;
      case 'clubs': return <ResourceTab config={resourceConfigs.clubs} />;
      case 'events': return <ResourceTab config={resourceConfigs.events} />;
      case 'hostels': return <ResourceTab config={resourceConfigs.hostels} />;
      case 'library': return <ResourceTab config={resourceConfigs.library} />;
      case 'students': return <StudentsTab />;
      case 'poster': return <PosterTab />;
      default: return null;
    }
  };

  return (
    <div className="admin-shell" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1rem', right: '1.25rem', zIndex: 60 }}>
        <ThemeToggle />
      </div>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-icon">
            <ShieldCheck size={17} />
          </div>
          <div>
            <p className="admin-sidebar-brand-title">Staff Console</p>
            <p className="admin-sidebar-brand-subtitle">CAMPUSVERSE AI</p>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`admin-nav-btn ${tab === item.id ? 'active' : ''}`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-staff-chip">
            <div className="admin-staff-avatar">{initials}</div>
            <div>
              <p className="admin-staff-name">{staff?.name}</p>
              <p className="admin-staff-role">{staff?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="admin-btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
            <LogOut size={13} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {renderTab()}
      </main>
    </div>
  );
}
