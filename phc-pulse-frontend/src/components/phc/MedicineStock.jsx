import React, { useEffect, useState } from 'react';
import { Pill, Plus, X, Minus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import Alert from '../shared/Alert';
import Loader, { InlineLoader } from '../shared/Loader';
import PulseDivider from '../shared/PulseDivider';

function urgencyRowClass(days) {
  if (days == null) return '';
  if (days < 5) return 'row-danger';
  if (days < 15) return 'row-warning';
  return '';
}

function urgencyBadge(days) {
  if (days == null) return <span className="badge badge-neutral">No data yet</span>;
  if (days < 5) return <span className="badge badge-danger">{days}d left</span>;
  if (days < 15) return <span className="badge badge-warning">{days}d left</span>;
  return <span className="badge badge-success">{days}d left</span>;
}

export default function MedicineStock() {
  const { token } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [consumeTarget, setConsumeTarget] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/api/medicines/my-phc', token)
      .then(setMedicines)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="section-eyebrow">Inventory</div>
          <h3 className="section-title"><Pill size={18} color="var(--teal-700)" /> Medicine Stock</h3>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={15} /> Add Medicine
        </button>
      </div>
      <PulseDivider />

      <Alert type="error" message={error} />

      {loading ? (
        <Loader label="Loading stock..." />
      ) : medicines.length === 0 ? (
        <div className="empty-state">
          <Pill size={36} />
          <p>No medicines added yet. Add your first entry or scan a stock register.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Quantity</th>
              <th>Expiry</th>
              <th>Depletion</th>
              <th>Source</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((m) => (
              <tr key={m.id} className={urgencyRowClass(m.days_remaining)}>
                <td style={{ fontWeight: 600 }}>{m.name}</td>
                <td className="mono-num">{m.current_quantity} {m.unit}</td>
                <td className="mono-num">{m.expiry_date || '—'}</td>
                <td>{urgencyBadge(m.days_remaining)}</td>
                <td>
                  {m.source === 'ocr_scan' ? (
                    <span className={`confidence-tag ${m.last_ocr_confidence >= 80 ? 'confidence-high' : m.last_ocr_confidence >= 50 ? 'confidence-mid' : 'confidence-low'}`}>
                      OCR · {m.last_ocr_confidence}%
                    </span>
                  ) : (
                    <span className="badge badge-neutral">Manual</span>
                  )}
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setConsumeTarget(m)}>
                    <Minus size={13} /> Log use
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAddModal && (
        <AddMedicineModal
          token={token}
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); load(); }}
        />
      )}
      {consumeTarget && (
        <ConsumeModal
          token={token}
          medicine={consumeTarget}
          onClose={() => setConsumeTarget(null)}
          onSaved={() => { setConsumeTarget(null); load(); }}
        />
      )}
    </div>
  );
}

function AddMedicineModal({ token, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('tablets');
  const [expiry, setExpiry] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/medicines/manual', {
        name,
        current_quantity: Number(quantity),
        unit,
        expiry_date: expiry || null,
      }, token);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="section-title">Add Medicine</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={15} /></button>
        </div>
        <Alert type="error" message={error} />
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="label">Medicine Name</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field-group">
            <label className="label">Quantity</label>
            <input type="number" min="0" className="input-field" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>
          <div className="field-group">
            <label className="label">Unit</label>
            <select className="input-field" value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="tablets">tablets</option>
              <option value="bottles">bottles</option>
              <option value="strips">strips</option>
              <option value="vials">vials</option>
            </select>
          </div>
          <div className="field-group">
            <label className="label">Expiry Date (optional)</label>
            <input type="date" className="input-field" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? <InlineLoader /> : 'Save Medicine'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ConsumeModal({ token, medicine, onClose, onSaved }) {
  const [qty, setQty] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/medicines/consume', { medicine_id: medicine.id, quantity_used: Number(qty) }, token);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="section-title">Log Consumption — {medicine.name}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={15} /></button>
        </div>
        <Alert type="error" message={error} />
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="label">Quantity used (current: {medicine.current_quantity} {medicine.unit})</label>
            <input type="number" min="1" max={medicine.current_quantity} className="input-field" value={qty} onChange={(e) => setQty(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? <InlineLoader /> : 'Log Consumption'}
          </button>
        </form>
      </div>
    </div>
  );
}
