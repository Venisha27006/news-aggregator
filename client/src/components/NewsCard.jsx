import api from '../api.js';

export default function NewsCard({ article, onBookmarkChange }) {
  const {
    id,
    title,
    description,
    url,
    imageUrl,
    source,
    category,
    publishedAt,
    bookmarked,
  } = article;

  const dateStr = publishedAt
    ? new Date(publishedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

  async function handleBookmark(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data } = await api.post(`/user/bookmarks/${id}`);
      const ids = (data.bookmarks || []).map(String);
      onBookmarkChange?.(id, ids.includes(String(id)));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <article className="news-card">
      <div className="news-card-image-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt="" loading="lazy" />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              minHeight: 100,
              background: 'linear-gradient(135deg, var(--border), var(--bg))',
            }}
          />
        )}
      </div>
      <div className="news-card-body">
        <div className="news-card-meta">
          {category && <span className="badge">{category}</span>}
          {source && <span>{source}</span>}
          {dateStr && <span>{dateStr}</span>}
        </div>
        <h3 className="news-card-title">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
        </h3>
        {description && <p className="news-card-desc">{description}</p>}
        <div className="card-actions">
          <button
            type="button"
            className={`btn-sm ${bookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmark}
          >
            {bookmarked ? '★ Saved' : '☆ Save'}
          </button>
        </div>
      </div>
    </article>
  );
}
