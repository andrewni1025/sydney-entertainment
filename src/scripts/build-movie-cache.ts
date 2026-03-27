// Script to pre-fetch top-rated movies and cache them as a JSON file
// Run with: npx tsx src/scripts/build-movie-cache.ts

import { readFileSync } from "fs";

// Load env vars manually
const envContent = readFileSync(".env.local", "utf-8");
const env: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) env[key.trim()] = vals.join("=").trim();
}

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY = env.TMDB_API_KEY;
const OMDB_BASE = "https://www.omdbapi.com";
const OMDB_KEY = env.OMDB_API_KEY;
const DOUBAN_BASE = "https://doubaninfo.com/api/v1_douban.php";
const DOUBAN_KEY = env.DOUBANINFO_API_KEY;

const PROVIDER_INFO: Record<number, { name: string; short: string }> = {
  8: { name: "Netflix", short: "N" },
  21: { name: "Stan", short: "S" },
  337: { name: "Disney+", short: "D+" },
  385: { name: "BINGE", short: "B" },
};

const GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
};

interface CachedMovie {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseDate: string;
  genres: string[];
  genreIds: number[];
  language: string;
  imdbId: string | null;
  tmdbScore: number;
  imdb: number | null;
  rottenTomatoes: number | null;
  rtFresh: boolean;
  douban: number | null;
  doubanOriginal: number | null;
  providers: number[];
}

async function tmdbFetch(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", TMDB_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json();
}

async function getOMDBRatings(imdbId: string) {
  try {
    const url = new URL(OMDB_BASE);
    url.searchParams.set("apikey", OMDB_KEY);
    url.searchParams.set("i", imdbId);
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { imdb: null, rt: null, rtFresh: false };
    const data = await res.json();
    if (data.Response !== "True") return { imdb: null, rt: null, rtFresh: false };

    const imdbRaw = parseFloat(data.imdbRating ?? "");
    const imdb = isNaN(imdbRaw) ? null : Math.round(imdbRaw * 10);

    let rt: number | null = null;
    const rtEntry = data.Ratings?.find((r: { Source: string }) => r.Source === "Rotten Tomatoes");
    if (rtEntry) {
      const parsed = parseInt(rtEntry.Value);
      if (!isNaN(parsed)) rt = parsed;
    }

    return { imdb, rt, rtFresh: (rt ?? 0) >= 60 };
  } catch {
    return { imdb: null, rt: null, rtFresh: false };
  }
}

async function getDoubanRating(imdbId: string) {
  if (!DOUBAN_KEY) return { score: null, original: null };
  try {
    const url = new URL(DOUBAN_BASE);
    url.searchParams.set("url", imdbId);
    url.searchParams.set("key", DOUBAN_KEY);
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return { score: null, original: null };
    const data = await res.json();
    const rawRating = data?.rating;
    const scoreStr = String(
      data?.douban_score ??
      (typeof rawRating === "number" ? rawRating : rawRating?.average) ??
      ""
    );
    const s = parseFloat(scoreStr);
    if (!isNaN(s) && s > 0) return { score: Math.round(s * 10), original: s };
    return { score: null, original: null };
  } catch {
    return { score: null, original: null };
  }
}

async function getAUProviders(movieId: number) {
  try {
    const data = await tmdbFetch(`/movie/${movieId}/watch/providers`);
    const au = data.results?.AU;
    if (!au?.flatrate) return [];
    const supported = Object.keys(PROVIDER_INFO).map(Number);
    return au.flatrate
      .map((p: { provider_id: number }) => p.provider_id)
      .filter((id: number) => supported.includes(id));
  } catch {
    return [];
  }
}

async function main() {
  console.log("Building movie cache...\n");

  const allMovies: CachedMovie[] = [];
  const seenIds = new Set<number>();

  // Fetch top-rated movies (25 pages × 20 = 500 movies)
  const totalPages = 25;

  for (let page = 1; page <= totalPages; page++) {
    console.log(`Fetching TMDB page ${page}/${totalPages}...`);

    const data = await tmdbFetch("/discover/movie", {
      sort_by: "vote_average.desc",
      "vote_count.gte": "500",
      "vote_average.gte": "7",
      watch_region: "AU",
      with_watch_monetization_types: "flatrate",
      page: String(page),
    });

    for (const movie of data.results) {
      if (seenIds.has(movie.id)) continue;
      seenIds.add(movie.id);

      // Get movie details for IMDb ID
      let imdbId: string | null = null;
      try {
        const details = await tmdbFetch(`/movie/${movie.id}`);
        imdbId = details.imdb_id;
      } catch { /* skip */ }

      // Get ratings + providers in parallel
      const [omdb, douban, providers] = await Promise.all([
        imdbId ? getOMDBRatings(imdbId) : Promise.resolve({ imdb: null, rt: null, rtFresh: false }),
        imdbId ? getDoubanRating(imdbId) : Promise.resolve({ score: null, original: null }),
        getAUProviders(movie.id),
      ]);

      allMovies.push({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        posterPath: movie.poster_path,
        releaseDate: movie.release_date,
        genres: (movie.genre_ids as number[]).map(id => GENRES[id]).filter(Boolean).slice(0, 3),
        genreIds: movie.genre_ids,
        language: movie.original_language,
        imdbId,
        tmdbScore: movie.vote_average,
        imdb: omdb.imdb,
        rottenTomatoes: omdb.rt,
        rtFresh: omdb.rtFresh,
        douban: douban.score,
        doubanOriginal: douban.original,
        providers,
      });

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 250));
    }

    console.log(`  → ${allMovies.length} movies so far`);
  }

  // Sort by average of available scores
  allMovies.sort((a, b) => {
    const scoreA = [a.imdb, a.rottenTomatoes, a.douban].filter(s => s !== null);
    const scoreB = [b.imdb, b.rottenTomatoes, b.douban].filter(s => s !== null);
    const avgA = scoreA.length > 0 ? scoreA.reduce((sum, s) => sum + s!, 0) / scoreA.length : 0;
    const avgB = scoreB.length > 0 ? scoreB.reduce((sum, s) => sum + s!, 0) / scoreB.length : 0;
    return avgB - avgA;
  });

  // Write to file
  const fs = await import("fs");
  const outputPath = "src/data/top-movies.json";
  fs.writeFileSync(outputPath, JSON.stringify(allMovies, null, 2));

  console.log(`\nDone! ${allMovies.length} movies saved to ${outputPath}`);
  console.log(`Movies with all 3 ratings: ${allMovies.filter(m => m.imdb && m.rottenTomatoes && m.douban).length}`);
  console.log(`Movies with Douban: ${allMovies.filter(m => m.douban).length}`);
}

main().catch(console.error);
