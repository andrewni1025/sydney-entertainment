import { NextRequest, NextResponse } from "next/server";
import { getTrending, discoverMovies, getWatchProviders, getMovieDetails, posterUrl, genreNames, PROVIDER_INFO } from "@/lib/tmdb";
import { getRatings } from "@/lib/omdb";
import { getDoubanRating } from "@/lib/douban";
import { aggregateRatings } from "@/lib/ratings";

// === DUAL-LAYER CACHE ===
// Layer 1: Full page results (query → movie list)
const pageCache = new Map<string, { data: unknown; ts: number }>();
// Layer 2: Individual movie ratings (imdbId → ratings) — persists across different queries
const ratingsCache = new Map<string, { data: { omdb: { imdb: number | null; rottenTomatoes: number | null; rtFresh: boolean }; douban: { score: number | null; originalScore: number | null } }; ts: number }>();
const CACHE_TTL = 86400 * 1000; // 24 hours

function getCached<T>(key: string): T | null {
  const entry = pageCache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T;
  return null;
}

function setPageCache(key: string, data: unknown) {
  pageCache.set(key, { data, ts: Date.now() });
  if (pageCache.size > 500) {
    const oldest = [...pageCache.entries()].sort((a, b) => a[1].ts - b[1].ts).slice(0, 100);
    for (const [k] of oldest) pageCache.delete(k);
  }
}

function getCachedRatings(imdbId: string) {
  const entry = ratingsCache.get(imdbId);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCachedRatings(imdbId: string, omdb: { imdb: number | null; rottenTomatoes: number | null; rtFresh: boolean }, douban: { score: number | null; originalScore: number | null }) {
  ratingsCache.set(imdbId, { data: { omdb, douban }, ts: Date.now() });
  if (ratingsCache.size > 2000) {
    const oldest = [...ratingsCache.entries()].sort((a, b) => a[1].ts - b[1].ts).slice(0, 500);
    for (const [k] of oldest) ratingsCache.delete(k);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const providerParam = searchParams.get("provider");
  const genreParam = searchParams.get("genre");
  const languageParam = searchParams.get("language");
  const sortParam = searchParams.get("sort") || "top_rated";
  const page = parseInt(searchParams.get("page") ?? "1") || 1;

  const cacheKey = `movies:${providerParam ?? "all"}:${genreParam ?? "all"}:${languageParam ?? "all"}:${sortParam}:${page}`;
  const cached = getCached<{ movies: unknown[]; hasMore: boolean }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    // Fetch from TMDB
    const useDiscover = providerParam || genreParam || languageParam || sortParam !== "trending";
    const tmdbData = useDiscover
      ? await discoverMovies({
          providerId: providerParam ? parseInt(providerParam) : 0,
          page,
          genreId: genreParam ? parseInt(genreParam) : undefined,
          language: languageParam || undefined,
          sort: sortParam as "trending" | "top_rated" | "new",
        })
      : await getTrending(page);

    const isNonEnglish = languageParam && languageParam !== "en";

    // Step 1: Get movie details + IMDb IDs + providers (all parallel)
    const baseEnriched = await Promise.all(
      tmdbData.results.slice(0, 12).map(async (movie) => {
        let imdbId: string | null = null;
        try {
          const details = await getMovieDetails(movie.id);
          imdbId = details.imdb_id;
        } catch { /* skip */ }

        const providers = isNonEnglish
          ? []
          : await getWatchProviders(movie.id).catch(() => []);

        const supportedProviderIds = Object.keys(PROVIDER_INFO).map(Number);
        const movieProviders = providers
          .map((p: { id: number }) => p.id)
          .filter((id: number) => supportedProviderIds.includes(id));

        return { movie, imdbId, movieProviders };
      })
    );

    // Step 2: Get ratings — check cache first, then batch fetch missing ones
    const enriched = await Promise.all(
      baseEnriched.map(async ({ movie, imdbId, movieProviders }) => {
        let omdbRatings = { imdb: null as number | null, rottenTomatoes: null as number | null, rtFresh: false };
        let doubanRating = { score: null as number | null, originalScore: null as number | null };

        if (imdbId) {
          // Check ratings cache first
          const cached = getCachedRatings(imdbId);
          if (cached) {
            omdbRatings = cached.omdb;
            doubanRating = cached.douban;
          } else {
            // Fetch OMDB + Douban in parallel (with timeout protection)
            const [omdb, douban] = await Promise.all([
              getRatings(imdbId).catch(() => ({ imdb: null as number | null, rottenTomatoes: null as number | null, rtFresh: false })),
              getDoubanRating(imdbId).catch(() => ({ score: null as number | null, originalScore: null as number | null })),
            ]);
            omdbRatings = omdb;
            doubanRating = douban;
            // Cache the ratings for this movie
            setCachedRatings(imdbId, omdb, douban);
          }
        }

        const ratings = aggregateRatings(omdbRatings, doubanRating, movie.vote_average);

        return {
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          posterUrl: posterUrl(movie.poster_path),
          releaseDate: movie.release_date,
          genres: genreNames(movie.genre_ids),
          ratings,
          providers: movieProviders,
        };
      })
    );

    const result = {
      movies: enriched,
      hasMore: tmdbData.page < tmdbData.total_pages,
    };

    setPageCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Movies API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}
