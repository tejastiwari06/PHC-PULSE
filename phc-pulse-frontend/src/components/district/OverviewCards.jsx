import React, { useEffect, useState } from 'react';
import { Building2, AlertTriangle, BedDouble, Stethoscope, ArrowLeftRight, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import Alert from '../shared/Alert';
import Loader from '../shared/Loader';
import PulseDivider from '../shared/PulseDivider';

export default function OverviewCards() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/dashboard/district-overview', token)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div className="section-eyebrow">District snapshot</div>
      <h3 className="section-title"><Building2 size={18} color="var(--teal-700)" /> PHC Overview</h3>
      <PulseDivider />

      <Alert type="error" message={error} />

      {loading ? (
        <Loader label="Loading overview..." />
      ) : data.length === 0 ? (
        <div className="empty-state card">
          <Building2 size={36} />
          <p>No PHCs added yet. Add one from the PHC Management tab.</p>
        </div>
      ) : (
        <div className="grid-3">
          {data.map((phc) => (
            <div key={phc.phc_id} className="card overview-card">
              <div>
                <div className="phc-name">{phc.phc_name}</div>
                <div className="phc-district"><MapPin size={12} style={{ marginRight: 4, position: 'relative', top: 1 }} />{phc.district}</div>
              </div>

              <div className="overview-stat-row">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} color={phc.critical_stock_medicines > 0 ? 'var(--danger)' : 'var(--ink-soft)'} />
                  Critical stock
                </span>
                <span className={`badge ${phc.critical_stock_medicines > 0 ? 'badge-danger' : 'badge-success'}`}>
                  {phc.critical_stock_medicines}
                </span>
              </div>

              <div className="overview-stat-row">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BedDouble size={14} color="var(--ink-soft)" /> Bed occupancy
                </span>
                <span className="mono-num" style={{ fontWeight: 600 }}>
                  {phc.bed_occupancy_percent != null ? `${phc.bed_occupancy_percent}%` : '—'}
                </span>
              </div>

              <div className="overview-stat-row">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Stethoscope size={14} color="var(--ink-soft)" /> Doctors present
                </span>
                <span className="mono-num" style={{ fontWeight: 600 }}>{phc.doctors_checked_in_today}</span>
              </div>

              <div className="overview-stat-row">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ArrowLeftRight size={14} color="var(--ink-soft)" /> Pending transfers
                </span>
                <span className={`badge ${phc.pending_redistribution_transfers > 0 ? 'badge-warning' : 'badge-neutral'}`}>
                  {phc.pending_redistribution_transfers}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
