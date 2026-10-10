import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SignupPage({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form)
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || 'Signup failed.');
      return;
    }

    setUser(data.user);
    navigate('/');
  }

  return (
    <main className="page-shell">
      <div className="panel">
        <div className="title-wrap">
          <span className="tag">5150</span>
          <h1>Create Account</h1>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input name="name" type="text" onChange={handleChange} placeholder="Your name" required />
          </label>

          <label>
            <span>Email</span>
            <input name="email" type="email" onChange={handleChange} placeholder="you@example.com" required />
          </label>

          <label>
            <span>Password</span>
            <input name="password" type="password" onChange={handleChange} placeholder="••••••••" required />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="switch">
          Already on the network? <Link to="/">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
