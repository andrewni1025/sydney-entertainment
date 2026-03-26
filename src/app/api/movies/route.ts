import { NextRequest, NextResponse } from "next/server";
import { getTrending, discoverMovies, getWatchProviders, getMovieDetails, posterUrl, genreNames, PROVIDER_INFO } from "@/lib/tmdb";
import { getRatings } from "@/lib/omdb";
import { getDoubanRating } from "@/lib/douban";
import { aggregateRatings } from "@/lib/ratings";

// In-memory cache for enriched movie data (24h TTL)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 86400 * 1000; // 24 hours

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T;
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
  // Clean old entries if cache gets too big
  if (cache.size > 500) {
    const oldest = [...cache.entries()]
      .sort((a, b) => a[1].ts - b[1].ts)
      .slice(0, 100);
    for (const [k] of oldest) cache.delete(k);
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

    // Enrich each movie with details, OMDB ratings, and providers (parallel is fine)
    const baseEnriched = await Promise.all(
      tmdbData.results.slice(0, 12).map(async (movie) => {
        let imdbId: string | null = null;
        try {
          const details = await getMovieDetails(movie.id);
          imdbId = details.imdb_id;
        } catch {
          // Skip if details fail
        }

        // For non-English, skip provider lookup (no AU streaming filter anyway)
        const [omdbRatings, providers] = await Promise.all([
          imdbId ? getRatings(imdbId) : Promise.resolve({ imdb: null, rottenTomatoes: null, rtFresh: false }),
          isNonEnglish ? Promise.resolve([]) : getWatchProviders(movie.id).catch(() => []),
        ]);

        const supportedProviderIds = Object.keys(PROVIDER_INFO).map(Number);
        const movieProviders = providers
          .map((p: { id: number }) => p.id)
          .filter((id: number) => supportedProviderIds.includes(id));

        return { movie, imdbId, omdbRatings, movieProviders };
      })
    );

    // Fetch Douban ratings — batch 3 at a time for non-English, sequential for English
    const enriched = [];
    if (isNonEnglish) {
      // Batch parallel for non-English (Douban likely has these, speed matters)
      const batchSize = 3;
      for (let i = 0; i < baseEnriched.length; i += batchSize) {
        const batch = baseEnriched.slice(i, i + batchSize);
        const doubanResults = await Promise.all(
          batch.map(item =>
            item.imdbId
              ? getDoubanRating(item.imdbId)
              : Promise.resolve({ score: null as number | null, originalScore: null as number | null })
          )
        );
        for (let j = 0; j < batch.length; j++) {
          const { movie, omdbRatings, movieProviders } = batch[j];
          const ratings = aggregateRatings(omdbRatings, doubanResults[j], movie.vote_average);
          enriched.push({
            id: movie.id, title: movie.title, overview: movie.overview,
            posterUrl: posterUrl(movie.poster_path), releaseDate: movie.release_date,
            genres: genreNames(movie.genre_ids), ratings, providers: movieProviders,
          });
        }
        if (i + batchSize < baseEnriched.length) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    } else {
      // Sequential for English (more movies, rate limit cautious)
      for (const item of baseEnriched) {
        const { movie, imdbId, omdbRatings, movieProviders } = item;
        let doubanRating = { score: null as number | null, originalScore: null as number | null };
        if (imdbId) {
          doubanRating = await getDoubanRating(imdbId);
          await new Promise((r) => setTimeout(r, 200));
        }

        const ratings = aggregateRatings(omdbRatings, doubanRating, movie.vote_average);

        enriched.push({
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          posterUrl: posterUrl(movie.poster_path),
          releaseDate: movie.release_date,
          genres: genreNames(movie.genre_ids),
          ratings,
          providers: movieProviders,
        });
      }
    }

    const result = {
      movies: enriched,
      hasMore: tmdbData.page < tmdbData.total_pages,
    };

    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Movies API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}
