import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Alert({ type = 'error', message }) {
  if (!message) return null;
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  return (
    <div className={`alert alert-${type}`}>
      <Icon size={18} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{message}</span>
    </div>
  );
}
