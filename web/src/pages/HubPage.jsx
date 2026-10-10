import { Link, useNavigate } from 'react-router-dom';

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
          <Link className="btn primary" to="/chat">Chat</Link>
          <Link className="btn ghost" to="/character/edit">Edit character</Link>
          <Link className="btn ghost" to="/dashboard">Repos</Link>
          <button type="button" className="btn ghost" onClick={logout}>Log out</button>
        </nav>
      </div>
    </main>
  );
}
