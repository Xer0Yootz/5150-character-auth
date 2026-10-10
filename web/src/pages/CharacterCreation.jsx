import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../App.jsx';

export default function CharacterCreation() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ codename: '', birthday: '', location: '', latitude: '', longitude: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/character/create`, {
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
      if (!response.ok) throw new Error(data.message || 'Character create failed');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main>
      <h1>Create character</h1>
      <form onSubmit={handleSubmit}>
        <label>Codename<input value={form.codename} onChange={(e) => setForm({ ...form, codename: e.target.value })} required /></label>
        <label>Birthday<input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} required /></label>
        <label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></label>
        <label>Latitude<input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} required /></label>
        <label>Longitude<input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} required /></label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Assign caste</button>
      </form>
    </main>
  );
}
