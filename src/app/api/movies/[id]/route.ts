import { NextResponse } from "next/server";
import { getMovieDetails, getWatchProviders, posterUrl, PROVIDER_INFO } from "@/lib/tmdb";
import { getRatings } from "@/lib/omdb";
import { getDoubanRating } from "@/lib/douban";
import { aggregateRatings } from "@/lib/ratings";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const movieId = parseInt(id);
  if (isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  try {
    const details = await getMovieDetails(movieId);

    const [omdbRatings, doubanRating, providers] = await Promise.all([
      details.imdb_id
        ? getRatings(details.imdb_id)
        : Promise.resolve({ imdb: null, rottenTomatoes: null, rtFresh: false }),
      details.imdb_id
        ? getDoubanRating(details.imdb_id)
        : Promise.resolve({ score: null, originalScore: null }),
      getWatchProviders(movieId).catch(() => []),
    ]);

    const ratings = aggregateRatings(omdbRatings, doubanRating);
    const supportedProviderIds = Object.keys(PROVIDER_INFO).map(Number);

    return NextResponse.json({
      id: details.id,
      title: details.title,
      overview: details.overview,
      posterUrl: posterUrl(details.poster_path),
      backdropUrl: posterUrl(details.backdrop_path, "w1280"),
      releaseDate: details.release_date,
      runtime: details.runtime,
      tagline: details.tagline,
      genres: details.genres.map((g) => g.name),
      ratings,
      providers: providers
        .map((p: { id: number }) => p.id)
        .filter((pid: number) => supportedProviderIds.includes(pid)),
    });
  } catch (error) {
    console.error("Movie detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie details" },
      { status: 500 }
    );
  }
}
