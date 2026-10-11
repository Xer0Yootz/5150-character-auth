import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Icon } from '../icons.jsx';
import WorldViewer from '../components/WorldViewer.jsx';

const MODES = [
  { id: 'procedural', label: 'Procedural' },
  { id: 'skybox', label: 'Skybox' },
  { id: 'plate', label: 'Plate' }
];

export default function HubPage({ user, character, setUser }) {
  const navigate = useNavigate();
  const [lightsOn, setLightsOn] = useState(() => {
    const saved = localStorage.getItem('5150-lights');
    return saved === null ? true : saved === 'on';
  });
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('5150-view') || 'procedural');

  useEffect(() => {
    localStorage.setItem('5150-lights', lightsOn ? 'on' : 'off');
  }, [lightsOn]);

  useEffect(() => {
    localStorage.setItem('5150-view', viewMode);
  }, [viewMode]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    navigate('/');
  }

  return (
    <main className="page-shell">
      <div className="panel hub-panel">
        <div className="title-wrap">
          <span className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="hex" /></span>
          <h1>{character?.codename || user.name}</h1>
          <p className="hub-meta">{character?.caste} / {character?.tribe}</p>
        </div>

        <div className="view-modes">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={viewMode === m.id ? 'mode-btn active' : 'mode-btn'}
              onClick={() => setViewMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <WorldViewer
            modelUrl={character?.modelUrl}
            worldUrl={character?.worldUrl}
            viewMode={viewMode}
            plateUrl={character?.plateUrl || '/garden-shore.jpg'}
            height={280}
            lightsOn={lightsOn}
          />
          <button
            type="button"
            className="lights-bulb"
            onClick={() => setLightsOn((v) => !v)}
            aria-label={lightsOn ? 'Turn off the lights' : 'Turn on the lights'}
            style={{ position: 'absolute', top: 8, right: 8 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18h6" />
              <path d="M10 22h4" />
              <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
            </svg>
          </button>
        </div>

        <nav className="hub-actions">
          <Link className="btn primary" to="/chat"><Icon name="chat" /> Chat</Link>
          <Link className="btn ghost" to="/character/edit"><Icon name="avatar" /> Edit Avatar</Link>
          <Link className="btn ghost" to="/dashboard"><Icon name="repos" /> Repos</Link>
          <button type="button" className="btn ghost" onClick={logout} aria-label="Log out"><Icon name="logout" /> Log out</button>
        </nav>
      </div>
    </main>
  );
}
