import json, os, sys, time, urllib.error, urllib.request
from pathlib import Path

BATCH_SIZE = int(sys.argv[1]) if len(sys.argv) > 1 else 100

ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = ROOT / ".env.local"
MOVIES_PATH = ROOT / "src" / "data" / "top-movies.json"


def load_tmdb_key() -> str:
    env_key = os.environ.get("TMDB_API_KEY", "")
    if env_key:
        return env_key

    if ENV_PATH.exists():
        with ENV_PATH.open(encoding="utf-8") as env_file:
            for line in env_file:
                if line.startswith("TMDB_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")

    return ""


TMDB_KEY = load_tmdb_key()
if not TMDB_KEY:
    print("ERROR: No TMDB_API_KEY found")
    raise SystemExit(1)

with MOVIES_PATH.open(encoding="utf-8") as movies_file:
    movies = json.load(movies_file)

added = 0
errors = 0
for movie in movies:
    if movie.get("overviewZh"):
        continue
    if added >= BATCH_SIZE:
        break

    movie_id = movie["id"]
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_KEY}&language=zh-CN"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read())
            zh_overview = data.get("overview", "")
            if zh_overview and zh_overview != movie.get("overview", ""):
                movie["overviewZh"] = zh_overview
                added += 1
    except KeyboardInterrupt:
        print(f"Interrupted at {added}, saving...")
        break
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        errors += 1
        if errors <= 5:
            print(f"  Error {movie_id}: {exc}")

    if added % 2 == 0:
        time.sleep(1)
    if added > 0 and added % 10 == 0:
        print(f"  added={added}")
        with MOVIES_PATH.open("w", encoding="utf-8") as movies_file:
            json.dump(movies, movies_file, indent=2, ensure_ascii=False)

with MOVIES_PATH.open("w", encoding="utf-8") as movies_file:
    json.dump(movies, movies_file, indent=2, ensure_ascii=False)

print(f"Done: added={added}, errors={errors}")
