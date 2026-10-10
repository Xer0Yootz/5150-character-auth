import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../App.jsx';

export default function DashboardPage({ user, onUserChange }) {
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [repos, setRepos] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function load() {
      const characterResponse = await fetch(`${API_URL}/api/character/me`, { credentials: 'include' });
      if (characterResponse.ok) {
        const data = await characterResponse.json();
        setCharacter(data.character);
      }
      const repoResponse = await fetch(`${API_URL}/api/repos/saved`, { credentials: 'include' });
      if (repoResponse.ok) {
        const data = await repoResponse.json();
        setRepos(data.repos || []);
      }
    }
    load();
  }, []);

  const logout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    onUserChange(null);
    navigate('/');
  };

  const search = async (event) => {
    event.preventDefault();
    const response = await fetch(`${API_URL}/api/repos/search?q=${encodeURIComponent(query)}`, { credentials: 'include' });
    const data = await response.json();
    setResults(data.repos || []);
  };

  const saveRepo = async (repo) => {
    await fetch(`${API_URL}/api/repos/save`, {
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
    const response = await fetch(`${API_URL}/api/repos/saved`, { credentials: 'include' });
    const data = await response.json();
    setRepos(data.repos || []);
  };

  return (
    <main>
      <h1>{user.name}</h1>
      <button type="button" onClick={logout}>Log out</button>
      {!character && <p>No character yet. <Link to="/character">Create one</Link></p>}
      {character && (
        <section className="panel">
          <h2>{character.codename}</h2>
          <p>{character.caste} / {character.tribe}</p>
          <p>{character.zodiac}. {character.climate}. {character.element}.</p>
          <p>{(character.abilities || []).join(', ')}</p>
        </section>
      )}
      <form onSubmit={search}>
        <label>Search GitHub<input value={query} onChange={(e) => setQuery(e.target.value)} /></label>
        <button type="submit">Search</button>
      </form>
      {results.map((repo) => (
        <p key={repo.id}>{repo.name} <button type="button" onClick={() => saveRepo(repo)}>Save</button></p>
      ))}
      <h2>Saved repos</h2>
      {repos.map((repo) => <p key={repo.id}>{repo.repo_name}: {repo.ability_unlock}</p>)}
      <p><Link to="/chat">Open chat</Link></p>
    </main>
  );
}
