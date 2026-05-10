import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import NewsCard from '../components/NewsCard.jsx';
import '../App.css';

const PAGE_SIZE = 10;

export default function HomePage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const sentinelRef = useRef(null);
  /** Next offset for pagination — avoids stale state in IntersectionObserver */
  const nextSkipRef = useRef(0);

  const hasMore = items.length < total;

  const load = useCallback(async (append) => {
    const fromSkip = append ? nextSkipRef.current : 0;
    if (append) setLoadingMore(true);
    else {
      setLoading(true);
      nextSkipRef.current = 0;
    }
    setError('');
    try {
      const { data } = await api.get('/articles', {
        params: { skip: fromSkip, limit: PAGE_SIZE },
      });
      setTotal(data.total);
      const batch = data.items || [];
      nextSkipRef.current = fromSkip + batch.length;
      setItems((prev) => (append ? [...prev, ...batch] : batch));
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load articles');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;

    const obs = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting || loading || loadingMore || !hasMore) return;
        load(true);
      },
      { root: null, rootMargin: '240px', threshold: 0 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [load, loading, loadingMore, hasMore]);

  function handleBookmarkChange(articleId, bookmarked) {
    setItems((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, bookmarked } : a))
    );
  }

  const prefs = user?.preferences;
  const hasPrefs =
    (prefs?.categories?.length || 0) > 0 || (prefs?.keywords?.length || 0) > 0;

  return (
    <main className="feed-page">
      <div className="feed-header">
        <h2>Your feed</h2>
        <p>
          {hasPrefs
            ? 'Stories matching your categories and keywords, newest first.'
            : 'Set preferences to personalize — until then you will see all latest articles.'}
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading && items.length === 0 && (
        <div className="feed-status">
          <div className="spinner" aria-label="Loading" />
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="feed-status">No articles yet. Check back after the next sync.</div>
      )}

      {items.map((article) => (
        <NewsCard
          key={article.id || article._id}
          article={article}
          onBookmarkChange={handleBookmarkChange}
        />
      ))}

      <div ref={sentinelRef} className="load-more-sentinel" aria-hidden />

      {loadingMore && (
        <div className="feed-status">
          <div className="spinner" aria-label="Loading more" />
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="feed-status">You&apos;re all caught up.</div>
      )}
    </main>
  );
}
