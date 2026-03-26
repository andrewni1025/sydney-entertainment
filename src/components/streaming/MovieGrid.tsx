"use client";

import MovieCard, { MovieData } from "./MovieCard";

interface MovieGridProps {
  movies: MovieData[];
  loading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="aspect-[2/3] bg-white/5" />
    </div>
  );
}

export default function MovieGrid({ movies, loading, onLoadMore, hasMore }: MovieGridProps) {
  if (loading && movies.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-20 text-white/30">
        <p className="text-lg">No movies found</p>
        <p className="text-sm mt-2">Try a different platform or check back later</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {movies.map((movie, i) => (
          <MovieCard key={movie.id} movie={movie} index={i} />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="glass glass-hover px-8 py-3 rounded-full text-sm font-medium text-white/60 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
