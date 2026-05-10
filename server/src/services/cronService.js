import cron from 'node-cron';
import { fetchAndStoreNews } from './newsService.js';

/**
 * Runs news fetch every 10 minutes (cron: at minute 0,10,20,...)
 */
export function startNewsCron() {
  // Every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      await fetchAndStoreNews();
    } catch (e) {
      console.error('[cron] news fetch failed', e);
    }
  });
  console.log('[cron] News fetch scheduled every 10 minutes');
}
