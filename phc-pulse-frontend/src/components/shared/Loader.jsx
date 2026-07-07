import React from 'react';

export function InlineLoader() {
  return <span className="loader" />;
}

export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="loader-center">
      <span className="loader" style={{ marginRight: 10 }} />
      <span style={{ color: 'var(--ink-soft)', fontSize: '0.88rem' }}>{label}</span>
    </div>
  );
}
