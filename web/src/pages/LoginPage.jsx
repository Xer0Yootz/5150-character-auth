import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../App.jsx';

export default function LoginPage({ onUserChange }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      onUserChange(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
        <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Logging in' : 'Log in'}</button>
      </form>
      <p><a href={`${API_URL}/auth/google`}>Continue with Google</a></p>
      <p><a href={`${API_URL}/auth/github`}>Continue with GitHub</a></p>
      <p>Need an account? <Link to="/signup">Sign up</Link></p>
    </main>
  );
}
