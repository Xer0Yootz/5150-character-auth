export default function LoadingScreen({ progress = 0, label = 'Reading the session…' }) {
  const width = Math.max(0, Math.min(100, progress));

  return (
    <main className="loading-shell">
      <div className="loading-content">
        <div className="hexa-intro">
          <span className="hexa-name">HEXA</span>
          <p className="hexa-speak">Waking up… the city is listening.</p>
        </div>

        <div className="loading-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={width}>
          <div className="loading-progress" style={{ width: `${width}%` }}></div>
        </div>

        <p className="loading-text">{label}</p>
      </div>
    </main>
  );
}
