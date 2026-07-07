import React, { useEffect, useState } from 'react';
import { ArrowLeftRight, RefreshCw, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import Alert from '../shared/Alert';
import Loader, { InlineLoader } from '../shared/Loader';
import PulseDivider from '../shared/PulseDivider';

const statusBadge = {
  suggested: 'badge-warning',
  approved: 'badge-success',
  completed: 'badge-neutral',
  rejected: 'badge-danger',
};

export default function Redistribution() {
  const { token } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [phcMap, setPhcMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/redistribution/all', token),
      api.get('/api/phc-centers/', token),
    ])
      .then(([subs, phcs]) => {
        setSuggestions(subs);
        setPhcMap(Object.fromEntries(phcs.map((p) => [p.id, p.name])));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      await api.post('/api/redistribution/generate', {}, token);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setActingId(id);
    setError('');
    try {
      await api.patch(`/api/redistribution/${id}/status?new_status=${newStatus}`, null, token);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="section-eyebrow">Cross-PHC logistics · unique to PHC Pulse</div>
          <h3 className="section-title"><ArrowLeftRight size={18} color="var(--teal-700)" /> Redistribution Suggestions</h3>
        </div>
        <button className="btn btn-coral btn-sm" onClick={handleGenerate} disabled={generating}>
          {generating ? <InlineLoader /> : <><RefreshCw size={14} /> Refresh Suggestions</>}
        </button>
      </div>
      <PulseDivider />

      <Alert type="error" message={error} />

      {loading ? (
        <Loader label="Loading suggestions..." />
      ) : suggestions.length === 0 ? (
        <div className="empty-state">
          <ArrowLeftRight size={36} />
          <p>No suggestions yet. Click "Refresh Suggestions" to run the matching engine.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>From → To</th>
              <th>Qty</th>
              <th>Reason</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.medicine_name}</td>
                <td style={{ fontSize: '0.82rem' }}>
                  {phcMap[s.from_phc_id] || `PHC #${s.from_phc_id}`} → {phcMap[s.to_phc_id] || `PHC #${s.to_phc_id}`}
                </td>
                <td className="mono-num">{s.suggested_quantity}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', maxWidth: 240 }}>{s.reason}</td>
                <td><span className={`badge ${statusBadge[s.status]}`}>{s.status}</span></td>
                <td>
                  {s.status === 'suggested' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-success-outline btn-sm"
                        disabled={actingId === s.id}
                        onClick={() => updateStatus(s.id, 'approved')}
                      >
                        <Check size={13} />
                      </button>
                      <button
                        className="btn btn-danger-outline btn-sm"
                        disabled={actingId === s.id}
                        onClick={() => updateStatus(s.id, 'rejected')}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
