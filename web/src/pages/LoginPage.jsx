import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../icons.jsx';

export default function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form)
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || 'Login failed.');
      return;
    }

    setUser(data.user);
    navigate('/');
  }

  return (
    <main className="page-shell">
      <div className="panel">
        <div className="title-wrap">
          <span className="tag">Neon Vigil</span>
          <h1>Login</h1>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input name="email" type="email" onChange={handleChange} placeholder="you@example.com" required />
          </label>

          <label>
            <span>Password</span>
            <input name="password" type="password" onChange={handleChange} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="btn primary" type="submit" disabled={loading} aria-label="Log in">
            <Icon name="login" /> {loading ? 'Signing in\u2026' : 'Log in'}
          </button>
        </form>

        <div className="divider"><span>or</span></div>

        <div className="oauth-row">
          <a className="btn ghost" href="/auth/google">Google</a>
          <a className="btn ghost" href="/auth/github">GitHub</a>
        </div>

        <p className="hub-meta" style={{ marginTop: 12, fontSize: 12 }}>BitChat login not active.</p>

        <p className="switch">
          New to the network? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
