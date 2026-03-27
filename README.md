# 🌉 Sydney Entertainment Hub

Your 2-hour plan starts here — going out or staying in?

**Live:** [sydney-entertainment.vercel.app](https://sydney-entertainment.vercel.app)

## What is this?

A cinema & streaming guide for Sydney, with two modes:

- **🌃 Night Out** — Curated Sydney cinema picks by mood (Retro / Fancy / Big Screen) and area (CBD / Inner West / East / North Shore), with film festival alerts and deal badges
- **🛋️ Cosy Night In** — What's streaming on Netflix AU, Stan, Disney+, BINGE — triple-rated with IMDb, Rotten Tomatoes & Douban scores

## Features

- 🎬 6 curated Sydney cinemas with editorial recommendations (Why / For / Tonight)
- 📊 Triple-rating system: IMDb + 🍅 Rotten Tomatoes + 豆 Douban
- 🔍 Filter by platform, genre, language, and sort by Top Rated / Trending / New
- 🌧️ Dynamic background that changes with Sydney's real-time weather & time of day
- 🌉 Sydney skyline silhouette (Opera House, Harbour Bridge, Sydney Tower)
- 🎪 Auto-detecting film festival banners (Palace French Film Festival, SFF, etc.)
- 📱 Mobile responsive

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 + Framer Motion
- **APIs:** TMDB (movies + AU streaming providers), OMDB (IMDb + RT scores), DoubanInfo (Douban scores), wttr.in (Sydney weather)
- **Deployment:** Vercel

## Getting Started

```bash
npm install
cp .env.local.example .env.local  # Add your API keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Source | Required |
|----------|--------|----------|
| `TMDB_API_KEY` | [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) | Yes |
| `OMDB_API_KEY` | [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx) | Yes |
| `DOUBANINFO_API_KEY` | [doubaninfo.com](https://doubaninfo.com) | Optional |

## Deploy

Push to GitHub → connect to [Vercel](https://vercel.com) → add env vars → deploy. That's it.
