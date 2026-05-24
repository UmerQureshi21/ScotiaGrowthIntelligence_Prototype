# Banking UI Mockup

Visual-only banking app mockup for Chrome — no backend, no real data.

## Run in Chrome (localhost)

```bash
cd web
npm install
npm run dev
```

Opens at **http://localhost:5173** — a phone-sized banking UI centered on the page.

## What works

- Red header with greeting + search
- Attention card (expand/collapse → notification detail)
- Recommendation banner (Dismiss / View Details → expand)
- Account tabs, expandable banking rows, balances
- Credit / Borrowing / Investments cards
- Bottom tab navigation
- Back navigation on detail screens

## Plug in your recommendation text

Edit `web/src/data/mockData.ts` → `recommendationOutput`:

```ts
export const recommendationOutput = {
  summary: 'Your one-line output from your data pipeline',
  detail: '...',
  projectedOutcome: '...',
  ctaLabel: 'Open iTRADE',
  learnMoreUrl: 'https://...',
};
```

## Project layout

```
web/          ← Banking UI mockup (run this in Chrome)
```
