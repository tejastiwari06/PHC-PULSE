import React, { useEffect, useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import Alert from '../shared/Alert';
import Loader, { InlineLoader } from '../shared/Loader';
import PulseDivider from '../shared/PulseDivider';

export default function PhcManagement() {
  const { token } = useAuth();
  const [phcs, setPhcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [totalBeds, setTotalBeds] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/api/phc-centers/', token).then(setPhcs).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/api/phc-centers/', {
        name, district, state,
        total_beds: totalBeds ? Number(totalBeds) : 0,
      }, token);
      setSuccess(`${name} added successfully.`);
      setName(''); setDistrict(''); setState(''); setTotalBeds('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid-2">
      <div className="card" style={{ padding: 22 }}>
        <div className="section-eyebrow">Add new</div>
        <h3 className="section-title"><Plus size={18} color="var(--teal-700)" /> Add PHC</h3>
        <PulseDivider />
        <Alert type="error" message={error} />
        <Alert type="success" message={success} />
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="label">Name</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field-group">
            <label className="label">District</label>
            <input className="input-field" value={district} onChange={(e) => setDistrict(e.target.value)} required />
          </div>
          <div className="field-group">
            <label className="label">State</label>
            <input className="input-field" value={state} onChange={(e) => setState(e.target.value)} required />
          </div>
          <div className="field-group">
            <label className="label">Total Beds</label>
            <input type="number" min="0" className="input-field" value={totalBeds} onChange={(e) => setTotalBeds(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? <InlineLoader /> : 'Add PHC'}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 22 }}>
        <div className="section-eyebrow">Registered centers</div>
        <h3 className="section-title"><Building2 size={18} color="var(--teal-700)" /> All PHCs</h3>
        <PulseDivider />
        {loading ? (
          <Loader label="Loading..." />
        ) : phcs.length === 0 ? (
          <div className="empty-state">
            <Building2 size={32} />
            <p>No PHCs yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>District</th><th>Beds</th></tr></thead>
            <tbody>
              {phcs.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.district}</td>
                  <td className="mono-num">{p.total_beds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
