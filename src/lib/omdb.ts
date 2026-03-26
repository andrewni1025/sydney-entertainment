const OMDB_BASE = "https://www.omdbapi.com";

function getApiKey() {
  const key = process.env.OMDB_API_KEY;
  if (!key) throw new Error("OMDB_API_KEY is not set");
  return key;
}

export interface OMDBRatings {
  imdb: number | null;       // 0-100 scale
  rottenTomatoes: number | null; // 0-100 scale
  rtFresh: boolean;           // true if >= 60%
}

interface OMDBResponse {
  Response: string;
  imdbRating?: string;
  Ratings?: { Source: string; Value: string }[];
}

export async function getRatings(imdbId: string): Promise<OMDBRatings> {
  const url = new URL(OMDB_BASE);
  url.searchParams.set("apikey", getApiKey());
  url.searchParams.set("i", imdbId);
  url.searchParams.set("type", "movie");

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) return { imdb: null, rottenTomatoes: null, rtFresh: false };

  const data: OMDBResponse = await res.json();
  if (data.Response !== "True") return { imdb: null, rottenTomatoes: null, rtFresh: false };

  // IMDb rating (0-10 → 0-100)
  const imdbRaw = parseFloat(data.imdbRating ?? "");
  const imdb = isNaN(imdbRaw) ? null : Math.round(imdbRaw * 10);

  // Rotten Tomatoes from Ratings array
  let rottenTomatoes: number | null = null;
  const rtEntry = data.Ratings?.find((r) => r.Source === "Rotten Tomatoes");
  if (rtEntry) {
    const parsed = parseInt(rtEntry.Value);
    if (!isNaN(parsed)) rottenTomatoes = parsed;
  }

  return {
    imdb,
    rottenTomatoes,
    rtFresh: (rottenTomatoes ?? 0) >= 60,
  };
}
