import axios from 'axios';

const api = axios.create({
  baseURL: 'https://news-aggregator-api-smoky.vercel.app/api', // v2
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('news_agg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Pull a human-readable message from JSON / HTML error bodies.
 */
function pickMessageFromData(data) {
  if (data == null) return '';
  if (typeof data === 'string') {
    const stripped = data.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return stripped.slice(0, 400);
  }
  if (typeof data === 'object') {
    if (Array.isArray(data.errors) && data.errors.length) {
      return data.errors
        .map((e) => (e && (e.msg || e.message)) || '')
        .filter(Boolean)
        .join(' ');
    }
    if (data.message != null && String(data.message).trim()) {
      return String(data.message);
    }
  }
  return '';
}

/**
 * Maps Axios / proxy / server errors to a clear, actionable message.
 */
export function getRequestErrorMessage(error) {
  if (!error) return 'Unknown error.';

  const res = error.response;
  const status = res?.status;
  const data = res?.data;

  // Vite dev proxy often returns 5xx when nothing listens on the target port
  if (status === 502 || status === 503 || status === 504) {
    return 'Cannot reach the API server (proxy error). Start the backend in a separate terminal: cd server → npm run dev. The API must listen on port 5000 (see server/.env).';
  }

  const fromBody = pickMessageFromData(data);
  if (fromBody) return fromBody;

  if (res) {
    const line = [status && `HTTP ${status}`, res.statusText].filter(Boolean).join(' ');
    const ax = error.message || '';
    if (line && ax) return `${line}. ${ax}`;
    if (line) return `${line}. No details in response body.`;
    return ax || 'The server returned an error with no message.';
  }

  const msg = error.message || '';
  const code = error.code || '';
  const causeStr = error.cause != null ? String(error.cause) : '';
  const blob = `${msg} ${code} ${causeStr}`;

  if (code === 'ECONNABORTED' || /timeout/i.test(msg)) {
    return 'Request timed out. Is the API running and is MongoDB reachable?';
  }

  if (
    code === 'ERR_NETWORK' ||
    /ECONNREFUSED|ENOTFOUND|Network Error|Failed to fetch|Load failed|network/i.test(blob)
  ) {
    return 'Cannot connect to the API. Open a second terminal, go to the "server" folder, run: npm run dev. Wait for "Server listening" and "MongoDB connected". Ensure server/.env exists (copy server/.env.example) and MongoDB is running.';
  }

  return msg || 'Request failed — open DevTools → Network, retry, and inspect the failing request.';
}

export default api;
