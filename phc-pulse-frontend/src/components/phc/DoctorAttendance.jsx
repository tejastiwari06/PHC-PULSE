import React, { useState } from 'react';
import { Stethoscope, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import Alert from '../shared/Alert';
import { InlineLoader } from '../shared/Loader';
import PulseDivider from '../shared/PulseDivider';

export default function DoctorAttendance() {
  const { token, user } = useAuth();
  const [status, setStatus] = useState('none'); // none | checked_in | checked_out
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCheckIn = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/operations/attendance/check-in', { phc_id: user.phc_id }, token);
      setStatus('checked_in');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/operations/attendance/check-out', {}, token);
      setStatus('checked_out');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="section-eyebrow">Presence log</div>
      <h3 className="section-title"><Stethoscope size={18} color="var(--teal-700)" /> My Attendance</h3>
      <PulseDivider />

      <Alert type="error" message={error} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className={`badge ${status === 'checked_in' ? 'badge-success' : status === 'checked_out' ? 'badge-neutral' : 'badge-warning'}`}>
          {status === 'checked_in' ? 'Checked in' : status === 'checked_out' ? 'Checked out' : 'Not checked in today'}
        </span>

        {status !== 'checked_in' ? (
          <button className="btn btn-primary" disabled={submitting || status === 'checked_out'} onClick={handleCheckIn}>
            {submitting ? <InlineLoader /> : <><LogIn size={15} /> Check In</>}
          </button>
        ) : (
          <button className="btn btn-coral" disabled={submitting} onClick={handleCheckOut}>
            {submitting ? <InlineLoader /> : <><LogOut size={15} /> Check Out</>}
          </button>
        )}
      </div>
    </div>
  );
}
