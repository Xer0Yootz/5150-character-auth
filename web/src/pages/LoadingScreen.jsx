import { useState } from 'react';

const LINES = [
  'Waking up… the city is listening.',
  'Session first. Caste second.',
  'The bar is the real call, not a loop.'
];

export default function LoadingScreen({ progress = 0, label = 'Reading the session…', onSkip }) {
  const [lineIndex, setLineIndex] = useState(0);
  const width = Math.max(0, Math.min(100, progress));

  function cycleLine() {
    setLineIndex((index) => (index + 1) % LINES.length);
  }

  return (
    <main className="loading-shell">
      <div className="loading-content">
        <div className="hexa-intro">
          <button type="button" className="hexa-name hexa-button" onClick={cycleLine}>
            HEXA
          </button>
          <p className="hexa-speak">{LINES[lineIndex]}</p>
        </div>

        <div className="loading-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={width}>
          <div className="loading-progress" style={{ width: `${width}%` }}></div>
        </div>

        <p className="loading-text">{label}</p>
        <p className="loading-percent">{width}%</p>

        <button type="button" className="btn ghost" onClick={onSkip} disabled={!onSkip}>
          Skip
        </button>
      </div>
    </main>
  );
}
