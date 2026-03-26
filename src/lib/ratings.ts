import type { OMDBRatings } from "./omdb";
import type { DoubanRating } from "./douban";

export interface AggregatedRatings {
  imdb: number | null;          // 0-100
  rottenTomatoes: number | null; // 0-100
  rtFresh: boolean;
  douban: number | null;         // 0-100
  doubanOriginal: number | null; // 0-10 (for display)
}

export function aggregateRatings(
  omdb: OMDBRatings,
  douban: DoubanRating,
  tmdbScore?: number | null
): AggregatedRatings {
  // Use TMDB score as fallback if OMDB has no IMDb rating
  const imdb = omdb.imdb ?? (tmdbScore ? Math.round(tmdbScore * 10) : null);
  return {
    imdb,
    rottenTomatoes: omdb.rottenTomatoes,
    rtFresh: omdb.rtFresh,
    douban: douban.score,
    doubanOriginal: douban.originalScore,
  };
}

export function formatScore(score: number | null): string {
  if (score === null) return "—";
  return String(score);
}

export function formatDoubanScore(original: number | null): string {
  if (original === null) return "—";
  return original.toFixed(1);
}
