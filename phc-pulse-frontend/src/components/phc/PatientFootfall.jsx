import React, { useEffect, useState } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import Alert from '../shared/Alert';
import { InlineLoader } from '../shared/Loader';
import PulseDivider from '../shared/PulseDivider';

export default function PatientFootfall() {
  const { token } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [count, setCount] = useState('');
  const [symptomTag, setSymptomTag] = useState('');
  const [symptomCount, setSymptomCount] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPrediction = () => {
    api.get('/api/operations/footfall/predict', token).then(setPrediction).catch(() => {});
  };

  useEffect(loadPrediction, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/api/operations/footfall', {
        date,
        patient_count: Number(count),
        symptom_tag: symptomTag || null,
        symptom_count: symptomCount ? Number(symptomCount) : 0,
      }, token);
      setSuccess('Footfall recorded.');
      setCount('');
      setSymptomTag('');
      setSymptomCount('');
      loadPrediction();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="section-eyebrow">Daily entry</div>
      <h3 className="section-title"><Users size={18} color="var(--teal-700)" /> Patient Footfall</h3>
      <PulseDivider />

      {prediction?.predicted_count != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--teal-100)', padding: '12px 16px', borderRadius: 10, marginBottom: 18 }}>
          <TrendingUp size={18} color="var(--teal-700)" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Tomorrow's expected footfall: <span className="mono-num">{prediction.predicted_count}</span> patients
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--ink-soft)' }}>Based on last {prediction.based_on_days} days</div>
          </div>
        </div>
      )}

      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="field-group">
            <label className="label">Date</label>
            <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="field-group">
            <label className="label">Patient Count</label>
            <input type="number" min="0" className="input-field" value={count} onChange={(e) => setCount(e.target.value)} required />
          </div>
        </div>
        <div className="grid-2">
          <div className="field-group">
            <label className="label">Symptom Tag (optional)</label>
            <input className="input-field" placeholder="e.g. fever" value={symptomTag} onChange={(e) => setSymptomTag(e.target.value)} />
          </div>
          <div className="field-group">
            <label className="label">Symptom Count (optional)</label>
            <input type="number" min="0" className="input-field" value={symptomCount} onChange={(e) => setSymptomCount(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? <InlineLoader /> : 'Record Footfall'}
        </button>
      </form>
    </div>
  );
}
