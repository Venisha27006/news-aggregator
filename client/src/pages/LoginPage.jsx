import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getRequestErrorMessage } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ApiStatusBanner from '../components/ApiStatusBanner.jsx';
import '../App.css';

export default function LoginPage() {
  const { loginWithToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      loginWithToken(data.token, data.user);
    } catch (err) {
      setError(getRequestErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-center">
      <ApiStatusBanner />
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to your personalized feed</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-footer">
          No account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
