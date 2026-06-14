# PULSE Tech News

A clean, dark React Native news reader for global technology coverage. Built with Expo and TypeScript.

## Run

```bash
npm install
npm run android
```

Use `npm start` to scan the Expo QR code, or `npm run web` for the browser build.

## News data

The app includes a polished demo feed and supports a real aggregator API through:

```bash
EXPO_PUBLIC_NEWS_API_URL=https://your-api.example.com
```

The endpoint must expose `GET /articles` and return either an article array or `{ "articles": [...] }` matching `src/types.ts`.

Publisher APIs and RSS feeds should be collected server-side, where caching, deduplication, credentials, rate limits, robots rules, and publisher usage terms can be handled correctly. Direct website scraping from a mobile client is intentionally avoided.
