export default function LoadingScreen() {
  return (
    <main className="loading-shell">
      <div className="loading-content">
        <div className="hexa-intro">
          <span className="hexa-name">HEXA</span>
          <p className="hexa-speak">Waking up… the city is listening.</p>
        </div>

        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>

        <p className="loading-text">Your caste is being chosen…</p>
      </div>
    </main>
  );
}
