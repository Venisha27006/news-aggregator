import axios from 'axios';
import { Article } from '../models/Article.js';

/** Categories we poll from NewsAPI (maps to API category slugs) */
export const SUPPORTED_CATEGORIES = [
  'technology',
  'sports',
  'business',
  'health',
  'entertainment',
  'science',
  'general',
];

/**
 * Fetches top headlines per category from NewsAPI and upserts into MongoDB.
 * Duplicates are skipped via unique index on `url`.
 */
export async function fetchAndStoreNews() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.warn('[news] NEWS_API_KEY missing — skipping fetch');
    return { inserted: 0, skipped: 0 };
  }

  const base = 'https://newsapi.org/v2';
  let inserted = 0;
  let skipped = 0;

  for (const category of SUPPORTED_CATEGORIES) {
    try {
      const params = {
        country: 'us',
        pageSize: 20,
        apiKey,
      };
      if (category !== 'general') {
        params.category = category;
      }
      const { data } = await axios.get(`${base}/top-headlines`, {
        params,
        timeout: 15000,
      });

      if (data.status !== 'ok' || !Array.isArray(data.articles)) continue;

      for (const a of data.articles) {
        if (!a.url || !a.title) {
          skipped++;
          continue;
        }
        try {
          await Article.create({
            title: a.title.trim(),
            description: (a.description || '').trim(),
            url: a.url.trim(),
            imageUrl: (a.urlToImage || '').trim(),
            source: a.source?.name || '',
            category: category,
            publishedAt: a.publishedAt ? new Date(a.publishedAt) : new Date(),
          });
          inserted++;
        } catch (e) {
          if (e.code === 11000) skipped++;
          else throw e;
        }
      }
    } catch (err) {
      console.error(`[news] category ${category}:`, err.message);
    }
  }

  console.log(`[news] fetch done: inserted=${inserted}, duplicate/other skip=${skipped}`);
  return { inserted, skipped };
}
