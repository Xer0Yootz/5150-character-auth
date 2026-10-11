import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../icons.jsx';

export default function DashboardPage({ user, character, setUser }) {
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function load() {
      const repoResponse = await fetch('/api/repos/saved', { credentials: 'include' });
      if (repoResponse.ok) {
        const data = await repoResponse.json();
        setRepos(data.repos || []);
      }
    }
    load();
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    navigate('/');
  };

  const search = async (event) => {
    event.preventDefault();
    const response = await fetch(`/api/repos/search?q=${encodeURIComponent(query)}`, { credentials: 'include' });
    const data = await response.json();
    setResults(data.repos || []);
  };

  const saveRepo = async (repo) => {
    await fetch('/api/repos/save', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repoName: repo.name,
        repoUrl: repo.url,
        repoOwner: repo.owner,
        language: repo.language
      })
    });
    const response = await fetch('/api/repos/saved', { credentials: 'include' });
    const data = await response.json();
    setRepos(data.repos || []);
  };

  return (
    <main className="page-shell">
      <div className="panel">
        <div className="title-wrap">
          <span className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="hex" /></span>
          <h1>{user.name}</h1>
        </div>
        <p><Link to="/hub" className="btn ghost" aria-label="Back" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, marginBottom: 12, padding: 0 }}><Icon name="back" /></Link></p>
        <section className="panel">
          <h2>{character.codename}</h2>
          <p>{character.caste} / {character.tribe}</p>
          <p>{character.zodiac}. {character.climate}. {character.element}.</p>
          <p>{(character.abilities || []).join(', ')}</p>
        </section>
        <form onSubmit={search}>
          <label>Search GitHub<input value={query} onChange={(e) => setQuery(e.target.value)} /></label>
          <button type="submit" className="btn ghost">Search</button>
        </form>
        {results.map((repo) => (
          <p key={repo.id}>{repo.name} <button type="button" onClick={() => saveRepo(repo)}>Save</button></p>
        ))}
        <h2>Saved repos</h2>
        {repos.map((repo) => <p key={repo.id}>{repo.repo_name}: {repo.ability_unlock}</p>)}
        <p style={{ marginTop: 12 }}><button type="button" className="btn ghost" onClick={logout}><Icon name="logout" /> Log out</button></p>
      </div>
    </main>
  );
}
