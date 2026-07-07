import React, { useState, useRef } from 'react';
import { ScanLine, Upload, Check, X, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import Alert from '../shared/Alert';
import { InlineLoader } from '../shared/Loader';
import PulseDivider from '../shared/PulseDivider';

function confidenceClass(c) {
  if (c >= 80) return 'confidence-high';
  if (c >= 50) return 'confidence-mid';
  return 'confidence-low';
}

export default function ScanStock({ onSaved }) {
  const { token } = useAuth();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [extracted, setExtracted] = useState(null); // array of items, editable
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setExtracted(null);
    setError('');
    setSuccess('');
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await api.postForm('/api/medicines/scan', formData, token);
      setExtracted(
        (data.extracted_items || []).map((item) => ({
          name: item.name,
          current_quantity: item.quantity,
          expiry_date: item.expiry_date || '',
          unit: 'tablets',
          confidence: item.confidence,
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const updateItem = (idx, field, value) => {
    setExtracted((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  const removeItem = (idx) => {
    setExtracted((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = extracted.map(({ confidence, ...rest }) => rest);
      await api.post('/api/medicines/confirm-scan', payload, token);
      setSuccess('Stock saved successfully.');
      setExtracted(null);
      setFile(null);
      setPreview(null);
      onSaved && onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="section-eyebrow">AI-assisted entry</div>
      <h3 className="section-title"><ScanLine size={18} color="var(--teal-700)" /> Scan Stock Register</h3>
      <PulseDivider />

      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      {!extracted && (
        <>
          <div
            className={`dropzone ${dragActive ? 'drag-active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
          >
            {preview ? (
              <img src={preview} alt="preview" style={{ maxHeight: 180, borderRadius: 8, marginBottom: 10 }} />
            ) : (
              <Upload size={28} style={{ marginBottom: 8 }} />
            )}
            <p style={{ fontWeight: 600 }}>{file ? file.name : 'Click or drag a photo of your stock register'}</p>
            <p style={{ fontSize: '0.78rem', marginTop: 4 }}>JPG or PNG</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          <button
            className="btn btn-coral btn-block"
            style={{ marginTop: 16 }}
            disabled={!file || scanning}
            onClick={handleScan}
          >
            {scanning ? <><InlineLoader /> Reading register...</> : 'Run AI Scan'}
          </button>
        </>
      )}

      {extracted && (
        <>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: 14 }}>
            Review and edit before saving. Confidence score shows how sure the AI is about each reading —
            please double-check anything marked low or medium.
          </p>
          {extracted.length === 0 ? (
            <div className="empty-state">
              <ScanLine size={32} />
              <p>No items left. Add manually instead, or scan another photo.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Expiry</th>
                  <th>Confidence</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {extracted.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <input className="input-field" style={{ padding: '6px 8px' }} value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)} />
                    </td>
                    <td>
                      <input type="number" className="input-field" style={{ padding: '6px 8px', width: 80 }}
                        value={item.current_quantity}
                        onChange={(e) => updateItem(idx, 'current_quantity', e.target.value)} />
                    </td>
                    <td>
                      <input type="date" className="input-field" style={{ padding: '6px 8px' }}
                        value={item.expiry_date || ''}
                        onChange={(e) => updateItem(idx, 'expiry_date', e.target.value)} />
                    </td>
                    <td>
                      <span className={`confidence-tag ${confidenceClass(item.confidence)}`}>
                        {item.confidence}%
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeItem(idx)}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => { setExtracted(null); setFile(null); setPreview(null); }}>
              <X size={15} /> Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={saving || extracted.length === 0}
              onClick={handleConfirm}
            >
              {saving ? <InlineLoader /> : <><Check size={15} /> Confirm & Save</>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
