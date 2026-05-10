import { useEffect, useState } from 'react';
import api from '../api.js';

/**
 * Proactive check: if /api/health fails, show setup instructions before the user submits.
 */
export default function ApiStatusBanner() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/health', { timeout: 5000 })
      .then((res) => {
        if (!cancelled && res.data?.ok) setStatus('ok');
      })
      .catch(() => {
        if (!cancelled) setStatus('offline');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'checking' || status === 'ok') return null;

  return (
    <div className="api-offline-banner" role="alert">
      <strong>Backend is not running (or not on port 5000).</strong> Registration cannot work until
      the API is up. In a <strong>new terminal</strong>:{' '}
      <code>cd server</code> → <code>npm run dev</code>. You should see &quot;MongoDB connected&quot;
      and &quot;Server listening&quot;. Copy <code>server/.env.example</code> to{' '}
      <code>server/.env</code> and start MongoDB.
    </div>
  );
}
