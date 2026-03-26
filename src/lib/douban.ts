const DOUBANINFO_BASE = "https://doubaninfo.com/api/v1_douban.php";
const WMDB_BASE = "https://api.wmdb.tv/movie/api";

function getApiKey() {
  return process.env.DOUBANINFO_API_KEY ?? "";
}

export interface DoubanRating {
  score: number | null; // 0-100 scale (original 0-10 × 10)
  originalScore: number | null; // original 0-10 scale
}

export async function getDoubanRating(imdbId: string): Promise<DoubanRating> {
  // Try DoubanInfo API with retry
  const apiKey = getApiKey();
  if (apiKey) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        // Small delay between requests to avoid rate limiting
        if (attempt > 0) await new Promise((r) => setTimeout(r, 500));

        const url = new URL(DOUBANINFO_BASE);
        url.searchParams.set("url", imdbId);
        url.searchParams.set("key", apiKey);

        const res = await fetch(url.toString(), {
          next: { revalidate: 86400 },
          signal: AbortSignal.timeout(10000),
        });
        if (res.status === 429) {
          // Rate limited, wait and retry
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        if (res.ok) {
          const data = await res.json();
          const rawRating = data?.rating;
          const scoreStr = String(
            data?.douban_score ??
            (typeof rawRating === "number" ? rawRating : rawRating?.average) ??
            ""
          );
          const score = parseFloat(scoreStr);
          if (!isNaN(score) && score > 0) {
            return { score: Math.round(score * 10), originalScore: score };
          }
        }
        break; // Don't retry on non-429 errors
      } catch {
        // Timeout or network error, try next attempt
      }
    }
  }

  // Fallback: api.wmdb.tv
  try {
    const url = new URL(WMDB_BASE);
    url.searchParams.set("id", imdbId);

    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      // wmdb returns an array or object depending on query
      const item = Array.isArray(data) ? data[0] : data;
      const score = parseFloat(item?.doubanRating ?? "");
      if (!isNaN(score) && score > 0) {
        return { score: Math.round(score * 10), originalScore: score };
      }
    }
  } catch {
    // Return null if both fail
  }

  return { score: null, originalScore: null };
}
