import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CharacterCreation({ setCharacter, existing }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    codename: existing?.codename || '',
    birthday: existing?.birthday || '',
    location: existing?.location || '',
    latitude: existing?.latitude ?? '',
    longitude: existing?.longitude ?? ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/character/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude)
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Character save failed');
      setCharacter(data.character);
      navigate('/hub');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="page-shell">
      <div className="panel">
        <div className="title-wrap">
          <span className="tag">5150</span>
          <h1>{existing ? 'Edit Avatar' : 'Create character'}</h1>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label><span>Codename</span><input value={form.codename} onChange={(e) => setForm({ ...form, codename: e.target.value })} required /></label>
          <label><span>Birthday</span><input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} required /></label>
          <label><span>Location</span><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></label>
          <label><span>Latitude</span><input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} required /></label>
          <label><span>Longitude</span><input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} required /></label>
          {error && <p className="error">{error}</p>}
          <button className="btn primary" type="submit">{existing ? 'Save' : 'Assign caste'}</button>
        </form>
      </div>
    </main>
  );
}
