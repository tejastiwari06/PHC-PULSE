import React, { useState } from 'react';
import { Pill, ScanLine, Users, BedDouble, Stethoscope } from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import MedicineStock from '../components/phc/MedicineStock';
import ScanStock from '../components/phc/ScanStock';
import PatientFootfall from '../components/phc/PatientFootfall';
import BedStatus from '../components/phc/BedStatus';
import DoctorAttendance from '../components/phc/DoctorAttendance';

const TABS = [
  { key: 'stock', label: 'Medicine Stock', icon: Pill },
  { key: 'scan', label: 'Scan Register', icon: ScanLine },
  { key: 'footfall', label: 'Patient Footfall', icon: Users },
  { key: 'beds', label: 'Bed Status', icon: BedDouble },
  { key: 'attendance', label: 'My Attendance', icon: Stethoscope },
];

export default function PhcDashboard() {
  const [tab, setTab] = useState('stock');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="app-shell">
      <Sidebar tabs={TABS} activeTab={tab} onTabChange={setTab} />
      <div className="main-area">
        <div className="topbar">
          <h2>{TABS.find((t) => t.key === tab)?.label}</h2>
        </div>
        <div className="content">
          {tab === 'stock' && <MedicineStock key={refreshKey} />}
          {tab === 'scan' && <ScanStock onSaved={() => { setRefreshKey((k) => k + 1); setTab('stock'); }} />}
          {tab === 'footfall' && <PatientFootfall />}
          {tab === 'beds' && <BedStatus />}
          {tab === 'attendance' && <DoctorAttendance />}
        </div>
      </div>
    </div>
  );
}
