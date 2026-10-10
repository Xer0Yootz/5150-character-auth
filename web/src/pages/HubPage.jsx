import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../icons.jsx';

export default function HubPage({ user, character, setUser }) {
  const navigate = useNavigate();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    navigate('/');
  }

  return (
    <main className="page-shell">
      <div className="panel hub-panel">
        <div className="title-wrap">
          <span className="tag">5150</span>
          <h1>{character?.codename || user.name}</h1>
          <p className="hub-meta">{character?.caste} / {character?.tribe}</p>
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
