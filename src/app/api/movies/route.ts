import { NextRequest, NextResponse } from "next/server";
import { getTrending, discoverMovies, getWatchProviders, getMovieDetails, posterUrl, genreNames, PROVIDER_INFO } from "@/lib/tmdb";
import { getRatings } from "@/lib/omdb";
import { getDoubanRating } from "@/lib/douban";
import { aggregateRatings } from "@/lib/ratings";
import topMoviesData from "@/data/top-movies.json";

// Pre-loaded top movies from JSON (built offline with build-movie-cache.ts)
const TOP_MOVIES = topMoviesData as Array<{
  id: number; title: string; overview: string; posterPath: string | null;
  releaseDate: string; genres: string[]; genreIds: number[]; language: string;
  imdbId: string | null; tmdbScore: number;
  imdb: number | null; rottenTomatoes: number | null; rtFresh: boolean;
  douban: number | null; doubanOriginal: number | null; providers: number[];
}>;

// In-memory cache for API-fetched results
const pageCache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 86400 * 1000;

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

// Try to serve from local JSON first (instant, no API calls)
function serveFromLocal(
  providerParam: string | null,
  genreParam: string | null,
  languageParam: string | null,
  sortParam: string,
  page: number
): { movies: unknown[]; hasMore: boolean } | null {
  const isNonEnglish = languageParam && languageParam !== "en";

  // For non-English or trending, fall through to API
  if (isNonEnglish || sortParam === "trending" || sortParam === "new") return null;

  let filtered = [...TOP_MOVIES];

  // Filter by provider
  if (providerParam) {
    const pid = parseInt(providerParam);
    filtered = filtered.filter(m => m.providers.includes(pid));
  }

  // Filter by genre
  if (genreParam) {
    const gid = parseInt(genreParam);
    filtered = filtered.filter(m => m.genreIds.includes(gid));
  }

  // Filter by language
  if (languageParam) {
    filtered = filtered.filter(m => m.language === languageParam);
  }

  if (filtered.length === 0) return null;

  // Paginate (12 per page)
  const perPage = 12;
  const start = (page - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);

  if (paged.length === 0 && page > 1) return { movies: [], hasMore: false };

  const movies = paged.map(m => ({
    id: m.id,
    title: m.title,
    overview: m.overview,
    posterUrl: m.posterPath ? `https://image.tmdb.org/t/p/w500${m.posterPath}` : "/placeholder-poster.svg",
    releaseDate: m.releaseDate,
    genres: m.genres,
    ratings: {
      imdb: m.imdb,
      rottenTomatoes: m.rottenTomatoes,
      rtFresh: m.rtFresh,
      douban: m.douban,
      doubanOriginal: m.doubanOriginal,
    },
    providers: m.providers,
  }));

  return { movies, hasMore: start + perPage < filtered.length };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const providerParam = searchParams.get("provider");
  const genreParam = searchParams.get("genre");
  const languageParam = searchParams.get("language");
  const sortParam = searchParams.get("sort") || "top_rated";
  const page = parseInt(searchParams.get("page") ?? "1") || 1;

  // === LAYER 0: Try local JSON (instant, no API calls) ===
  const localResult = serveFromLocal(providerParam, genreParam, languageParam, sortParam, page);
  if (localResult) {
    return NextResponse.json(localResult);
  }

  // === LAYER 1: Try page cache ===
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

    // Step 2: Get ratings in parallel
    const enriched = await Promise.all(
      baseEnriched.map(async ({ movie, imdbId, movieProviders }) => {
        let omdbRatings = { imdb: null as number | null, rottenTomatoes: null as number | null, rtFresh: false };
        let doubanRating = { score: null as number | null, originalScore: null as number | null };

        if (imdbId) {
          const [omdb, douban] = await Promise.all([
            getRatings(imdbId).catch(() => ({ imdb: null as number | null, rottenTomatoes: null as number | null, rtFresh: false })),
            getDoubanRating(imdbId).catch(() => ({ score: null as number | null, originalScore: null as number | null })),
          ]);
          omdbRatings = omdb;
          doubanRating = douban;
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
