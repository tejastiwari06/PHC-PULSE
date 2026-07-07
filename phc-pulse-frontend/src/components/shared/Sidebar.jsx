import React from 'react';
import { Activity, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ tabs, activeTab, onTabChange }) {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Activity size={26} color="var(--coral)" strokeWidth={2.5} />
        <span>PHC Pulse</span>
      </div>

      <div className="sidebar-user">
        <div className="name">{user?.full_name}</div>
        <div className="role">{user?.role === 'district_officer' ? 'District Officer' : 'PHC Staff'}</div>
      </div>

      <nav className="sidebar-nav">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? 'active' : ''}
            onClick={() => onTabChange(tab.key)}
          >
            <tab.icon size={17} />
            {tab.label}
          </button>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={logout}>
        <LogOut size={16} />
        Logout
      </button>
    </aside>
  );
}
