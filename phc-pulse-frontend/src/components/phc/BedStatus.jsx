import React, { useState } from 'react';
import { BedDouble } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import Alert from '../shared/Alert';
import { InlineLoader } from '../shared/Loader';
import PulseDivider from '../shared/PulseDivider';

export default function BedStatus() {
  const { token } = useAuth();
  const [total, setTotal] = useState(10);
  const [occupied, setOccupied] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pct = total > 0 ? Math.min(100, Math.round((occupied / total) * 100)) : 0;
  const barColor = pct >= 85 ? 'var(--danger)' : pct >= 60 ? 'var(--warning)' : 'var(--success)';

  const handleSave = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/api/operations/beds', { total_beds: Number(total), occupied_beds: Number(occupied) }, token);
      setSuccess('Bed status updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="section-eyebrow">Ward capacity</div>
      <h3 className="section-title"><BedDouble size={18} color="var(--teal-700)" /> Bed Status</h3>
      <PulseDivider />

      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
          <span>Occupancy</span>
          <span className="mono-num" style={{ fontWeight: 600 }}>{occupied} / {total} ({pct}%)</span>
        </div>
        <div className="bed-bar-track">
          <div className="bed-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>
      </div>

      <div className="grid-2">
        <div className="field-group">
          <label className="label">Total Beds</label>
          <input type="number" min="0" className="input-field" value={total} onChange={(e) => setTotal(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="label">Occupied Beds</label>
          <input type="number" min="0" max={total} className="input-field" value={occupied} onChange={(e) => setOccupied(e.target.value)} />
        </div>
      </div>

      <button className="btn btn-primary" disabled={submitting} onClick={handleSave}>
        {submitting ? <InlineLoader /> : 'Save Bed Status'}
      </button>
    </div>
  );
}
