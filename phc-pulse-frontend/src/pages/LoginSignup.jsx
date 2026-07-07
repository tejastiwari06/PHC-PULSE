import React, { useState, useEffect } from 'react';
import { Activity, Building2, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import Alert from '../components/shared/Alert';
import { InlineLoader } from '../components/shared/Loader';

export default function LoginSignup() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('phc_staff');
  const [phcList, setPhcList] = useState([]);
  const [loadingPhcs, setLoadingPhcs] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phcId, setPhcId] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'signup' && role === 'phc_staff') {
      setLoadingPhcs(true);
      api.get('/api/phc-centers/')
        .then((data) => setPhcList(data || []))
        .catch(() => setPhcList([]))
        .finally(() => setLoadingPhcs(false));
    }
  }, [mode, role]);

  const resetFields = () => {
    setError('');
    setFullName('');
    setPassword('');
    setPhcId('');
  };

  const switchMode = (next) => {
    setMode(next);
    resetFields();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (role === 'phc_staff' && !phcId) {
          throw new Error('Please select your PHC');
        }
        await signup({
          full_name: fullName,
          email,
          password,
          role,
          phc_id: role === 'phc_staff' ? Number(phcId) : null,
        });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <Activity size={26} strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="auth-title">PHC Pulse</h1>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Sign in to your dashboard' : 'Create a new account'}
        </p>

        <div className="auth-toggle">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')} type="button">
            Login
          </button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')} type="button">
            Sign Up
          </button>
        </div>

        <Alert type="error" message={error} />

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="field-group">
              <label className="label">Full Name</label>
              <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          )}

          <div className="field-group">
            <label className="label">Email</label>
            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="field-group">
            <label className="label">Password</label>
            <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} />
          </div>

          {mode === 'signup' && (
            <>
              <div className="field-group">
                <label className="label">Role</label>
                <div className="role-picker">
                  <div
                    className={`role-option ${role === 'phc_staff' ? 'active' : ''}`}
                    onClick={() => setRole('phc_staff')}
                  >
                    <UserRound size={16} style={{ marginBottom: 4 }} />
                    <div>PHC Staff</div>
                  </div>
                  <div
                    className={`role-option ${role === 'district_officer' ? 'active' : ''}`}
                    onClick={() => setRole('district_officer')}
                  >
                    <Building2 size={16} style={{ marginBottom: 4 }} />
                    <div>District Officer</div>
                  </div>
                </div>
              </div>

              {role === 'phc_staff' && (
                <div className="field-group">
                  <label className="label">Primary Health Center (PHC)</label>
                  {loadingPhcs ? (
                    <InlineLoader />
                  ) : (
                    <select className="input-field" value={phcId} onChange={(e) => setPhcId(e.target.value)} required>
                      <option value="">Select a PHC</option>
                      {phcList.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} — {p.district}</option>
                      ))}
                    </select>
                  )}
                  {!loadingPhcs && phcList.length === 0 && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: 6 }}>
                      No PHCs exist yet. A District Officer must add one first.
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting} style={{ marginTop: 6 }}>
            {submitting ? <InlineLoader /> : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
