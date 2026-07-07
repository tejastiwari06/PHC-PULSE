import React, { useState } from 'react';
import { LayoutGrid, ArrowLeftRight, Building2 } from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import OverviewCards from '../components/district/OverviewCards';
import Redistribution from '../components/district/Redistribution';
import PhcManagement from '../components/district/PhcManagement';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'redistribution', label: 'Redistribution', icon: ArrowLeftRight },
  { key: 'phcs', label: 'PHC Management', icon: Building2 },
];

export default function DistrictDashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="app-shell">
      <Sidebar tabs={TABS} activeTab={tab} onTabChange={setTab} />
      <div className="main-area">
        <div className="topbar">
          <h2>{TABS.find((t) => t.key === tab)?.label}</h2>
        </div>
        <div className="content">
          {tab === 'overview' && <OverviewCards />}
          {tab === 'redistribution' && <Redistribution />}
          {tab === 'phcs' && <PhcManagement />}
        </div>
      </div>
    </div>
  );
}
