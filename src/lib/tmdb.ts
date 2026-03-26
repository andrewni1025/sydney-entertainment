const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function getApiKey() {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set");
  return key;
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", getApiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  return res.json();
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
}

interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

interface WatchProviderResult {
  results: Record<string, {
    link: string;
    flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
  }>;
}

interface MovieDetails extends TMDBMovie {
  imdb_id: string | null;
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string;
}

// AU streaming provider IDs (from TMDB/JustWatch)
export const AU_PROVIDERS: Record<string, number> = {
  netflix: 8,
  stan: 21,
  "disney+": 337,
  binge: 385,
};

export const PROVIDER_INFO: Record<number, { name: string; color: string; short: string }> = {
  8: { name: "Netflix", color: "#E50914", short: "N" },
  21: { name: "Stan", color: "#0073E6", short: "S" },
  337: { name: "Disney+", color: "#113CCF", short: "D+" },
  385: { name: "BINGE", color: "#E6005A", short: "B" },
};

export function posterUrl(path: string | null, size: string = "w500"): string {
  if (!path) return "/placeholder-poster.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export async function getTrending(page = 1): Promise<TMDBResponse> {
  return tmdbFetch<TMDBResponse>("/trending/movie/week", {
    page: String(page),
    region: "AU",
  });
}

export async function discoverByProvider(providerId: number, page = 1, genreId?: number, language?: string): Promise<TMDBResponse> {
  return discoverMovies({ providerId, page, genreId, language, sort: "trending" });
}

interface DiscoverOptions {
  providerId?: number;
  page?: number;
  genreId?: number;
  language?: string;
  sort?: "trending" | "top_rated" | "new";
}

export async function discoverMovies(opts: DiscoverOptions = {}): Promise<TMDBResponse> {
  const { providerId = 0, page = 1, genreId, language, sort = "top_rated" } = opts;
  const isNonEnglish = language && language !== "en";

  const params: Record<string, string> = {
    page: String(page),
  };

  // Only restrict to AU streaming when not filtering by non-English language
  if (!isNonEnglish) {
    params.watch_region = "AU";
    params.with_watch_monetization_types = "flatrate";
  }

  // Sort strategy
  if (sort === "top_rated") {
    params.sort_by = "vote_average.desc";
    params["vote_count.gte"] = isNonEnglish ? "100" : "500";
    params["vote_average.gte"] = isNonEnglish ? "6.5" : "7";
  } else if (sort === "new") {
    params.sort_by = "primary_release_date.desc";
    params["vote_count.gte"] = isNonEnglish ? "20" : "50";
    params["primary_release_date.lte"] = new Date().toISOString().split("T")[0];
  } else {
    params.sort_by = "popularity.desc";
  }

  if (providerId > 0) {
    params.with_watch_providers = String(providerId);
    // If provider is selected, always need watch_region
    params.watch_region = "AU";
    params.with_watch_monetization_types = "flatrate";
  }
  if (genreId) {
    params.with_genres = String(genreId);
  }
  if (language) {
    params.with_original_language = language;
  }

  return tmdbFetch<TMDBResponse>("/discover/movie", params);
}

export async function getWatchProviders(movieId: number) {
  const data = await tmdbFetch<WatchProviderResult>(`/movie/${movieId}/watch/providers`);
  const au = data.results?.AU;
  if (!au?.flatrate) return [];
  return au.flatrate.map((p) => ({
    id: p.provider_id,
    name: p.provider_name,
    logo: posterUrl(p.logo_path, "w92"),
  }));
}

export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  return tmdbFetch<MovieDetails>(`/movie/${movieId}`);
}

// Genre lookup
const GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
};

export function genreNames(ids: number[]): string[] {
  return ids.map((id) => GENRES[id]).filter(Boolean).slice(0, 3);
}
