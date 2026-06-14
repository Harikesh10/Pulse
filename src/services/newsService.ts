import { demoArticles } from '../data/news';
import { Article } from '../types';

const API_URL = process.env.EXPO_PUBLIC_NEWS_API_URL;

/**
 * The mobile app consumes a normalized feed. A server-side aggregator should
 * handle publisher APIs/RSS feeds, caching, deduplication and usage terms.
 */
export async function getLatestNews(): Promise<Article[]> {
  if (!API_URL) return demoArticles;

  try {
    const response = await fetch(`${API_URL.replace(/\/$/, '')}/articles`);
    if (!response.ok) throw new Error(`News API returned ${response.status}`);

    const payload = await response.json();
    const articles = Array.isArray(payload) ? payload : payload.articles;
    if (!Array.isArray(articles)) throw new Error('News API response does not contain an article array');
    return articles;
  } catch (error) {
    console.warn('Could not load the configured news API. Using demo feed.', error);
    return demoArticles;
  }
}
