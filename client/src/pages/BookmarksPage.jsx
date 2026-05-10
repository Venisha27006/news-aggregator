import { useEffect, useState } from 'react';
import api from '../api.js';
import NewsCard from '../components/NewsCard.jsx';
import '../App.css';

export default function BookmarksPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get('/articles/bookmarks')
      .then((res) => {
        if (!cancelled) {
          setItems(res.data?.items || []);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.response?.data?.message || 'Could not load saved articles');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleBookmarkChange(articleId, bookmarked) {
    // If user un-saves in this view, remove from list
    if (!bookmarked) {
      setItems((prev) => prev.filter((a) => a.id !== articleId));
    }
  }

  return (
    <main className="feed-page">
      <div className="feed-header">
        <h2>Saved articles</h2>
        <p>Stories you starred to read later.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading && (
        <div className="feed-status">
          <div className="spinner" aria-label="Loading saved" />
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="feed-status">You have no saved articles yet.</div>
      )}

      {items.map((article) => (
        <NewsCard
          key={article.id || article._id}
          article={article}
          onBookmarkChange={handleBookmarkChange}
        />
      ))}
    </main>
  );
}

