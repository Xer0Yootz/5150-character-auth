import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Icon } from '../icons.jsx';
import WorldViewer from '../components/WorldViewer.jsx';

const MODES = [
  { id: 'procedural', label: 'In World Preview' },
  { id: 'skybox', label: 'No Background Preview' }
];

export default function HubPage({ user, character, setUser }) {
  const navigate = useNavigate();
  const [lightsOn, setLightsOn] = useState(() => {
    const saved = localStorage.getItem('5150-lights');
    return saved === null ? true : saved === 'on';
  });
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('5150-view') || 'procedural');
  const [chatOpen, setChatOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [weather, setWeather] = useState('');

  useEffect(() => {
    localStorage.setItem('5150-lights', lightsOn ? 'on' : 'off');
  }, [lightsOn]);

  useEffect(() => {
    localStorage.setItem('5150-view', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!character?.latitude || !character?.longitude) return;
    async function load() {
      try {
        const res = await fetch(`/api/weather?lat=${character.latitude}&lon=${character.longitude}`);
        if (!res.ok) return;
        const data = await res.json();
        setWeather(`${data.label} ${data.temp != null ? Math.round(data.temp) + '\u00b0C' : ''}`);
      } catch {
        setWeather('Weather unavailable');
      }
    }
    load();
  }, [character]);

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
              onClick={() => { setViewMode(m.id); setMapOpen(false); }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 8 }}>
          <button
            type="button"
            className="lights-bulb"
            onClick={() => setLightsOn((v) => !v)}
            aria-label={lightsOn ? 'Turn off the lights' : 'Turn on the lights'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18h6" />
              <path d="M10 22h4" />
              <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
            </svg>
          </button>
        </div>

        <WorldViewer
          modelUrl={character?.modelUrl}
          worldUrl={character?.worldUrl}
          viewMode={mapOpen ? 'plate' : viewMode}
          plateUrl={character?.plateUrl || '/garden-shore.jpg'}
          height={280}
          lightsOn={lightsOn}
        />

        {chatOpen && (
          <div className="panel" style={{ marginTop: 12, padding: 12 }}>
            <p className="hub-meta" style={{ marginBottom: 8 }}>Chat</p>
            <p className="hub-meta" style={{ fontSize: 12 }}>Hexa offline. BitChat groups load on the full chat page.</p>
            <Link className="btn ghost" to="/chat" style={{ marginTop: 8, display: 'inline-block' }}>Open full chat</Link>
          </div>
        )}

        <nav className="hub-actions" style={{ marginTop: 12 }}>
          <button type="button" className="btn primary" onClick={() => setChatOpen((v) => !v)}>
            <Icon name="chat" /> Chat
          </button>
          <button type="button" className={mapOpen ? 'btn primary' : 'btn ghost'} onClick={() => setMapOpen((v) => !v)}>
            MAP
          </button>
          <Link className="btn ghost" to="/character/edit"><Icon name="avatar" /> Edit Info</Link>
          <Link className="btn ghost" to="/dashboard"><Icon name="repos" /> Repos</Link>
          <button type="button" className="btn ghost" onClick={logout} aria-label="Log out"><Icon name="logout" /> Log out</button>
        </nav>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#8aa0b8' }}>
          GRID STATUS: {weather || 'reading'} \u00b7 {character?.location || 'no location'}
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 12, letterSpacing: '0.08em', color: '#8aa0b8' }}>Neon Vigil</p>
      </div>
    </main>
  );
}
