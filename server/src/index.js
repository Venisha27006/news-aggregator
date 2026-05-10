import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import { fetchAndStoreNews } from './services/newsService.js';

const app = express();
const PORT = process.env.PORT || 5000;

// In development, reflect any origin so Vite on 5173/5174 or 127.0.0.1 still works with VITE_API_URL.
const allowedOrigin = (process.env.CLIENT_URL || 'http://localhost:5173').trim().replace(/\/$/, '');
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigin : true,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'news-aggregator-api' });
});

// Vercel Cron hits this endpoint every 10 minutes
app.get('/api/cron/fetch-news', async (req, res) => {
  // Protect against unauthorized calls in production
  if (process.env.NODE_ENV === 'production' && req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    await fetchAndStoreNews();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/articles', articleRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use(errorHandler);

// Connect to DB (Vercel serverless: runs on each cold start)
connectDB(process.env.MONGODB_URI).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Local dev only
if (process.env.NODE_ENV !== 'production') {
  import('./services/cronService.js').then(({ startNewsCron }) => startNewsCron());
  fetchAndStoreNews().catch((e) => console.error('[bootstrap] initial news fetch', e));
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://127.0.0.1:${PORT}`);
  });
}

export default app;
