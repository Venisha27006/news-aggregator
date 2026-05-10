import { useEffect, useState } from 'react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { NEWS_CATEGORIES } from '../constants.js';
import '../App.css';

export default function PreferencesPage() {
  const { user, refreshUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.preferences) {
      setCategories(user.preferences.categories || []);
      setKeywords(user.preferences.keywords || []);
    }
  }, [user]);

  function toggleCategory(value) {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  }

  function addKeyword(e) {
    e.preventDefault();
    const k = keywordInput.trim();
    if (!k) return;
    if (keywords.includes(k)) {
      setKeywordInput('');
      return;
    }
    setKeywords((prev) => [...prev, k]);
    setKeywordInput('');
  }

  function removeKeyword(k) {
    setKeywords((prev) => prev.filter((x) => x !== k));
  }

  async function save() {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.put('/user/preferences', { categories, keywords });
      await refreshUser();
      setMessage('Preferences saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="prefs-page">
      <div className="feed-header">
        <h2>Preferences</h2>
        <p>Pick categories and keywords — your home feed uses these to filter articles.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {message && (
        <div
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 10,
            background: 'rgba(13, 148, 136, 0.12)',
            color: 'var(--accent)',
            marginBottom: '1rem',
          }}
        >
          {message}
        </div>
      )}

      <section className="prefs-section">
        <h3>Categories</h3>
        <div className="checkbox-grid">
          {NEWS_CATEGORIES.map(({ value, label }) => (
            <label key={value} className="checkbox-item">
              <input
                type="checkbox"
                checked={categories.includes(value)}
                onChange={() => toggleCategory(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="prefs-section">
        <h3>Keywords</h3>
        <form onSubmit={addKeyword} className="keyword-row">
          <input
            type="text"
            placeholder="e.g. AI, Cricket, Tesla"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
          />
          <button type="submit" className="btn btn-ghost">
            Add
          </button>
        </form>
        <div className="keyword-tags">
          {keywords.map((k) => (
            <span key={k} className="tag">
              {k}
              <button type="button" onClick={() => removeKeyword(k)} aria-label={`Remove ${k}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      </section>

      <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save preferences'}
      </button>
    </main>
  );
}
