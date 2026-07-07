import React from 'react';

/* Signature motif: an ECG-style pulse trace, used as a divider under section titles */
export default function PulseDivider() {
  return (
    <svg className="pulse-divider" viewBox="0 0 400 20" preserveAspectRatio="none">
      <path d="M0 10 H140 L155 10 L162 2 L172 18 L180 10 H400" />
    </svg>
  );
}
