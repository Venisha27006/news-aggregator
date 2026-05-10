import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getRequestErrorMessage } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ApiStatusBanner from '../components/ApiStatusBanner.jsx';
import '../App.css';

export default function SignupPage() {
  const { loginWithToken } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
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
        <h1>Create account</h1>
        <p className="auth-sub">Choose your own secure password (min. 8 characters)</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Sign up'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
